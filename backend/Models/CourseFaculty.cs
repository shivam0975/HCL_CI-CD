using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CourseFaculty
{
    public int Id { get; set; }

    public int? CourseId { get; set; }

    public int? FacultyId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public virtual Course? Course { get; set; }

    public virtual Faculty? Faculty { get; set; }
}
