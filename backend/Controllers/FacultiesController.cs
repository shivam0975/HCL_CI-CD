using backend.DTOs.Faculties;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class FacultiesController(StudentManagementContext dbContext) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOrFaculty")]
    public async Task<ActionResult<IEnumerable<FacultyReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var faculties = await dbContext.Faculties
            .Include(faculty => faculty.Department)
            .Include(faculty => faculty.User)
            .AsNoTracking()
            .Select(faculty => new FacultyReadDto(
                faculty.FacultyId,
                faculty.UserId,
                faculty.Name,
                faculty.Email,
                faculty.DepartmentId,
                faculty.Department != null ? faculty.Department.Name : null,
                faculty.User != null ? faculty.User.Username : null,
                faculty.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(faculties);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOrFaculty")]
    public async Task<ActionResult<FacultyReadDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var faculty = await dbContext.Faculties
            .Include(item => item.Department)
            .Include(item => item.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.FacultyId == id, cancellationToken);

        if (faculty is null)
        {
            return NotFound();
        }

        return Ok(ToReadDto(faculty));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<FacultyReadDto>> Create([FromBody] FacultyCreateDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Faculty name is required.");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await dbContext.Faculties.AnyAsync(
                faculty => faculty.Email != null && faculty.Email == request.Email,
                cancellationToken);

            if (emailExists)
            {
                return Conflict("Faculty email already exists.");
            }
        }

        if (request.UserId.HasValue)
        {
            var userExists = await dbContext.Users.AnyAsync(user => user.UserId == request.UserId.Value, cancellationToken);
            if (!userExists)
            {
                return BadRequest("Specified user does not exist.");
            }
        }

        if (request.DepartmentId.HasValue)
        {
            var departmentExists = await dbContext.Departments.AnyAsync(department => department.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (!departmentExists)
            {
                return BadRequest("Specified department does not exist.");
            }
        }

        var faculty = new Faculty
        {
            UserId = request.UserId,
            Name = request.Name.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            DepartmentId = request.DepartmentId,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Faculties.Add(faculty);
        await dbContext.SaveChangesAsync(cancellationToken);

        var createdFaculty = await dbContext.Faculties
            .Include(item => item.Department)
            .Include(item => item.User)
            .AsNoTracking()
            .FirstAsync(item => item.FacultyId == faculty.FacultyId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = faculty.FacultyId }, ToReadDto(createdFaculty));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<FacultyReadDto>> Update(int id, [FromBody] FacultyUpdateDto request, CancellationToken cancellationToken)
    {
        var faculty = await dbContext.Faculties.FirstOrDefaultAsync(item => item.FacultyId == id, cancellationToken);
        if (faculty is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Faculty name is required.");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await dbContext.Faculties.AnyAsync(
                item => item.FacultyId != id && item.Email != null && item.Email == request.Email,
                cancellationToken);

            if (emailExists)
            {
                return Conflict("Faculty email already exists.");
            }
        }

        if (request.UserId.HasValue)
        {
            var userExists = await dbContext.Users.AnyAsync(user => user.UserId == request.UserId.Value, cancellationToken);
            if (!userExists)
            {
                return BadRequest("Specified user does not exist.");
            }
        }

        if (request.DepartmentId.HasValue)
        {
            var departmentExists = await dbContext.Departments.AnyAsync(department => department.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (!departmentExists)
            {
                return BadRequest("Specified department does not exist.");
            }
        }

        faculty.UserId = request.UserId;
        faculty.Name = request.Name.Trim();
        faculty.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        faculty.DepartmentId = request.DepartmentId;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updatedFaculty = await dbContext.Faculties
            .Include(item => item.Department)
            .Include(item => item.User)
            .AsNoTracking()
            .FirstAsync(item => item.FacultyId == id, cancellationToken);

        return Ok(ToReadDto(updatedFaculty));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var faculty = await dbContext.Faculties.FirstOrDefaultAsync(item => item.FacultyId == id, cancellationToken);
        if (faculty is null)
        {
            return NotFound();
        }

        dbContext.Faculties.Remove(faculty);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static FacultyReadDto ToReadDto(Faculty faculty) => new(
        faculty.FacultyId,
        faculty.UserId,
        faculty.Name,
        faculty.Email,
        faculty.DepartmentId,
        faculty.Department?.Name,
        faculty.User?.Username,
        faculty.CreatedAt);
}
