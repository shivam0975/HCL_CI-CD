using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOrFaculty")]
    public async Task<IActionResult> GetStudents()
    {
        var students = await context.Students
            .Select(s => new StudentDto(s.StudentId, s.UserId, s.Name, s.Email, s.Phone, s.Dob, s.DepartmentId, s.CreatedAt, s.UpdatedAt))
            .ToListAsync();
        return Ok(students);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetStudent(int id)
    {
        // Add additional logic here to restrict viewing to Admin/Faculty OR the specific student user
        var student = await context.Students.FindAsync(id);
        if (student == null) return NotFound();

        return Ok(new StudentDto(student.StudentId, student.UserId, student.Name, student.Email, student.Phone, student.Dob, student.DepartmentId, student.CreatedAt, student.UpdatedAt));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateStudent(CreateStudentDto dto)
    {
        var student = new Student 
        { 
            UserId = dto.UserId,
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Dob = dto.Dob,
            DepartmentId = dto.DepartmentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Students.Add(student);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudent), new { id = student.StudentId }, new StudentDto(student.StudentId, student.UserId, student.Name, student.Email, student.Phone, student.Dob, student.DepartmentId, student.CreatedAt, student.UpdatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStudent(int id, UpdateStudentDto dto)
    {
        var student = await context.Students.FindAsync(id);
        if (student == null) return NotFound();

        student.Name = dto.Name;
        student.Email = dto.Email;
        student.Phone = dto.Phone;
        student.Dob = dto.Dob;
        student.DepartmentId = dto.DepartmentId;
        student.UpdatedAt = DateTime.UtcNow;
        
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await context.Students.FindAsync(id);
        if (student == null) return NotFound();

        context.Students.Remove(student);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
