namespace backend.Services.Auth;

public sealed class RegisterRequest
{
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public int? RoleId { get; init; }
    public string? RoleName { get; init; }
}
