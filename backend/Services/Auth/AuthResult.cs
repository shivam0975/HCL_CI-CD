namespace backend.Services.Auth;

public sealed class AuthResult
{
    public bool Succeeded { get; init; }
    public string? Error { get; init; }
    public string? Token { get; init; }
    public DateTime? ExpiresAtUtc { get; init; }
    public int? UserId { get; init; }
    public string? Username { get; init; }
    public string? Role { get; init; }

    public static AuthResult Fail(string error) => new() { Succeeded = false, Error = error };

    public static AuthResult Success(int userId, string username, string role, string token, DateTime expiresAtUtc) =>
        new()
        {
            Succeeded = true,
            UserId = userId,
            Username = username,
            Role = role,
            Token = token,
            ExpiresAtUtc = expiresAtUtc
        };
}
