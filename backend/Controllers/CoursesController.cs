using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await context.Courses
            .Select(c => new CourseDto(c.CourseId, c.CourseName, c.CourseCode, c.Credits, c.Semester, c.DepartmentId))
            .ToListAsync();
        return Ok(courses);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetCourse(int id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        return Ok(new CourseDto(course.CourseId, course.CourseName, course.CourseCode, course.Credits, course.Semester, course.DepartmentId));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
    {
        var course = new Course 
        { 
            CourseName = dto.CourseName,
            CourseCode = dto.CourseCode,
            Credits = dto.Credits,
            Semester = dto.Semester,
            DepartmentId = dto.DepartmentId,
            CreatedAt = DateTime.UtcNow
        };
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, new CourseDto(course.CourseId, course.CourseName, course.CourseCode, course.Credits, course.Semester, course.DepartmentId));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateCourse(int id, UpdateCourseDto dto)
    {
        var course = await context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        course.CourseName = dto.CourseName;
        course.CourseCode = dto.CourseCode;
        course.Credits = dto.Credits;
        course.Semester = dto.Semester;
        course.DepartmentId = dto.DepartmentId;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        context.Courses.Remove(course);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
