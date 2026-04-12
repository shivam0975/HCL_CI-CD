using backend.Services.Auth;

namespace backend.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}
