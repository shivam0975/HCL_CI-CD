using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Faculty
{
    public int FacultyId { get; set; }

    public int? UserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public int? DepartmentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<CourseFaculty> CourseFaculties { get; set; } = new List<CourseFaculty>();

    public virtual Department? Department { get; set; }

    public virtual User? User { get; set; }
}
