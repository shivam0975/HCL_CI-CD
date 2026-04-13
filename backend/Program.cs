using backend.Models;
using backend.Services.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MySql.EntityFrameworkCore.Extensions;
using Scalar.AspNetCore;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendCorsPolicy";

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, _, _) =>
                {
                    document.Components ??= new OpenApiComponents();
                    document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                    document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Name = "Authorization",
                        Description = "Provide JWT token"
                    };

                    return Task.CompletedTask;
                });
            });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

builder.Services.AddDbContext<StudentManagementContext>(options =>
    options.UseMySQL(connectionString));

builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

// builder.Services.AddAuthorization(options =>
// {
//     static bool HasRole(AuthorizationHandlerContext context, string role) =>
//         context.User.Claims.Any(claim =>
//             claim.Type == ClaimTypes.Role &&
//             string.Equals(claim.Value?.Trim(), role, StringComparison.OrdinalIgnoreCase));

//     options.AddPolicy("AdminOnly", policy =>
//         policy.RequireAssertion(context => HasRole(context, "Admin")));

//     options.AddPolicy("FacultyOnly", policy =>
//         policy.RequireAssertion(context => HasRole(context, "Faculty")));

//     options.AddPolicy("StudentOnly", policy =>
//         policy.RequireAssertion(context => HasRole(context, "Student")));

//     options.AddPolicy("AdminOrFaculty", policy =>
//         policy.RequireAssertion(context => HasRole(context, "Admin") || HasRole(context, "Faculty")));
// });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "ADMIN"));
    options.AddPolicy("FacultyOnly", policy => policy.RequireRole("Faculty", "FACULTY"));
    options.AddPolicy("StudentOnly", policy => policy.RequireRole("Student", "STUDENT"));
    options.AddPolicy("AdminOrFaculty", policy => policy.RequireRole("Admin", "ADMIN", "Faculty", "FACULTY"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
