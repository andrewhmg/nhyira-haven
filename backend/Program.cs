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
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "NhyiraHaven2026SecretKeyForDevelopmentOnly!"))
    };
});

builder.Services.AddAuthorization();

// Seeder (created inline when needed)
// builder.Services.AddScoped<DataSeeder>();

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "https://nhyira-haven.azurewebsites.net",
                "https://frontend-chi-woad-55.vercel.app",
                "https://frontend.vercel.app"
              )
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

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

// Root endpoint
app.MapGet("/", () => "Nhyira Haven API - Running");

// Seed data endpoint (development only)
app.MapPost("/api/seed", async (ApplicationDbContext context, IWebHostEnvironment env) =>
{
    if (!env.IsDevelopment())
        return Results.Forbid();

    var csvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "lighthouse_csv_v7");
    if (!Directory.Exists(csvPath))
        return Results.NotFound("CSV data not found");

    var seeder = new DataSeeder(context, csvPath);
    await seeder.SeedAllAsync();

    return Results.Ok(new { message = "Data seeded successfully" });
});

// Seed roles and admin accounts
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Apply migrations automatically
        Console.WriteLine("Applying database migrations...");
        context.Database.EnsureCreated();
        Console.WriteLine("✅ Database created/migrated successfully");
        
        await DbInitializer.SeedRolesAndAdminAsync(services);
        Console.WriteLine("✅ Roles and test accounts seeded");
        
        // Seed sample data for demo
        var prodSeeder = new ProductionSeeder(context);
        await prodSeeder.SeedSampleDataAsync();
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
    var csvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "lighthouse_csv_v7");
    
    if (Directory.Exists(csvPath))
    {
        var seeder = new DataSeeder(context, csvPath);
        await seeder.SeedAllAsync();
    }
    else
    {
        Console.WriteLine($"CSV data not found at {csvPath}");
    }
    
    return;
}

app.Run();
