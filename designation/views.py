from django.http import JsonResponse
from django.db import connection
from django.shortcuts import render, redirect, get_object_or_404
from .models import Designation, Department


def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def designation_list(request):
    departments = Department.objects.all()

    cursor = connection.cursor()
    base_sql = """
      SELECT 
      d.id as desig_id, d.name as desig_name, d.created_by as desig_created_by, 
      d.status as desig_status, d.created_at as desig_created_at, dept.name as dept_name 
      FROM designation d 
      left JOIN department dept ON d.department_id=dept.id;
    """
    # params = [selected_event_id]
    # ✅ Execute query
    cursor.execute(base_sql)
    designations = dictfetchall(cursor) 

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'designations': designations})
    else:
        return render(request, 'designation/designation_list.html', {
            'designations': designations,
            'departments': departments
        })


# Add designation
def designation_add(request):
    departments = Department.objects.all()

    if request.method == 'POST':
        name          = request.POST.get('name', '').strip()
        department_id = request.POST.get('department')
        created_by    = request.POST.get('created_by', 'Admin').strip()
        status        = int(request.POST.get('status', 1))

        if name and department_id:
            Designation.objects.create(
                name=name,
                department_id=department_id,
                created_by=created_by,
                status=status,
            )
            return JsonResponse({'status': 'success', 'message': 'Designation added successfully!'})
        else:
            errors = {}
            if not name:
                errors['name'] = 'Name is required'
            if not department_id:
                errors['department'] = 'Department is required'
            return JsonResponse({'status': 'error_fields', 'errors': errors})

    return render(request, 'designation/add.html', {
        'departments': departments
    })


# Edit designation
def edit_designation(request, id):
    designation  = get_object_or_404(Designation, id=id)
    departments  = Department.objects.all()

    if request.method == 'POST':
        designation.name          = request.POST.get('name', designation.name).strip()
        designation.created_by    = request.POST.get('created_by', designation.created_by).strip()
        designation.department_id = request.POST.get('department', designation.department_id)
        designation.status        = int(request.POST.get('status', designation.status))
        designation.save()
        return redirect('designation_list')

    return render(request, 'designation/edit.html', {
        'designation': designation,
        'departments': departments,
    })


# Delete designation
def delete_designation(request, id):
    designation = get_object_or_404(Designation, id=id)
    designation.delete()
    return redirect('designation_list')


# Toggle status designation
def toggle_designation_status(request, id):
    try:
        designation = get_object_or_404(Designation, id=id)
        designation.status = 0 if designation.status == 1 else 1
        designation.save()
        return JsonResponse({
            'status': 'success', 
            'message': f'Status changed to {"Active" if designation.status == 1 else "Inactive"}',
            'new_status': designation.status
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)



# new
def get_designations(request):
    designations = Designation.objects.all().values('id', 'designation_name')
    return JsonResponse(list(designations), safe=False)