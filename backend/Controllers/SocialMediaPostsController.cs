using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhyiraHaven.Data;
using NhyiraHaven.Models;

namespace NhyiraHaven.Controllers;

[ApiController]
[Route("api/social-media-posts")]
public class SocialMediaPostsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SocialMediaPostsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SocialMediaPost>>> GetSocialMediaPosts()
    {
        return await _context.SocialMediaPosts.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SocialMediaPost>> GetSocialMediaPost(int id)
    {
        var post = await _context.SocialMediaPosts.FindAsync(id);
        if (post == null) return NotFound();
        return post;
    }

    [HttpPost]
    public async Task<ActionResult<SocialMediaPost>> PostSocialMediaPost(SocialMediaPost post)
    {
        _context.SocialMediaPosts.Add(post);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSocialMediaPost), new { id = post.Id }, post);
    }
}
