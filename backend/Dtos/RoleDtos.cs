using System;

namespace backend.Dtos;

public record RoleDto(int RoleId, string? RoleName);
public record CreateRoleDto(string? RoleName);
public record UpdateRoleDto(string? RoleName);
