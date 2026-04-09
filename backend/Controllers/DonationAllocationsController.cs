using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonationAllocationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DonationAllocationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DonationAllocation>>> GetDonationAllocations(int? donationId = null)
    {
        var query = _context.DonationAllocations.AsQueryable();
        if (donationId.HasValue) query = query.Where(d => d.DonationId == donationId.Value);
        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DonationAllocation>> GetDonationAllocation(int id)
    {
        var allocation = await _context.DonationAllocations.FindAsync(id);
        if (allocation == null) return NotFound();
        return allocation;
    }

    [HttpPost]
    public async Task<ActionResult<DonationAllocation>> PostDonationAllocation(DonationAllocation allocation)
    {
        _context.DonationAllocations.Add(allocation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDonationAllocation), new { id = allocation.Id }, allocation);
    }
}
