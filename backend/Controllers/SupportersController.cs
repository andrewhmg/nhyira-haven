using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SupportersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/supporters
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> GetSupporters(
        [FromQuery] string? type = null,
        [FromQuery] bool? atRisk = null)
    {
        var query = _context.Supporters.AsQueryable();

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(s => s.SupporterType == type);
        }

        if (atRisk.HasValue)
        {
            query = query.Where(s => s.IsAtRisk == atRisk.Value);
        }

        return await query
            .Include(s => s.Donations)
            .OrderByDescending(s => s.JoinedDate)
            .ToListAsync();
    }

    // GET: api/supporters/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Supporter>> GetSupporter(int id)
    {
        var supporter = await _context.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supporter == null)
        {
            return NotFound();
        }

        return supporter;
    }

    // GET: api/supporters/5/donations
    [HttpGet("{id}/donations")]
    public async Task<ActionResult<IEnumerable<Donation>>> GetSupporterDonations(int id)
    {
        return await _context.Donations
            .Where(d => d.SupporterId == id)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();
    }

    // GET: api/supporters/at-risk
    [HttpGet("at-risk/list")]
    public async Task<ActionResult<IEnumerable<Supporter>>> GetAtRiskSupporters()
    {
        return await _context.Supporters
            .Where(s => s.IsAtRisk)
            .Include(s => s.Donations)
            .ToListAsync();
    }

    // POST: api/supporters
    [HttpPost]
    public async Task<ActionResult<Supporter>> CreateSupporter(Supporter supporter)
    {
        _context.Supporters.Add(supporter);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSupporter), new { id = supporter.Id }, supporter);
    }

    // PUT: api/supporters/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupporter(int id, Supporter supporter)
    {
        if (id != supporter.Id)
        {
            return BadRequest();
        }

        _context.Entry(supporter).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SupporterExists(id))
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

    // DELETE: api/supporters/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupporter(int id)
    {
        var supporter = await _context.Supporters.FindAsync(id);
        if (supporter == null)
        {
            return NotFound();
        }

        _context.Supporters.Remove(supporter);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SupporterExists(int id)
    {
        return _context.Supporters.Any(e => e.Id == id);
    }
}