using backend.Dtos;

namespace backend.DTOs.Users;

public sealed record UserReadDto(
    int UserId,
    string Username,
    RoleDto? Role,
    DateTime? CreatedAt);
