using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class RolesController(StudentManagementContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await context.Roles
            .Select(r => new RoleDto(r.RoleId, r.RoleName))
            .ToListAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRole(int id)
    {
        var role = await context.Roles.FindAsync(id);
        if (role == null) return NotFound();

        return Ok(new RoleDto(role.RoleId, role.RoleName));
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole(CreateRoleDto dto)
    {
        var role = new Role { RoleName = dto.RoleName };
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.RoleId }, new RoleDto(role.RoleId, role.RoleName));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(int id, UpdateRoleDto dto)
    {
        var role = await context.Roles.FindAsync(id);
        if (role == null) return NotFound();

        role.RoleName = dto.RoleName;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var role = await context.Roles.FindAsync(id);
        if (role == null) return NotFound();

        context.Roles.Remove(role);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
