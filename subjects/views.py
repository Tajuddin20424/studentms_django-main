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


def subject_list(request):
    # subjects = Subject.objects.all().order_by('id')

    cursor = connection.cursor()
    base_sql = """
        SELECT 
        s.id as sub_id,
        s.name as sub_name,
        s.description as sub_desc,
        s.teacher_id,t.name as teacher_name 
        FROM subjects s, teachers t 
        WHERE s.teacher_id=t.id
    """
    # params = [selected_event_id]
    # ✅ Execute query
    cursor.execute(base_sql)
    subjects = dictfetchall(cursor) 

    # return render(request, 'subjects/subject_list.html', {'subjects': subjects})
    return render(request, 'subjects/subject_list.html')

def subject_add(request):
    return render(request, 'subjects/add.html')

def subject_edit(request, id):
    # subject = Subject.objects.get(id=id)
    teachers = Teacher.objects.all().order_by("name")

    cursor = connection.cursor()
    base_sql = """
        SELECT
            s.id AS id,
            s.name AS name,
            s.description AS description,
            s.teacher_id as teacher_id,
            t.name AS teacher
        FROM subjects s
        LEFT JOIN teachers t ON s.teacher_id = t.id
        WHERE s.id = %s
    """
    params = [id]
    # ✅ Execute query
    cursor.execute(base_sql,params)
    subject_list = dictfetchall(cursor)
    
    if not subject_list:
        return JsonResponse({"status": "error", "message": "Subject not found."})
        # raise Http404("Subject not found")

    subject = subject_list[0]  # ✅ Take the first dict

    print("DEBUG --- id:", id)
    print("DEBUG --- subject:", subject)

    return render(request, "subjects/edit.html", {
        "subject": subject,
        "teachers": teachers,
    })

@csrf_exempt
def get_teachers(request):
    teachers = Teacher.objects.all().order_by("name")

    teachers_list = list(teachers.values("id", "name")) 
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            "teachers": teachers_list,     
        })
    
@csrf_exempt
def get_subjects(request):
    # teachers = Teacher.objects.all().order_by("name")

    cursor = connection.cursor()
    base_sql = """
        SELECT
            s.id AS id,
            s.name AS name,
            s.description AS description,
            s.teacher_id as teacher_id,
            t.name AS teacher
        FROM subjects s
        LEFT JOIN teachers t ON s.teacher_id = t.id
    """
    # params = [selected_event_id]
    # ✅ Execute query
    cursor.execute(base_sql)
    subjects = dictfetchall(cursor)
    print("DEBUG",subjects)

    # subjects_list = list(subjects.values("id", "name"))
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            "subjects": subjects,
        })

@csrf_exempt    
def save_subjects(request):
    if request.method == "POST":
        sub_name = request.POST.get('name')
        sub_description = request.POST.get('description')
        teacher_id = request.POST.get('teachers')
        created_at = timezone.now().date()
        updated_at = timezone.now().date()

        # 'name': sub_name,
        # 'description': sub_description,
        # 'teachers': teacher_id,

        try:
            ## Check for duplicates
            # exists = Subject.objects.filter(
            #     name= sub_name,
            #     description= sub_description,
            #     teachers= teacher_id,
            # ).exists()

            # if exists:
            #     return JsonResponse({"status": "exists", "message": "Attendance already exists."})

            # Save new record
            # Subject.objects.create(
            #     name= sub_name,
            #     description= sub_description,
            #     teachers= teacher_id,
            #     created_at= timezone.now().date(),
            #     updated_at= timezone.now().date(),
            # )

            cursor = connection.cursor()
            sql = """
                INSERT INTO subjects (name, description, teacher_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
            """
            params = [sub_name, sub_description, teacher_id, created_at, updated_at]

            cursor.execute(sql, params)

            return JsonResponse({"status": "success", "message": "Attendance saved successfully!!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

    return JsonResponse({"status": "failed", "message": "Invalid request"})

@csrf_exempt    
def remove_subjects(request):
    if request.method == "POST":
        sub_id = request.POST.get('sub_id')

        try:

            cursor = connection.cursor()
            sql = """
                DELETE FROM subjects
                WHERE id = %s
            """
            params = [sub_id]

            cursor.execute(sql, params)

            return JsonResponse({"status": "success", "message": "Remove successfully!!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

    return JsonResponse({"status": "failed", "message": "Invalid request"})

@csrf_exempt    
def update_subjects(request):
    if request.method == "POST":
        sub_id = request.POST.get('sub_id')
        sub_name = request.POST.get('name')
        sub_description = request.POST.get('description')
        teacher_id = request.POST.get('teachers')
        created_at = timezone.now().date()
        updated_at = timezone.now().date()

        # 'name': sub_name,
        # 'description': sub_description,
        # 'teachers': teacher_id,

        try:
            ## Check for duplicates
            # exists = Subject.objects.filter(
            #     name= sub_name,
            #     description= sub_description,
            #     teachers= teacher_id,
            # ).exists()

            # if exists:
            #     return JsonResponse({"status": "exists", "message": "Attendance already exists."})

            # Save new record
            # Subject.objects.create(
            #     name= sub_name,
            #     description= sub_description,
            #     teachers= teacher_id,
            #     created_at= timezone.now().date(),
            #     updated_at= timezone.now().date(),
            # )

            cursor = connection.cursor()           
            sql = """
                UPDATE subjects
                SET name = %s,
                    description = %s,
                    teacher_id = %s,
                    updated_at = %s
                WHERE id = %s
            """
            params = [
                sub_name,
                sub_description,
                teacher_id,
                updated_at,
                sub_id
            ]
            cursor.execute(sql, params)

            return JsonResponse({"status": "success", "message": "Updated successfully!!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

    return JsonResponse({"status": "failed", "message": "Invalid request"})