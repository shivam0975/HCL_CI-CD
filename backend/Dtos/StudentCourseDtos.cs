using System;

namespace backend.Dtos;

public record StudentCourseDto(int Id, int? StudentId, int? CourseId, DateTime? EnrolledAt);
public record CreateStudentCourseDto(int? StudentId, int? CourseId);
public record UpdateStudentCourseDto(int? StudentId, int? CourseId);
