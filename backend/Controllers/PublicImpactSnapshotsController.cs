using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/public-impact-snapshots")]
public class PublicImpactSnapshotsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PublicImpactSnapshotsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublicImpactSnapshot>>> GetPublicImpactSnapshots()
    {
        return await _context.PublicImpactSnapshots.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PublicImpactSnapshot>> GetPublicImpactSnapshot(int id)
    {
        var snapshot = await _context.PublicImpactSnapshots.FindAsync(id);
        if (snapshot == null) return NotFound();
        return snapshot;
    }

    [HttpPost]
    public async Task<ActionResult<PublicImpactSnapshot>> PostPublicImpactSnapshot(PublicImpactSnapshot snapshot)
    {
        _context.PublicImpactSnapshots.Add(snapshot);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPublicImpactSnapshot), new { id = snapshot.Id }, snapshot);
    }
}
