using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/dashboard/overview
    [HttpGet("overview")]
    public async Task<ActionResult<object>> GetDashboardOverview()
    {
        var totalResidents = await _context.Residents.CountAsync();
        var activeResidents = await _context.Residents.CountAsync(r => r.IsActive);
        var totalSafehouses = await _context.Safehouses.CountAsync(s => s.IsActive);
        var totalSupporters = await _context.Supporters.CountAsync();
        var atRiskSupporters = await _context.Supporters.CountAsync(s => s.IsAtRisk);
        
        var totalDonations = await _context.Donations
            .Where(d => d.DonationType == "Monetary")
            .SumAsync(d => d.Amount);
        
        var recentDonations = await _context.Donations
            .OrderByDescending(d => d.DonationDate)
            .Take(10)
            .Include(d => d.Supporter)
            .ToListAsync();

        var recentIncidents = await _context.IncidentReports
            .OrderByDescending(ir => ir.IncidentDate)
            .Take(5)
            .Include(ir => ir.Resident)
            .ToListAsync();

        return new
        {
            Residents = new
            {
                Total = totalResidents,
                Active = activeResidents,
                Inactive = totalResidents - activeResidents
            },
            Safehouses = new
            {
                Total = totalSafehouses
            },
            Supporters = new
            {
                Total = totalSupporters,
                AtRisk = atRiskSupporters
            },
            Donations = new
            {
                TotalAmount = totalDonations,
                Recent = recentDonations.Select(d => new
                {
                    d.Id,
                    d.Amount,
                    d.DonationDate,
                    SupporterName = d.Supporter != null ? $"{d.Supporter.FirstName} {d.Supporter.LastName}" : "Unknown"
                }).ToList()
            },
            RecentIncidents = recentIncidents.Select(ir => new
            {
                ir.Id,
                ir.IncidentType,
                ir.Severity,
                ir.IncidentDate,
                ResidentName = ir.Resident != null ? $"{ir.Resident.FirstName} {ir.Resident.LastName}" : "Unknown"
            }).ToList()
        };
    }

    // GET: api/dashboard/metrics
    [HttpGet("metrics")]
    public async Task<ActionResult<object>> GetDashboardMetrics()
    {
        var donationsByMonth = await _context.Donations
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Total = g.Sum(d => d.Amount),
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        var residentsBySafehouse = await _context.Residents
            .GroupBy(r => r.SafehouseId)
            .Select(g => new
            {
                SafehouseId = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var incidentsByType = await _context.IncidentReports
            .GroupBy(ir => ir.IncidentType)
            .Select(g => new
            {
                Type = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return new
        {
            DonationsByMonth = donationsByMonth,
            ResidentsBySafehouse = residentsBySafehouse,
            IncidentsByType = incidentsByType
        };
    }
}