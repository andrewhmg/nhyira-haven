using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DonationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/donations
    [HttpGet]
    [Authorize(Roles = "Admin,Staff,Donor")]
    public async Task<ActionResult<IEnumerable<Donation>>> GetDonations(
        [FromQuery] int? supporterId = null,
        [FromQuery] string? type = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = _context.Donations.AsQueryable();

        if (supporterId.HasValue)
        {
            query = query.Where(d => d.SupporterId == supporterId.Value);
        }

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(d => d.DonationType == type);
        }

        if (startDate.HasValue)
        {
            query = query.Where(d => d.DonationDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(d => d.DonationDate <= endDate.Value);
        }

        return await query
            .Include(d => d.Supporter)
            .Include(d => d.InKindDonationItems)
            .Include(d => d.DonationAllocations)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();
    }

    // GET: api/donations/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Staff,Donor")]
    public async Task<ActionResult<Donation>> GetDonation(int id)
    {
        var donation = await _context.Donations
            .Include(d => d.Supporter)
            .Include(d => d.InKindDonationItems)
            .Include(d => d.DonationAllocations)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (donation == null)
        {
            return NotFound();
        }

        return donation;
    }

    // GET: api/donations/stats
    [HttpGet("stats")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<object>> GetDonationStats()
    {
        var totalAmount = await _context.Donations
            .Where(d => d.DonationType == "Monetary")
            .SumAsync(d => d.Amount);

        var totalByType = await _context.Donations
            .GroupBy(d => d.DonationType)
            .Select(g => new { Type = g.Key, Count = g.Count(), Total = g.Sum(d => d.Amount) })
            .ToListAsync();

        var recurringCount = await _context.Donations
            .CountAsync(d => d.IsRecurring);

        var avgDonation = await _context.Donations
            .Where(d => d.DonationType == "Monetary")
            .AverageAsync(d => d.Amount);

        return new
        {
            TotalAmount = totalAmount,
            TotalByType = totalByType,
            RecurringDonations = recurringCount,
            AverageDonation = avgDonation,
            TotalDonations = await _context.Donations.CountAsync()
        };
    }

    // POST: api/donations
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Donation>> CreateDonation(Donation donation)
    {
        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDonation), new { id = donation.Id }, donation);
    }

    // PUT: api/donations/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDonation(int id, Donation donation)
    {
        if (id != donation.Id)
        {
            return BadRequest();
        }

        _context.Entry(donation).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!DonationExists(id))
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

    // DELETE: api/donations/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDonation(int id)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null)
        {
            return NotFound();
        }

        _context.Donations.Remove(donation);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool DonationExists(int id)
    {
        return _context.Donations.Any(e => e.Id == id);
    }
}