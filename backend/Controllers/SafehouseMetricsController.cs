using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/safehouse-metrics")]
public class SafehouseMetricsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SafehouseMetricsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SafehouseMonthlyMetric>>> GetSafehouseMetrics(int? safehouseId = null)
    {
        var query = _context.SafehouseMonthlyMetrics.AsQueryable();
        if (safehouseId.HasValue) query = query.Where(m => m.SafehouseId == safehouseId.Value);
        return await query.Include(m => m.Safehouse).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SafehouseMonthlyMetric>> GetSafehouseMetric(int id)
    {
        var metric = await _context.SafehouseMonthlyMetrics.FindAsync(id);
        if (metric == null) return NotFound();
        return metric;
    }

    [HttpPost]
    public async Task<ActionResult<SafehouseMonthlyMetric>> PostSafehouseMetric(SafehouseMonthlyMetric metric)
    {
        _context.SafehouseMonthlyMetrics.Add(metric);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSafehouseMetric), new { id = metric.Id }, metric);
    }
}
