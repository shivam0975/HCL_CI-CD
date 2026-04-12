namespace backend.DTOs.Faculties;

public sealed record FacultyReadDto(
    int FacultyId,
    int? UserId,
    string Name,
    string? Email,
    int? DepartmentId,
    string? DepartmentName,
    string? Username,
    DateTime? CreatedAt);
