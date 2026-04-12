using backend.DTOs.Departments;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class DepartmentsController(StudentManagementContext dbContext) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<DepartmentReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var departments = await dbContext.Departments
            .AsNoTracking()
            .Select(department => new DepartmentReadDto(department.DepartmentId, department.Name))
            .ToListAsync(cancellationToken);

        return Ok(departments);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<DepartmentReadDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var department = await dbContext.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.DepartmentId == id, cancellationToken);

        if (department is null)
        {
            return NotFound();
        }

        return Ok(new DepartmentReadDto(department.DepartmentId, department.Name));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<DepartmentReadDto>> Create([FromBody] DepartmentCreateDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Department name is required.");
        }

        var normalizedName = request.Name.Trim();
        var exists = await dbContext.Departments.AnyAsync(item => item.Name == normalizedName, cancellationToken);
        if (exists)
        {
            return Conflict("Department name already exists.");
        }

        var department = new Department { Name = normalizedName };
        dbContext.Departments.Add(department);
        await dbContext.SaveChangesAsync(cancellationToken);

        var readDto = new DepartmentReadDto(department.DepartmentId, department.Name);
        return CreatedAtAction(nameof(GetById), new { id = department.DepartmentId }, readDto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<DepartmentReadDto>> Update(int id, [FromBody] DepartmentUpdateDto request, CancellationToken cancellationToken)
    {
        var department = await dbContext.Departments.FirstOrDefaultAsync(item => item.DepartmentId == id, cancellationToken);
        if (department is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Department name is required.");
        }

        var normalizedName = request.Name.Trim();
        var exists = await dbContext.Departments.AnyAsync(
            item => item.DepartmentId != id && item.Name == normalizedName,
            cancellationToken);

        if (exists)
        {
            return Conflict("Department name already exists.");
        }

        department.Name = normalizedName;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new DepartmentReadDto(department.DepartmentId, department.Name));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var department = await dbContext.Departments.FirstOrDefaultAsync(item => item.DepartmentId == id, cancellationToken);
        if (department is null)
        {
            return NotFound();
        }

        dbContext.Departments.Remove(department);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
