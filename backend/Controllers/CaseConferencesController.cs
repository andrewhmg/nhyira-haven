using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/case-conferences")]
[Authorize]
public class CaseConferencesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CaseConferencesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CaseConference>>> GetCaseConferences(int? residentId = null)
    {
        var query = _context.CaseConferences.AsQueryable();
        if (residentId.HasValue) query = query.Where(c => c.ResidentId == residentId.Value);
        return await query.Include(c => c.Resident).OrderByDescending(c => c.ConferenceDate).ToListAsync();
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<CaseConference>>> GetUpcomingConferences()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.CaseConferences
            .Where(c => c.NextConferenceDate != null && c.NextConferenceDate >= today)
            .Include(c => c.Resident)
            .OrderBy(c => c.NextConferenceDate)
            .Take(10)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CaseConference>> GetCaseConference(int id)
    {
        var conf = await _context.CaseConferences.Include(c => c.Resident).FirstOrDefaultAsync(c => c.Id == id);
        if (conf == null) return NotFound();
        return conf;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CaseConference>> PostCaseConference(CaseConference conference)
    {
        _context.CaseConferences.Add(conference);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCaseConference), new { id = conference.Id }, conference);
    }
}
