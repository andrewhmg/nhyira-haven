using NhyiraHaven.Data;
using NhyiraHaven.Models;
using NhyiraHaven.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework Core - Support both SQLite (dev) and PostgreSQL (production)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"]
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

// Convert Render's postgresql:// URL to Npgsql format if needed
if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgresql://"))
{
    // Render provides: postgresql://user:pass@host:port/db
    // Npgsql needs: Host=host;Port=port;Database=db;Username=user;Password=pass
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.Trim('/')};Username={userInfo[0]};Password={userInfo[1]}";
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

if (string.IsNullOrEmpty(jwtKey))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = "NhyiraHaven2026SecretKeyForDevelopmentOnly!";
    }
    else
    {
        throw new InvalidOperationException("JWT key must be configured in production via Jwt__Key environment variable.");
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
        "https://frontend.vercel.app"
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

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
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Apply migrations automatically - use EnsureCreated for existing database
        Console.WriteLine("Checking database...");
        try
        {
            context.Database.Migrate();
            Console.WriteLine("Database migrated successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed (expected if already exists): {ex.Message}");
            Console.WriteLine("Using EnsureCreated as fallback...");
            context.Database.EnsureCreated();
        }

        await DbInitializer.SeedRolesAndAdminAsync(services);
        Console.WriteLine("Roles and test accounts seeded");

        // Seed full CSV data if available
        var csvPath = FindCsvPath();
        Console.WriteLine($"Looking for CSV data...");
        Console.WriteLine($"CSV path found: {csvPath ?? "none"}");
        if (csvPath != null)
        {
            Console.WriteLine("Found CSV data - seeding full dataset...");
            var seeder = new DataSeeder(context, csvPath);
            await seeder.SeedAllAsync();
        }
        else
        {
            Console.WriteLine("No CSV data found - seeding sample data...");
            var prodSeeder = new ProductionSeeder(context);
            await prodSeeder.SeedSampleDataAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Continue running even if database fails
    }
}

// One-time admin seed endpoint (protected)
app.MapPost("/api/admin/seed-users", async (ApplicationDbContext context, IConfiguration config) =>
{
    try
    {
        var userManager = new UserManager<ApplicationUser>(
            new UserStore<ApplicationUser>(context),
            config,
            new PasswordHasher<ApplicationUser>(),
            Array.Empty<IUserValidator<ApplicationUser>>(),
            Array.Empty<IPasswordValidator<ApplicationUser>>(),
            new PasswordHasher<ApplicationUser>(),
            Array.Empty<IUserValidator<ApplicationUser>>(),
            Array.Empty<IPasswordValidator<ApplicationUser>>());
        
        // Just call DbInitializer
        await DbInitializer.SeedRolesAndAdminAsync(app.Services);
        return Results.Ok(new { message = "Users seeded successfully" });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Failed to seed: {ex.Message}");
    }
}).RequireAuthorization();

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

app.Run();
