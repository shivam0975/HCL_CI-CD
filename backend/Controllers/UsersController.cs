using backend.DTOs.Users;
using backend.Dtos;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class UsersController(StudentManagementContext dbContext, IPasswordService passwordService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<UserReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .Include(user => user.Role)
            .AsNoTracking()
            .Select(user => new UserReadDto(
                user.UserId,
                user.Username,
                user.Role != null ? new RoleDto(user.Role.RoleId, user.Role.RoleName) : null,
                user.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserReadDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(item => item.Role)
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == id, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(ToReadDto(user));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserReadDto>> Create([FromBody] UserCreateDto request, CancellationToken cancellationToken)
    {
        var normalizedUsername = request.Username.Trim();
        if (string.IsNullOrWhiteSpace(normalizedUsername) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        if (await dbContext.Users.AnyAsync(user => user.Username == normalizedUsername, cancellationToken))
        {
            return Conflict("Username already exists.");
        }

        var role = await ResolveRoleAsync(request.Role?.RoleId, request.Role?.RoleName, cancellationToken);
        if (role is null)
        {
            return BadRequest("A valid role could not be resolved.");
        }

        var user = new User
        {
            Username = normalizedUsername,
            PasswordHash = passwordService.HashPassword(request.Password),
            RoleId = role.RoleId,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var readDto = new UserReadDto(user.UserId, user.Username, new RoleDto(role.RoleId, role.RoleName), user.CreatedAt);
        return CreatedAtAction(nameof(GetById), new { id = user.UserId }, readDto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserReadDto>> Update(int id, [FromBody] UserUpdateDto request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.UserId == id, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var normalizedUsername = request.Username.Trim();
            var usernameInUse = await dbContext.Users.AnyAsync(
                item => item.UserId != id && item.Username == normalizedUsername,
                cancellationToken);

            if (usernameInUse)
            {
                return Conflict("Username already exists.");
            }

            user.Username = normalizedUsername;
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = passwordService.HashPassword(request.Password);
        }

        if (request.Role is not null)
        {
            var role = await ResolveRoleAsync(request.Role.RoleId, request.Role.RoleName, cancellationToken);
            if (role is null)
            {
                return BadRequest("A valid role could not be resolved.");
            }

            user.RoleId = role.RoleId;
            user.Role = role;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new UserReadDto(
            user.UserId,
            user.Username,
            user.Role != null ? new RoleDto(user.Role.RoleId, user.Role.RoleName) : null,
            user.CreatedAt));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(item => item.UserId == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<Role?> ResolveRoleAsync(int? roleId, string? roleName, CancellationToken cancellationToken)
    {
        if (roleId.HasValue && roleId.Value > 0)
        {
            return await dbContext.Roles.FirstOrDefaultAsync(role => role.RoleId == roleId.Value, cancellationToken);
        }

        if (!string.IsNullOrWhiteSpace(roleName))
        {
            var normalizedRoleName = roleName.Trim().ToLower();
            return await dbContext.Roles.FirstOrDefaultAsync(
                role => role.RoleName != null && role.RoleName.ToLower() == normalizedRoleName,
                cancellationToken);
        }

        return await dbContext.Roles.FirstOrDefaultAsync(role => role.RoleName == "Student", cancellationToken);
    }

    private static UserReadDto ToReadDto(User user) => new(
        user.UserId,
        user.Username,
        user.Role != null ? new RoleDto(user.Role.RoleId, user.Role.RoleName) : null,
        user.CreatedAt
    );
}
