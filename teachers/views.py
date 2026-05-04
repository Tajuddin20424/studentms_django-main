from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Teacher
from datetime import datetime

def teacher_list(request):
    teachers = Teacher.objects.all().order_by('id')
    return render(request, 'teachers/teacher_list.html', {'teachers': teachers})

@csrf_exempt
def add_teacher(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')

        if not name:
            return JsonResponse({'status': 'error', 'errors': {'name': 'Name is required'}})
        if not email:
            return JsonResponse({'status': 'error', 'errors': {'email': 'Email is required'}})
        if not phone:
            return JsonResponse({'status': 'error', 'errors': {'phone': 'Phone is required'}})

        Teacher.objects.create(
            name=name,
            email=email,
            phone=phone,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        return JsonResponse({'status': 'success', 'message': 'Teacher added successfully!'})

@csrf_exempt
def update_teacher(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    if request.method == 'POST':
        teacher.name = request.POST.get('name')
        teacher.email = request.POST.get('email')
        teacher.phone = request.POST.get('phone')
        teacher.updated_at = datetime.now()
        teacher.save()
        return JsonResponse({'status': 'success', 'message': 'Teacher updated successfully!'})

@csrf_exempt
def delete_teacher(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    if request.method == 'POST':
        teacher.delete()
        return JsonResponse({'status': 'success', 'message': 'Teacher deleted successfully!'})
