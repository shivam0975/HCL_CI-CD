using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class StudentCourse
{
    public int Id { get; set; }

    public int? StudentId { get; set; }

    public int? CourseId { get; set; }

    public DateTime? EnrolledAt { get; set; }

    public virtual Course? Course { get; set; }

    public virtual Student? Student { get; set; }
}
