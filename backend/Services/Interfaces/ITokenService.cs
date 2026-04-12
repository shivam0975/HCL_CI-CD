namespace backend.Services.Interfaces;

public interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(int userId, string username, string role);
}
