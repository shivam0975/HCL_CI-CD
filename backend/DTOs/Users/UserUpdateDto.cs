using backend.Dtos;

namespace backend.DTOs.Users;

public sealed record UserUpdateDto(
    string? Username = null,
    string? Password = null,
    RoleDto? Role = null);
