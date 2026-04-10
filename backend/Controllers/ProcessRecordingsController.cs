using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/process-recordings")]
[Authorize(Roles = "Admin,Staff")]
public class ProcessRecordingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProcessRecordingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcessRecording>>> GetProcessRecordings(int? residentId = null)
    {
        var query = _context.ProcessRecordings.AsQueryable();
        if (residentId.HasValue) query = query.Where(p => p.ResidentId == residentId.Value);
        return await query.Include(p => p.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProcessRecording>> GetProcessRecording(int id)
    {
        var recording = await _context.ProcessRecordings.FindAsync(id);
        if (recording == null) return NotFound();
        return recording;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProcessRecording>> PostProcessRecording(ProcessRecording recording)
    {
        _context.ProcessRecordings.Add(recording);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProcessRecording), new { id = recording.Id }, recording);
    }
}

