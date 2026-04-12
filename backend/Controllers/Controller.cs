using backend.Services.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
	[AllowAnonymous]
	[HttpPost("register")]
	public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
	{
		var result = await authService.RegisterAsync(request, cancellationToken);
		if (!result.Succeeded)
		{
			return BadRequest(result);
		}

		return Ok(result);
	}

	[AllowAnonymous]
	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
	{
		var result = await authService.LoginAsync(request, cancellationToken);
		if (!result.Succeeded)
		{
			return Unauthorized(result);
		}

		return Ok(result);
	}
}

