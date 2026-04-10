using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class SafehousesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SafehousesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/safehouses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Safehouse>>> GetSafehouses()
    {
        return await _context.Safehouses
            .Include(s => s.Residents)
            .Include(s => s.PartnerAssignments)
            .Include(s => s.MonthlyMetrics)
            .ToListAsync();
    }

    // GET: api/safehouses/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Safehouse>> GetSafehouse(int id)
    {
        var safehouse = await _context.Safehouses
            .Include(s => s.Residents)
            .Include(s => s.PartnerAssignments!)
                .ThenInclude(pa => pa.Partner)
            .Include(s => s.MonthlyMetrics)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (safehouse == null)
        {
            return NotFound();
        }

        return safehouse;
    }

    // GET: api/safehouses/5/residents
    [HttpGet("{id}/residents")]
    public async Task<ActionResult<IEnumerable<Resident>>> GetSafehouseResidents(int id)
    {
        return await _context.Residents
            .Where(r => r.SafehouseId == id)
            .ToListAsync();
    }

    // GET: api/safehouses/5/metrics
    [HttpGet("{id}/metrics")]
    public async Task<ActionResult<IEnumerable<SafehouseMonthlyMetric>>> GetSafehouseMetrics(int id)
    {
        return await _context.SafehouseMonthlyMetrics
            .Where(m => m.SafehouseId == id)
            .OrderByDescending(m => m.YearMonth)
            .ToListAsync();
    }

    // POST: api/safehouses
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Safehouse>> CreateSafehouse(Safehouse safehouse)
    {
        _context.Safehouses.Add(safehouse);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSafehouse), new { id = safehouse.Id }, safehouse);
    }

    // PUT: api/safehouses/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSafehouse(int id, Safehouse safehouse)
    {
        if (id != safehouse.Id)
        {
            return BadRequest();
        }

        _context.Entry(safehouse).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SafehouseExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/safehouses/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSafehouse(int id)
    {
        var safehouse = await _context.Safehouses.FindAsync(id);
        if (safehouse == null)
        {
            return NotFound();
        }

        _context.Safehouses.Remove(safehouse);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SafehouseExists(int id)
    {
        return _context.Safehouses.Any(e => e.Id == id);
    }
}