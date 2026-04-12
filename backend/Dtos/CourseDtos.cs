using System;

namespace backend.Dtos;

public record CourseDto(int CourseId, string CourseName, string? CourseCode, int? Credits, int? Semester, int? DepartmentId);
public record CreateCourseDto(string CourseName, string? CourseCode, int? Credits, int? Semester, int? DepartmentId);
public record UpdateCourseDto(string CourseName, string? CourseCode, int? Credits, int? Semester, int? DepartmentId);
