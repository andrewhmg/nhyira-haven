using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public IncidentReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncidentReport>>> GetIncidentReports(int? residentId = null)
    {
        var query = _context.IncidentReports.AsQueryable();
        if (residentId.HasValue) query = query.Where(i => i.ResidentId == residentId.Value);
        return await query.Include(i => i.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IncidentReport>> GetIncidentReport(int id)
    {
        var report = await _context.IncidentReports.FindAsync(id);
        if (report == null) return NotFound();
        return report;
    }

    [HttpPost]
    public async Task<ActionResult<IncidentReport>> PostIncidentReport(IncidentReport report)
    {
        _context.IncidentReports.Add(report);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetIncidentReport), new { id = report.Id }, report);
    }
}
