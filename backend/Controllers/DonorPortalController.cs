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
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(donations);
    }
}
