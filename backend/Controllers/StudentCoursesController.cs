using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class StudentCoursesController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStudentCourses()
    {
        var list = await context.StudentCourses
            .Select(sc => new StudentCourseDto(sc.Id, sc.StudentId, sc.CourseId, sc.EnrolledAt))
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentCourse(int id)
    {
        var sc = await context.StudentCourses.FindAsync(id);
        if (sc == null) return NotFound();

        return Ok(new StudentCourseDto(sc.Id, sc.StudentId, sc.CourseId, sc.EnrolledAt));
    }

    [HttpPost]
    public async Task<IActionResult> CreateStudentCourse(CreateStudentCourseDto dto)
    {
        var sc = new StudentCourse 
        { 
            StudentId = dto.StudentId, 
            CourseId = dto.CourseId,
            EnrolledAt = DateTime.UtcNow
        };
        context.StudentCourses.Add(sc);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudentCourse), new { id = sc.Id }, new StudentCourseDto(sc.Id, sc.StudentId, sc.CourseId, sc.EnrolledAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudentCourse(int id, UpdateStudentCourseDto dto)
    {
        var sc = await context.StudentCourses.FindAsync(id);
        if (sc == null) return NotFound();

        sc.StudentId = dto.StudentId;
        sc.CourseId = dto.CourseId;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudentCourse(int id)
    {
        var sc = await context.StudentCourses.FindAsync(id);
        if (sc == null) return NotFound();

        context.StudentCourses.Remove(sc);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
