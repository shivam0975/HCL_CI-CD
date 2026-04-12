using System;

namespace backend.Dtos;

public record AttendanceDto(int AttendanceId, int? StudentId, int? CourseId, DateTime? Date, string? Status);
public record CreateAttendanceDto(int? StudentId, int? CourseId, DateTime? Date, string? Status);
public record UpdateAttendanceDto(int? StudentId, int? CourseId, DateTime? Date, string? Status);
