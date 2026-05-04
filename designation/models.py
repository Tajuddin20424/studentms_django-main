from django.db import models
from department.models import Department   


class Designation(models.Model):
    name       = models.CharField(max_length=100)
    created_by = models.CharField(max_length=100, default='Admin')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    status     = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'designation'
        managed  = True   
