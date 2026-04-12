using System;

namespace backend.Dtos;

public record CourseFacultyDto(int Id, int? CourseId, int? FacultyId, DateTime? AssignedAt);
public record CreateCourseFacultyDto(int? CourseId, int? FacultyId);
public record UpdateCourseFacultyDto(int? CourseId, int? FacultyId);
