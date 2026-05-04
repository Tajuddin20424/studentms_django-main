from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Teacher,Subject
from datetime import datetime

from django.db import connection
from django.db.models import F, Q
from django.db.models import Count, Case, When, IntegerField, Q
from django.db import IntegrityError

from django.utils.timezone import now
from django.utils import timezone

@csrf_exempt

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def get_subjects_combo(request):
    subjects = Subject.objects.all().order_by("name")
    subjects_combo_list = list(subjects.values("id", "name"))     
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            "subjects_combo": subjects_combo_list,
        })

def class_add(request):
    return render(request, 'classes/add.html')

def class_list(request):
    return render(request, 'classes/class_list.html')

@csrf_exempt
def get_classes(request):
    # teachers = Teacher.objects.all().order_by("name")

    cursor = connection.cursor()
    base_sql = """
        SELECT
            c.id AS id,
            c.class_name AS class_name,
            s.name AS subject,
            t.name AS teacher
        FROM classes c
        LEFT JOIN subjects s ON c.subject_id = s.id
        LEFT JOIN teachers t ON c.teacher_id = t.id
    """
    # params = [selected_event_id]
    # ✅ Execute query
    cursor.execute(base_sql)
    classes = dictfetchall(cursor)
    print("DEBUG", classes)

    return JsonResponse({
        "classes": classes,
    })

@csrf_exempt
def save_classes(request):
    if request.method == "POST":
        cls_name = request.POST.get('class_name')
        subject_id = request.POST.get('subjects')
        teacher_id = request.POST.get('teachers')
        created_at = timezone.now().date()
        updated_at = timezone.now().date()

        try:
            # Save new class using ORM to stay database agnostic.
            from .models import ClassModel

            ClassModel.objects.create(
                class_name=cls_name,
                subject_id_id=subject_id,
                teacher_id_id=teacher_id,
                created_at=timezone.now(),
                updated_at=timezone.now(),
            )
            return JsonResponse({"status": "success", "message": "Class saved successfully!!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

    return JsonResponse({"status": "failed", "message": "Invalid request"})