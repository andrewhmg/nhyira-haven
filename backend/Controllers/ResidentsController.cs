using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResidentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ResidentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/residents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resident>>> GetResidents(
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? category = null)
    {
        var query = _context.Residents.AsQueryable();

        if (safehouseId.HasValue)
        {
            query = query.Where(r => r.SafehouseId == safehouseId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(r => r.CaseCategory == category);
        }

        return await query
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings)
            .Include(r => r.HomeVisitations)
            .Include(r => r.InterventionPlans)
            .Include(r => r.IncidentReports)
            .OrderByDescending(r => r.IntakeDate)
            .ToListAsync();
    }

    // GET: api/residents/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Resident>> GetResident(int id)
    {
        var resident = await _context.Residents
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings)
            .Include(r => r.HomeVisitations)
            .Include(r => r.EducationRecords)
            .Include(r => r.HealthWellbeingRecords)
            .Include(r => r.InterventionPlans)
            .Include(r => r.IncidentReports)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resident == null)
        {
            return NotFound();
        }

        return resident;
    }

    // GET: api/residents/5/timeline
    [HttpGet("{id}/timeline")]
    public async Task<ActionResult<object>> GetResidentTimeline(int id)
    {
        var resident = await _context.Residents.FindAsync(id);
        if (resident == null)
        {
            return NotFound();
        }

        var processRecordings = await _context.ProcessRecordings
            .Where(pr => pr.ResidentId == id)
            .OrderByDescending(pr => pr.SessionDate)
            .ToListAsync();

        var homeVisitations = await _context.HomeVisitations
            .Where(hv => hv.ResidentId == id)
            .OrderByDescending(hv => hv.VisitDate)
            .ToListAsync();

        var incidents = await _context.IncidentReports
            .Where(ir => ir.ResidentId == id)
            .OrderByDescending(ir => ir.IncidentDate)
            .ToListAsync();

        return new
        {
            Resident = resident,
            ProcessRecordings = processRecordings,
            HomeVisitations = homeVisitations,
            Incidents = incidents
        };
    }

    // POST: api/residents
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Resident>> CreateResident(Resident resident)
    {
        _context.Residents.Add(resident);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResident), new { id = resident.Id }, resident);
    }

    // PUT: api/residents/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateResident(int id, Resident resident)
    {
        if (id != resident.Id)
        {
            return BadRequest();
        }

        _context.Entry(resident).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ResidentExists(id))
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

    // DELETE: api/residents/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteResident(int id)
    {
        var resident = await _context.Residents
            .Include(r => r.ProcessRecordings)
            .Include(r => r.HomeVisitations)
            .Include(r => r.EducationRecords)
            .Include(r => r.HealthWellbeingRecords)
            .Include(r => r.InterventionPlans)
            .Include(r => r.IncidentReports)
            .Include(r => r.CaseConferences)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resident == null)
        {
            return NotFound();
        }

        _context.Residents.Remove(resident);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ResidentExists(int id)
    {
        return _context.Residents.Any(e => e.Id == id);
    }
}