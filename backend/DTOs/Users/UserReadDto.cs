namespace backend.DTOs.Users;

public sealed record UserReadDto(
    int UserId,
    string Username,
    int? RoleId,
    string? RoleName,
    DateTime? CreatedAt);
