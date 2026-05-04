from django.db import models

class Department(models.Model):

    name       = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255, default='Admin')
    status     = models.IntegerField(default=1)  
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'department'
        managed = True