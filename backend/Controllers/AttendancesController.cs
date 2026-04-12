using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendancesController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Faculty")]
    public async Task<IActionResult> GetAttendances()
    {
        var attendances = await context.Attendances
            .Select(a => new AttendanceDto(a.AttendanceId, a.StudentId, a.CourseId, a.Date, a.Status))
            .ToListAsync();
        return Ok(attendances);
    }

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<IActionResult> GetStudentAttendances(int studentId)
    {
        var list = await context.Attendances
            .Where(a => a.StudentId == studentId)
            .Select(a => new AttendanceDto(a.AttendanceId, a.StudentId, a.CourseId, a.Date, a.Status))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Policy = "FacultyOnly")]
    public async Task<IActionResult> CreateAttendance(CreateAttendanceDto dto)
    {
        var attendance = new Attendance 
        { 
            StudentId = dto.StudentId,
            CourseId = dto.CourseId,
            Date = dto.Date ?? DateTime.Today,
            Status = dto.Status
        };
        context.Attendances.Add(attendance);
        await context.SaveChangesAsync();

        return Ok(new AttendanceDto(attendance.AttendanceId, attendance.StudentId, attendance.CourseId, attendance.Date, attendance.Status));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "FacultyOnly")]
    public async Task<IActionResult> UpdateAttendance(int id, UpdateAttendanceDto dto)
    {
        var attendance = await context.Attendances.FindAsync(id);
        if (attendance == null) return NotFound();

        attendance.StudentId = dto.StudentId;
        attendance.CourseId = dto.CourseId;
        attendance.Date = dto.Date;
        attendance.Status = dto.Status;
        await context.SaveChangesAsync();

        return NoContent();
    }
}
