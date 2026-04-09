using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeVisitationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HomeVisitationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomeVisitation>>> GetHomeVisitations(int? residentId = null)
    {
        var query = _context.HomeVisitations.AsQueryable();
        if (residentId.HasValue) query = query.Where(h => h.ResidentId == residentId.Value);
        return await query.Include(h => h.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HomeVisitation>> GetHomeVisitation(int id)
    {
        var visitation = await _context.HomeVisitations.FindAsync(id);
        if (visitation == null) return NotFound();
        return visitation;
    }

    [HttpPost]
    public async Task<ActionResult<HomeVisitation>> PostHomeVisitation(HomeVisitation visitation)
    {
        _context.HomeVisitations.Add(visitation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetHomeVisitation), new { id = visitation.Id }, visitation);
    }
}
