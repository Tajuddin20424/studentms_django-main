from django.db import models
from students.models import Student
from teachers.models import Teacher
from subjects.models import Subject

class ClassModel(models.Model):
    id = models.BigAutoField(primary_key=True)
    class_name = models.CharField(max_length=255)
    subject_id = models.ForeignKey(Subject, db_column='subject_id', on_delete=models.CASCADE)
    teacher_id = models.ForeignKey(Teacher, db_column='teacher_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'classes'
        managed = True

class ClassStudent(models.Model):
    id = models.BigAutoField(primary_key=True)
    class_id = models.ForeignKey(ClassModel, db_column='class_id', on_delete=models.CASCADE)
    student_id = models.ForeignKey(Student, db_column='student_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'class_student'
        managed = True
