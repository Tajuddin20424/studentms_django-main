from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from .models import Department
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

@csrf_exempt
def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'


def department_list(request):
    if is_ajax(request):
        departments = []
        for d in Department.objects.all():
            departments.append({
                'id': d.id,
                'name': d.name,
                'status': d.status,
                'created_at': d.created_at.strftime('%Y-%m-%d %H:%M:%S') if d.created_at else '',
                'created_by': d.created_by if d.created_by else '',
            })

        return JsonResponse({
            'status': 'success',
            'departments': departments
        })

    return render(request, 'department/department.html')

def department_list2(request):
    return render(request, 'department/department2.html')


def department_add(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        status = int(request.POST.get('status', 1))

        if name:
            Department.objects.create(
                name=name,
                created_by='Admin',
                status=status,
            )
            if is_ajax(request):
                return JsonResponse({'status': 'success', 'message': 'Department added successfully!'})
            return redirect('department_list')

        if is_ajax(request):
            return JsonResponse({'status': 'error_fields', 'errors': {'name': 'Name is required'}})
        return redirect('department_list')

    return redirect('department_list')


def department_edit(request, id):
    dept = get_object_or_404(Department, id=id)

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        status = request.POST.get('status', dept.status)

        errors = {}

        if not name:
            errors['name'] = 'Name is required'

        if errors:
            return JsonResponse({
                'status': 'error_fields',
                'errors': errors
            })

        dept.name = name
        dept.status = int(status)
        dept.save()

        if is_ajax(request):
            return JsonResponse({
                'status': 'success',
                'message': 'Department updated successfully!'
            })

        return redirect('department_list')

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    })


def department_delete(request, id):
    dept = get_object_or_404(Department, id=id)
    dept.delete()

    if is_ajax(request):
        return JsonResponse({'status': 'success', 'message': 'Department deleted successfully!'})
    return redirect('department_list')


def update_department(request, id):
    dept = get_object_or_404(Department, id=id)

    if request.method == 'POST':
        dept.name = request.POST.get('name', dept.name).strip()
        dept.status = int(request.POST.get('status', dept.status))
        dept.save()
        return redirect('department_list')

    return redirect('department_list')




def get_department_list2(request):
    # subjects = Subject.objects.all().order_by('id')

    cursor = connection.cursor()
    base_sql = """
        SELECT 
        d.id as id,
        d.name as name,
        d.status as status,
        d.created_at as created_at,
        d.created_by as created_by
        FROM department d
    """
    # params = [selected_event_id]
    # ✅ Execute query
    cursor.execute(base_sql)
    departments = dictfetchall(cursor) 
    print("DEBUG",departments)

    # return render(request, 'subjects/subject_list.html', {'subjects': subjects})
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            "departments": departments
        })