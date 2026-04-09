using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;
using System.Security.Claims;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Donor")]
public class DonorPortalController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DonorPortalController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/donor-portal/me
    [HttpGet("me")]
    public async Task<ActionResult<Supporter>> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var supporter = await _context.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supporter == null)
            return NotFound(new { message = "No donor profile linked to this account." });

        return supporter;
    }

    // GET: api/donor-portal/donations
    [HttpGet("donations")]
    public async Task<ActionResult<IEnumerable<Donation>>> GetMyDonations()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var supporter = await _context.Supporters
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supporter == null)
            return NotFound(new { message = "No donor profile linked to this account." });

        var donations = await _context.Donations
            .Where(d => d.SupporterId == supporter.Id)
            .Include(d => d.DonationAllocations)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(donations);
    }

    // GET: api/donor-portal/impact
    [HttpGet("impact")]
    public async Task<ActionResult<object>> GetMyImpact()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var supporter = await _context.Supporters
            .Include(s => s.Donations!)
            .ThenInclude(d => d.DonationAllocations)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supporter == null)
            return NotFound(new { message = "No donor profile linked to this account." });

        var totalDonated = supporter.Donations?.Where(d => d.DonationType == "Monetary").Sum(d => d.Amount) ?? 0;
        var donationCount = supporter.Donations?.Count ?? 0;
        var allocations = supporter.Donations?
            .SelectMany(d => d.DonationAllocations ?? Enumerable.Empty<DonationAllocation>())
            .GroupBy(a => a.AllocationCategory)
            .Select(g => new { Category = g.Key, Amount = g.Sum(a => a.Amount) })
            .ToList();

        return Ok(new
        {
            TotalDonated = totalDonated,
            DonationCount = donationCount,
            FirstDonation = supporter.Donations?.Min(d => d.DonationDate),
            LastDonation = supporter.Donations?.Max(d => d.DonationDate),
            Allocations = allocations
        });
    }

    // POST: api/donor-portal/donate
    [HttpPost("donate")]
    public async Task<ActionResult<Donation>> SubmitDonation([FromBody] DonorDonationDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var supporter = await _context.Supporters
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supporter == null)
            return NotFound(new { message = "No donor profile linked to this account." });

        var donation = new Donation
        {
            SupporterId = supporter.Id,
            Amount = dto.Amount,
            Currency = "USD",
            DonationType = dto.DonationType ?? "Monetary",
            DonationDate = DateTime.UtcNow,
            CampaignSource = dto.CampaignSource,
            Notes = dto.Notes,
            IsRecurring = dto.IsRecurring,
            RecurringFrequency = dto.RecurringFrequency
        };

        _context.Donations.Add(donation);

        supporter.TotalDonated += dto.Amount;
        supporter.DonationCount += 1;
        supporter.LastDonationDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyDonations), donation);
    }
}

public class DonorDonationDto
{
    public decimal Amount { get; set; }
    public string? DonationType { get; set; }
    public string? CampaignSource { get; set; }
    public string? Notes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurringFrequency { get; set; }
}
