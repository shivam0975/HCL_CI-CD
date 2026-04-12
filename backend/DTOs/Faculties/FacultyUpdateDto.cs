namespace backend.DTOs.Faculties;

public sealed record FacultyUpdateDto(
    int? UserId,
    string Name,
    string? Email,
    int? DepartmentId);
