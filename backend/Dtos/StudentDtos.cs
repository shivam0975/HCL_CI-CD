using System;

namespace backend.Dtos;

public record StudentDto(int StudentId, int? UserId, string Name, string? Email, string? Phone, DateTime? Dob, int? DepartmentId, DateTime? CreatedAt, DateTime? UpdatedAt);
public record CreateStudentDto(int? UserId, string Name, string? Email, string? Phone, DateTime? Dob, int? DepartmentId);
public record UpdateStudentDto(string Name, string? Email, string? Phone, DateTime? Dob, int? DepartmentId);
