namespace backend.DTOs.Users;

public sealed record UserUpdateDto(
    string? Username = null,
    string? Password = null,
    int? RoleId = null,
    string? RoleName = null);
