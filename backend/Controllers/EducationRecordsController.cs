using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EducationRecordsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EducationRecordsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EducationRecord>>> GetEducationRecords(int? residentId = null)
    {
        var query = _context.EducationRecords.AsQueryable();
        if (residentId.HasValue) query = query.Where(e => e.ResidentId == residentId.Value);
        return await query.Include(e => e.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EducationRecord>> GetEducationRecord(int id)
    {
        var record = await _context.EducationRecords.FindAsync(id);
        if (record == null) return NotFound();
        return record;
    }

    [HttpPost]
    public async Task<ActionResult<EducationRecord>> PostEducationRecord(EducationRecord record)
    {
        _context.EducationRecords.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetEducationRecord), new { id = record.Id }, record);
    }
}
