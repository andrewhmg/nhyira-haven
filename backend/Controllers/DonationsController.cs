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
            .AsNoTracking()
            .Include(d => d.Supporter)
            .Include(d => d.InKindDonationItems)
            .Include(d => d.DonationAllocations)
            .OrderByDescending(d => d.DonationDate)
            .AsSplitQuery()
            .ToListAsync();
    }

    // GET: api/donations/5
    [HttpGet("{id}")]
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
    public async Task<ActionResult<object>> GetDonationStats()
    {
        var donations = await _context.Donations
            .AsNoTracking()
            .Include(d => d.InKindDonationItems)
            .ToListAsync();

        var totalByType = donations
            .GroupBy(d => string.IsNullOrWhiteSpace(d.DonationType) ? "Unknown" : d.DonationType.Trim())
            .Select(g => new { Type = g.Key, Count = g.Count(), Total = g.Sum(d => d.Amount) })
            .OrderByDescending(x => x.Total)
            .ToList();

        var catTotals = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase)
        {
            ["monetary"] = 0,
            ["inkind"] = 0,
            ["volunteer"] = 0,
            ["social"] = 0,
            ["other"] = 0
        };
        var catCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["monetary"] = 0,
            ["inkind"] = 0,
            ["volunteer"] = 0,
            ["social"] = 0,
            ["other"] = 0
        };

        foreach (var d in donations)
        {
            var cat = BroadDonationCategory(d.DonationType);
            var itemsValue = InKindLineItemsTotal(d);
            catCounts[cat]++;

            switch (cat)
            {
                case "inkind":
                    // Lighthouse CSV rolls estimated gift value into Amount; line items are detail (do not add again)
                    catTotals["inkind"] += d.Amount > 0 ? d.Amount : itemsValue;
                    break;
                case "monetary":
                    catTotals["monetary"] += d.Amount;
                    AddLinkedInKindLineValue(catTotals, itemsValue);
                    break;
                case "volunteer":
                    catTotals["volunteer"] += d.Amount;
                    AddLinkedInKindLineValue(catTotals, itemsValue);
                    break;
                case "social":
                    catTotals["social"] += d.Amount;
                    AddLinkedInKindLineValue(catTotals, itemsValue);
                    break;
                default:
                    catTotals["other"] += d.Amount;
                    AddLinkedInKindLineValue(catTotals, itemsValue);
                    break;
            }
        }

        var valueByCategory = new[]
        {
            new { Key = "monetary", Label = "Monetary (cash)", Total = catTotals["monetary"], Count = catCounts["monetary"] },
            new { Key = "inkind", Label = "In-kind (goods)", Total = catTotals["inkind"], Count = catCounts["inkind"] },
            new { Key = "volunteer", Label = "Volunteer time & skills", Total = catTotals["volunteer"], Count = catCounts["volunteer"] },
            new { Key = "social", Label = "Social / advocacy", Total = catTotals["social"], Count = catCounts["social"] },
            new { Key = "other", Label = "Other", Total = catTotals["other"], Count = catCounts["other"] },
        }.Where(x => x.Total > 0).ToList();

        var monetaryLike = donations.Where(d => BroadDonationCategory(d.DonationType) == "monetary").ToList();
        var totalAmount = catTotals.Values.Sum();
        var recurringCount = donations.Count(d => d.IsRecurring);
        var avgDonation = monetaryLike.Count > 0
            ? monetaryLike.Average(d => d.Amount)
            : (donations.Count > 0 ? donations.Average(d => d.Amount) : 0);

        return new
        {
            TotalAmount = totalAmount,
            TotalByType = totalByType,
            ValueByCategory = valueByCategory,
            RecurringDonations = recurringCount,
            AverageDonation = avgDonation,
            TotalDonations = donations.Count
        };
    }

    private static void AddLinkedInKindLineValue(Dictionary<string, decimal> catTotals, decimal itemsValue)
    {
        if (itemsValue > 0)
            catTotals["inkind"] += itemsValue;
    }

    private static string BroadDonationCategory(string? donationType)
    {
        if (string.IsNullOrWhiteSpace(donationType)) return "other";
        var t = donationType.Trim();
        if (t.Equals("Monetary", StringComparison.OrdinalIgnoreCase)) return "monetary";
        if (t.Equals("Recurring", StringComparison.OrdinalIgnoreCase)) return "monetary";
        if (t.Equals("One-time", StringComparison.OrdinalIgnoreCase) || t.Equals("OneTime", StringComparison.OrdinalIgnoreCase)) return "monetary";
        if (t.Equals("Grant", StringComparison.OrdinalIgnoreCase)) return "monetary";
        if (t.Equals("InKind", StringComparison.OrdinalIgnoreCase) || t.Equals("In-Kind", StringComparison.OrdinalIgnoreCase)) return "inkind";
        if (t.Equals("Time", StringComparison.OrdinalIgnoreCase) || t.Equals("Skills", StringComparison.OrdinalIgnoreCase)) return "volunteer";
        if (t.Equals("SocialMedia", StringComparison.OrdinalIgnoreCase)) return "social";
        return "other";
    }

    private static decimal InKindLineItemsTotal(Donation d)
    {
        if (d.InKindDonationItems == null || d.InKindDonationItems.Count == 0) return 0;
        decimal sum = 0;
        foreach (var i in d.InKindDonationItems)
            sum += i.EstimatedValue * (i.Quantity <= 0 ? 1 : i.Quantity);
        return sum;
    }

    // POST: api/donations
    [HttpPost]
    [Authorize(Roles = "Admin,Donor")]
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