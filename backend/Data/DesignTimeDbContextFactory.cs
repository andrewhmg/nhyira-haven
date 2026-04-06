using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using NhyiraHaven.Data;

namespace NhyiraHaven.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Use PostgreSQL for Supabase production migrations
        var connectionString = "Host=db.zuyyebiltbkzkooegbrs.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=adminpasswordteam12;SSL Mode=Prefer;Trust Server Certificate=true";
        
        optionsBuilder.UseNpgsql(connectionString);
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}