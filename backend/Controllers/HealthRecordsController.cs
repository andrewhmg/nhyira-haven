using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/health-records")]
[Authorize]
public class HealthRecordsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HealthRecordsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HealthWellbeingRecord>>> GetHealthRecords(int? residentId = null)
    {
        var query = _context.HealthWellbeingRecords.AsQueryable();
        if (residentId.HasValue) query = query.Where(h => h.ResidentId == residentId.Value);
        return await query.Include(h => h.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HealthWellbeingRecord>> GetHealthRecord(int id)
    {
        var record = await _context.HealthWellbeingRecords.FindAsync(id);
        if (record == null) return NotFound();
        return record;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<HealthWellbeingRecord>> PostHealthRecord(HealthWellbeingRecord record)
    {
        _context.HealthWellbeingRecords.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetHealthRecord), new { id = record.Id }, record);
    }
}
