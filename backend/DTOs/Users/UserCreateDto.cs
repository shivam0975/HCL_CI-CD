namespace backend.DTOs.Users;

public sealed record UserCreateDto(
    string Username,
    string Password,
    int? RoleId = null,
    string? RoleName = null);
