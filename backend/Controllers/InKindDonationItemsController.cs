using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/in-kind-donation-items")]
[Authorize(Roles = "Admin,Staff")]
public class InKindDonationItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InKindDonationItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InKindDonationItem>>> GetInKindDonationItems(int? donationId = null)
    {
        var query = _context.InKindDonationItems.AsQueryable();
        if (donationId.HasValue) query = query.Where(i => i.DonationId == donationId.Value);
        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InKindDonationItem>> GetInKindDonationItem(int id)
    {
        var item = await _context.InKindDonationItems.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InKindDonationItem>> PostInKindDonationItem(InKindDonationItem item)
    {
        _context.InKindDonationItems.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInKindDonationItem), new { id = item.Id }, item);
    }
}
