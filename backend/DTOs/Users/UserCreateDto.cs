using backend.Dtos;

namespace backend.DTOs.Users;

public sealed record UserCreateDto(
    string Username,
    string Password,
    RoleDto? Role = null);
