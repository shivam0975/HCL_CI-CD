using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class CourseFacultiesController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCourseFaculties()
    {
        var list = await context.CourseFaculties
            .Select(cf => new CourseFacultyDto(cf.Id, cf.CourseId, cf.FacultyId, cf.AssignedAt))
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseFaculty(int id)
    {
        var cf = await context.CourseFaculties.FindAsync(id);
        if (cf == null) return NotFound();

        return Ok(new CourseFacultyDto(cf.Id, cf.CourseId, cf.FacultyId, cf.AssignedAt));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourseFaculty(CreateCourseFacultyDto dto)
    {
        var cf = new CourseFaculty 
        { 
            CourseId = dto.CourseId, 
            FacultyId = dto.FacultyId,
            AssignedAt = DateTime.UtcNow
        };
        context.CourseFaculties.Add(cf);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourseFaculty), new { id = cf.Id }, new CourseFacultyDto(cf.Id, cf.CourseId, cf.FacultyId, cf.AssignedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourseFaculty(int id, UpdateCourseFacultyDto dto)
    {
        var cf = await context.CourseFaculties.FindAsync(id);
        if (cf == null) return NotFound();

        cf.CourseId = dto.CourseId;
        cf.FacultyId = dto.FacultyId;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourseFaculty(int id)
    {
        var cf = await context.CourseFaculties.FindAsync(id);
        if (cf == null) return NotFound();

        context.CourseFaculties.Remove(cf);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
