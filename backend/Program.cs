using NhyiraHaven.Data;
using NhyiraHaven.Models;
using NhyiraHaven.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Seeder (created inline when needed)
// builder.Services.AddScoped<DataSeeder>();

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://nhyira-haven.azurewebsites.net")
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
