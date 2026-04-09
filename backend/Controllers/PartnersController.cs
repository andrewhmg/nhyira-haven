using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/partners")]
[Authorize]
public class PartnersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PartnersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Partner>>> GetPartners()
    {
        return await _context.Partners.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Partner>> GetPartner(int id)
    {
        var partner = await _context.Partners.FindAsync(id);
        if (partner == null) return NotFound();
        return partner;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Partner>> PostPartner(Partner partner)
    {
        _context.Partners.Add(partner);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPartner), new { id = partner.Id }, partner);
    }
}
