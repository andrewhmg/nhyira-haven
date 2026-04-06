using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NhyiraHaven.Data;

/// <summary>
/// Design-time factory for EF Core migrations.
/// Used when running 'dotnet ef migrations add' commands.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Default to SQLite for local development
        optionsBuilder.UseSqlite("Data Source=nhyira-haven.db");
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}