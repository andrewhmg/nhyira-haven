using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/partner-assignments")]
[Authorize(Roles = "Admin,Staff")]
public class PartnerAssignmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PartnerAssignmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartnerAssignment>>> GetPartnerAssignments()
    {
        return await _context.PartnerAssignments.Include(pa => pa.Partner).Include(pa => pa.Safehouse).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartnerAssignment>> GetPartnerAssignment(int id)
    {
        var assignment = await _context.PartnerAssignments.FindAsync(id);
        if (assignment == null) return NotFound();
        return assignment;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartnerAssignment>> PostPartnerAssignment(PartnerAssignment assignment)
    {
        _context.PartnerAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPartnerAssignment), new { id = assignment.Id }, assignment);
    }
}
