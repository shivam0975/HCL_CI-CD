using backend.DTOs.Users;
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
	public async Task<IActionResult> Register([FromBody] UserCreateDto request, CancellationToken cancellationToken)
	{
		var roleId = request.Role is not null && request.Role.RoleId > 0
			? request.Role.RoleId
			: null;

		var registerRequest = new RegisterRequest
		{
			Username = request.Username,
			Password = request.Password,
			RoleId = roleId,
			RoleName = request.Role?.RoleName
		};

		var result = await authService.RegisterAsync(registerRequest, cancellationToken);
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

