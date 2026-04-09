using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/intervention-plans")]
[Authorize]
public class InterventionPlansController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InterventionPlansController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InterventionPlan>>> GetInterventionPlans(int? residentId = null)
    {
        var query = _context.InterventionPlans.AsQueryable();
        if (residentId.HasValue) query = query.Where(i => i.ResidentId == residentId.Value);
        return await query.Include(i => i.Resident).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterventionPlan>> GetInterventionPlan(int id)
    {
        var plan = await _context.InterventionPlans.FindAsync(id);
        if (plan == null) return NotFound();
        return plan;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InterventionPlan>> PostInterventionPlan(InterventionPlan plan)
    {
        _context.InterventionPlans.Add(plan);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInterventionPlan), new { id = plan.Id }, plan);
    }
}
