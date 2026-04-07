using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using NhyiraHaven.Data;

namespace NhyiraHaven.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Use environment variable for connection string, fall back to SQLite for local dev
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");

        if (!string.IsNullOrEmpty(connectionString))
        {
            optionsBuilder.UseNpgsql(connectionString);
        }
        else
        {
            optionsBuilder.UseSqlite("Data Source=nhyira-haven.db");
        }
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}