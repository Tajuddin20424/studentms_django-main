from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Helper function: Convert the data received from the database into dictionary format.
def dictfetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# 1.Page load 
def staff_list_view(request):
    return render(request, 'staff/staff_list.html')

# 2. Fetch all designations for the dropdown
@csrf_exempt
def get_designation(request):
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM designation WHERE status = 1")
    designation = dictfetchall(cursor)
    return JsonResponse({'designation' : designation})

# 3. Add new staff member
@csrf_exempt
def add_staff_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        dob = request.POST.get("dob")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        designation_id = request.POST.get("designation") 

        with connection.cursor() as cursor:
            sql = "INSERT INTO staff (name, dob, mobile, email, designation_id) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, [name, dob, mobile, email, designation_id])
        
        return JsonResponse({"status": "success", "message": "Staff added successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 4. Fetch data for the table (using JOIN).
def get_staff_data(request):
    cursor = connection.cursor()
    base_sql = """
        SELECT 
            s.id as id,
            s.name as name,
            s.dob as dob,
            s.mobile as mobile,
            s.email as email,
            d.name as designation_name
        FROM staff s
        LEFT JOIN designation d ON s.designation_id = d.id
        ORDER BY s.id DESC
    """
    cursor.execute(base_sql)
    staff_list = dictfetchall(cursor)
    return JsonResponse({"staff": staff_list})

# 5. Save new designation from the popup.
@csrf_exempt
def add_designation_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        status = request.POST.get("status", 1)
        with connection.cursor() as cursor:
            sql = "INSERT INTO designation (name, status) VALUES (%s, %s)"
            cursor.execute(sql, [name, status])
        return JsonResponse({"status": "success", "message": "New Designation added successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# --- New updated edit and delete functions ---

# 6. Fetch data for a specific staff member (to populate the form during edit).
def get_single_staff(request):
    staff_id = request.GET.get("id")
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM staff WHERE id = %s", [staff_id])
        staff = dictfetchall(cursor)
    return JsonResponse({"staff": staff[0] if staff else {}})

# staff updated
@csrf_exempt
def update_staff_data(request):
    if request.method == "POST":
        staff_id = request.POST.get("id")
        name = request.POST.get("name")
        dob = request.POST.get("dob")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        designation_id = request.POST.get("designation")

        with connection.cursor() as cursor:
            sql = """
                UPDATE staff 
                SET name=%s, dob=%s, mobile=%s, email=%s, designation_id=%s 
                WHERE id=%s
            """
            cursor.execute(sql, [name, dob, mobile, email, designation_id, staff_id])
        return JsonResponse({"status": "success", "message": "Staff updated successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 8. staff deleted
@csrf_exempt
def delete_staff_data(request):
    if request.method == "POST":
        staff_id = request.POST.get("id")
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM staff WHERE id = %s", [staff_id])
        return JsonResponse({"status": "success", "message": "Staff deleted successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)