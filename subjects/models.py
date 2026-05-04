from django.db import models


from students.models import Student
from teachers.models import Teacher

class Subject(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    # teacher_id = models.ForeignKey(Teacher, db_column='teacher_id', on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, db_column='teacher_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'subjects'
        managed = True

class StudentSubject(models.Model):
    id = models.BigAutoField(primary_key=True)
    student_id = models.ForeignKey(Student, db_column='student_id', on_delete=models.CASCADE)
    subject_id = models.ForeignKey(Subject, db_column='subject_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'student_subject'
        managed = True
