using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Course
{
    public int CourseId { get; set; }

    public string CourseName { get; set; } = null!;

    public string? CourseCode { get; set; }

    public int? Credits { get; set; }

    public int? Semester { get; set; }

    public int? DepartmentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<CourseFaculty> CourseFaculties { get; set; } = new List<CourseFaculty>();

    public virtual Department? Department { get; set; }

    public virtual ICollection<StudentCourse> StudentCourses { get; set; } = new List<StudentCourse>();
}
