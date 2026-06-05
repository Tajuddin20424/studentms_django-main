from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from students.models import Student
from teachers.models import Teacher
from subjects.models import Subject
from classes.models import ClassModel
from designation.models import Designation
from department.models import Department
from django.utils import timezone
import re

def home(request):
    context = {
        'student_count': Student.objects.count(),
        'teacher_count': Teacher.objects.count(),
        'subject_count': Subject.objects.count(),
        'class_count': ClassModel.objects.count(),
        'designation_count': Designation.objects.count(),
        'department_count': Department.objects.count(),
    }
    return render(request, 'home.html', context)


def student_list(request):
    students = Student.objects.all().order_by('id')
    return render(request, 'students/student_list.html', {'students': students})


@csrf_exempt
def add_student(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        address = request.POST.get('address', '').strip()
        status = request.POST.get('status', '').strip()

        errors = {}

        if not name: errors['name'] = 'Name is required'
        if not email:
            errors['email'] = 'Email is required'
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            errors['email'] = 'Invalid email address'

        if not phone:
            errors['phone'] = 'Phone is required'
        elif not re.match(r'^[0-9]{10,15}$', phone):
            errors['phone'] = 'Phone must be 10-15 digits'

        if not address: errors['address'] = 'Address is required'
        if not status: errors['status'] = 'Please select a status'

        if errors:
            return JsonResponse({'status': 'error_fields', 'errors': errors})

        Student.objects.create(
            name=name, email=email, phone=phone, address=address, status=status
            , created_at=timezone.now(), updated_at=timezone.now()
        )
        return JsonResponse({'status': 'success', 'message': 'Student added successfully!'})


@csrf_exempt
def update_student(request, id):
    student = get_object_or_404(Student, id=id)

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        address = request.POST.get('address', '').strip()
        status = request.POST.get('status', '').strip()

        errors = {}

        if not name: errors['name'] = 'Name is required'
        if not email:
            errors['email'] = 'Email is required'
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            errors['email'] = 'Invalid email address'

        if not phone:
            errors['phone'] = 'Phone is required'
        elif not re.match(r'^[0-9]{10,15}$', phone):
            errors['phone'] = 'Phone must be 10-15 digits'

        if not address: errors['address'] = 'Address is required'
        if not status: errors['status'] = 'Please select a status'

        if errors:
            return JsonResponse({'status': 'error_fields', 'errors': errors})

        student.name = name
        student.email = email
        student.phone = phone
        student.address = address
        student.status = status
        student.updated_at = timezone.now()
        student.save()

        return JsonResponse({'status': 'success', 'message': 'Student updated successfully!'})



@csrf_exempt
def delete_student(request, id):
    student = get_object_or_404(Student, id=id)
    if request.method == 'POST':
        student.delete()
        return JsonResponse({'status': 'success', 'message': 'Student deleted successfully!'})
