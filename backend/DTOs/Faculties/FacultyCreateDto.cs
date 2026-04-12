namespace backend.DTOs.Faculties;

public sealed record FacultyCreateDto(
    int? UserId,
    string Name,
    string? Email,
    int? DepartmentId);
