using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Auth;

public sealed class AuthService(
    StudentManagementContext dbContext,
    IPasswordService passwordService,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthResult.Fail("Username and password are required.");
        }

        var normalizedUsername = request.Username.Trim();

        var user = await dbContext.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == normalizedUsername, cancellationToken);

        if (user is null)
        {
            return AuthResult.Fail("Invalid username or password.");
        }

        if (!passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return AuthResult.Fail("Invalid username or password.");
        }

        var roleName = string.IsNullOrWhiteSpace(user.Role?.RoleName)
            ? "Student"
            : user.Role!.RoleName!.Trim();
        var (token, expiresAtUtc) = tokenService.GenerateToken(user.UserId, user.Username, roleName);

        return AuthResult.Success(user.UserId, user.Username, roleName, token, expiresAtUtc);
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthResult.Fail("Username and password are required.");
        }

        var normalizedUsername = request.Username.Trim();

        var usernameExists = await dbContext.Users
            .AnyAsync(u => u.Username == normalizedUsername, cancellationToken);

        if (usernameExists)
        {
            return AuthResult.Fail("Username already exists.");
        }

        Role? role = null;

        if (request.RoleId.HasValue)
        {
            role = await dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleId == request.RoleId.Value, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.RoleName))
        {
            role = await dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleName != null && r.RoleName.ToLower() == request.RoleName.ToLower(), cancellationToken);
        }

        if (role is null)
        {
            role = await dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleName == "Student", cancellationToken);
        }

        if (role is null)
        {
            return AuthResult.Fail("No valid role found. Create roles first.");
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

        var roleName = string.IsNullOrWhiteSpace(role.RoleName)
            ? "Student"
            : role.RoleName!.Trim();
        var (token, expiresAtUtc) = tokenService.GenerateToken(user.UserId, user.Username, roleName);

        return AuthResult.Success(user.UserId, user.Username, roleName, token, expiresAtUtc);
    }
}
