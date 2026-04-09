using NhyiraHaven.Data;
using NhyiraHaven.Models;
using NhyiraHaven.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Required for SQLite-to-PostgreSQL DateTime compatibility
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

try
{
    Console.WriteLine($"Starting NhyiraHaven API at {DateTime.UtcNow:O}");
    Console.WriteLine($"Environment: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}");
    Console.WriteLine($"Working directory: {Directory.GetCurrentDirectory()}");

    var builder = WebApplication.CreateBuilder(args);

    Console.WriteLine("Builder created successfully");

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework Core - Support both SQLite (dev) and PostgreSQL (production)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"]
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

// Convert postgresql:// URL to Npgsql format if needed (e.g., from Render, Neon, Supabase)
if (!string.IsNullOrEmpty(connectionString) && (connectionString.StartsWith("postgresql://") || connectionString.StartsWith("postgres://")))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    var password = userInfo.Length > 1 ? userInfo[1] : "";
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.Trim('/');
    
    var npgsqlStr = $"Host={uri.Host};Port={port};Database={database};Username={userInfo[0]};Password={password};";
    
    // Neon & Azure require SSL. Extract from query or force it.
    if (!string.IsNullOrEmpty(uri.Query))
    {
        var query = uri.Query.TrimStart('?');
        var pairs = query.Split('&');
        foreach (var pair in pairs)
        {
            var kv = pair.Split('=');
            if (kv.Length == 2)
            {
                if (kv[0].ToLower() == "sslmode" && kv[1].ToLower() == "require") 
                    npgsqlStr += "Ssl Mode=Require;Trust Server Certificate=true;";
                else if (kv[0].ToLower() == "options") 
                    npgsqlStr += $"Options={Uri.UnescapeDataString(kv[1])};";
            }
        }
    }
    
    // If we're using Neon or Azure and it wasn't specified in the query string, we should probably add SSL
    if (uri.Host.Contains("neon.tech") || uri.Host.Contains("database.windows.net") || uri.Host.Contains("postgres.database.azure.com"))
    {
        if (!npgsqlStr.Contains("Ssl Mode"))
        {
            npgsqlStr += "Ssl Mode=Require;Trust Server Certificate=true;";
        }
    }

    connectionString = npgsqlStr;
}

var usePostgres = !string.IsNullOrEmpty(connectionString) &&
    (connectionString.Contains("Host=") || connectionString.Contains("postgres") || connectionString.Contains("supabase"));

Console.WriteLine($"Connection string detected: {(usePostgres ? "PostgreSQL" : "SQLite")}");

if (usePostgres)
{
    // PostgreSQL (Render/Supabase/Azure)
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // SQLite (Development)
    var sqliteConnection = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=nhyira-haven.db";
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(sqliteConnection));
}

// Identity with custom password policies
var identityOptions = PasswordPolicy.GetIdentityOptions();
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password = identityOptions.Password;
    options.User = identityOptions.User;
    options.SignIn = identityOptions.SignIn;
    options.Lockout = identityOptions.Lockout;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? Environment.GetEnvironmentVariable("Jwt__Key");

if (string.IsNullOrEmpty(jwtKey) || (!builder.Environment.IsDevelopment() && jwtKey == "NhyiraHaven2026SecretKeyForDevelopmentOnly!"))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = "NhyiraHaven2026SecretKeyForDevelopmentOnly!";
    }
    else
    {
        throw new InvalidOperationException("JWT key must be configured in production via Jwt__Key environment variable. IMPORTANT: The development key cannot be used in production.");
    }
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NhyiraHaven",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NhyiraHaven",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// CORS for frontend - configurable via environment variable
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',')
    ?? new[] {
        "http://localhost:5173",
        "https://nhyira-haven.azurewebsites.net",
        "https://frontend-chi-woad-55.vercel.app",
        "https://frontend.vercel.app",
        "https://zealous-hill-057c4580f.1.azurestaticapps.net"
    };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Security Headers
app.Use(async (context, next) =>
{
    // Content Security Policy
    context.Response.Headers["Content-Security-Policy"] = 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://nhyira-haven-api.azurewebsites.net https://db.zuyyebiltbkzkooegbrs.supabase.co;";
    
    // X-Content-Type-Options
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    
    // X-Frame-Options (prevent clickjacking)
    context.Response.Headers["X-Frame-Options"] = "DENY";
    
    // X-XSS-Protection
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    
    // Referrer-Policy
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    await next();
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Root endpoint
app.MapGet("/", () => "Nhyira Haven API - Running");

// Helper to find CSV data in multiple locations
static string? FindCsvPath()
{
    var candidates = new[]
    {
        Path.Combine(Directory.GetCurrentDirectory(), "data", "lighthouse_csv_v7"),           // Docker (root Dockerfile copies here)
        Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "lighthouse_csv_v7"),      // Local dev from /backend
        "/app/data/lighthouse_csv_v7",                                                         // Absolute Docker path
        "/data/lighthouse_csv_v7"                                                              // Legacy Docker path
    };

    foreach (var path in candidates)
    {
        if (Directory.Exists(path))
            return path;
    }
    return null;
}

// Seed data endpoint (development only)
app.MapPost("/api/seed", async (ApplicationDbContext context, IWebHostEnvironment env) =>
{
    if (!env.IsDevelopment())
        return Results.Forbid();

    var csvPath = FindCsvPath();
    if (csvPath == null)
        return Results.NotFound("CSV data not found");

    var seeder = new DataSeeder(context, csvPath);
    await seeder.SeedAllAsync();

    return Results.Ok(new { message = "Data seeded successfully" });
});

// Seed sample data endpoint (available in production)
app.MapPost("/api/seed-sample", async (ApplicationDbContext context, IWebHostEnvironment env) =>
{
    try
    {
        var csvPath = FindCsvPath();
        if (csvPath != null)
        {
            var seeder = new DataSeeder(context, csvPath);
            await seeder.SeedAllAsync();
            return Results.Ok(new { message = "Full CSV data seeded successfully" });
        }
        else
        {
            var prodSeeder = new ProductionSeeder(context);
            await prodSeeder.SeedSampleDataAsync();
            return Results.Ok(new { message = "Sample data seeded successfully" });
        }
    }
    catch (Exception ex)
    {
        return Results.Problem($"Failed to seed: {ex.Message}");
    }
});

// Seed roles and admin accounts
// Check if already seeded to avoid re-seeding on every restart
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Apply migrations automatically
        Console.WriteLine("Checking database...");
        context.Database.Migrate();
        Console.WriteLine("Database ready");

        // Only seed if no data exists
        if (!await context.Roles.AnyAsync())
        {
            await DbInitializer.SeedRolesAndAdminAsync(services);
            Console.WriteLine("✅ Roles and test accounts seeded");
        }
        else
        {
            Console.WriteLine("Roles already exist - skipping role seed");
        }

        // Seed CSV data if no residents exist
        if (!await context.Residents.AnyAsync())
        {
            var csvPath = FindCsvPath();
            if (csvPath != null)
            {
                Console.WriteLine($"📊 Found CSV data at {csvPath} - seeding...");
                var seeder = new DataSeeder(context, csvPath);
                await seeder.SeedAllAsync();
                Console.WriteLine("✅ Full CSV data seeded");
            }
            else
            {
                Console.WriteLine("⚠️ No CSV data found - seeding sample data...");
                var prodSeeder = new ProductionSeeder(context);
                await prodSeeder.SeedSampleDataAsync();
                Console.WriteLine("✅ Sample data seeded");
            }
        }
        else
        {
            Console.WriteLine("Residents already exist - skipping data seed");
        }

        // Create donor login accounts for all supporters
        await DbInitializer.SeedDonorAccountsAsync(services);
        Console.WriteLine("Donor accounts synced");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Database initialization failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Continue running even if database fails
    }
}

// Run seed command if passed as argument
if (args.Length > 0 && args[0] == "seed")
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var csvPath = FindCsvPath();

    if (csvPath != null)
    {
        var seeder = new DataSeeder(context, csvPath);
        await seeder.SeedAllAsync();
    }
    else
    {
        Console.WriteLine("CSV data not found in any expected location");
    }

    return;
}

// Debug endpoint - remove after testing
app.MapGet("/api/debug/csv-path", () => {
    var candidates = new[]
    {
        Path.Combine(Directory.GetCurrentDirectory(), "data", "lighthouse_csv_v7"),
        Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "lighthouse_csv_v7"),
        "/app/data/lighthouse_csv_v7",
        "/data/lighthouse_csv_v7"
    };
    foreach (var path in candidates)
    {
        if (Directory.Exists(path))
            return Results.Ok(new { foundPath = path, files = Directory.GetFiles(path) });
    }
    return Results.NotFound(new { message = "CSV path not found", candidates });
});

app.Run();
    Console.WriteLine("Application started successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL ERROR: {ex.GetType().Name}");
    Console.WriteLine($"Message: {ex.Message}");
    Console.WriteLine($"Stack trace:\n{ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
    }
    throw;
}
