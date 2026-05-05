from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Helper function: ডাটাবেস থেকে আসা ডাটাকে ডিকশনারি ফরম্যাটে রূপান্তর করা
def dictfetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# 1. Page load 
def staff_list_view(request):
    return render(request, 'staff/staff_list.html')

# 2. Fetch all designations for the dropdown
@csrf_exempt
def get_designation(request):
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM designation WHERE status = 1")
    designation = dictfetchall(cursor)
    return JsonResponse({'designation' : designation})

# --- ৩. ড্রপডাউনের জন্য সব ক্লাস নিয়ে আসা ---
def get_all_classes(request):
    with connection.cursor() as cursor:
        # ডাটাবেস টেবিলের নাম 'classes' নিশ্চিত করুন
        cursor.execute("SELECT id, class_name FROM classes") 
        classes = dictfetchall(cursor)
    return JsonResponse({'classes': classes})

# --- ৪. কুইক অ্যাড মোডাল থেকে নতুন ক্লাস সেভ করা ---
@csrf_exempt
def add_class_data(request):
    if request.method == "POST":
        class_name = request.POST.get("class_name")
        if class_name:
            with connection.cursor() as cursor:
                # ডাটাবেসের 'classes' টেবিলে নতুন ক্লাস ইনসার্ট করা
                sql = "INSERT INTO classes (class_name) VALUES (%s)"
                cursor.execute(sql, [class_name])
            return JsonResponse({"status": "success", "message": "New Class added successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request or empty data"}, status=400)

# 5. Add new staff member (With Class Assignment)
@csrf_exempt
def add_staff_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        dob = request.POST.get("dob")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        designation_id = request.POST.get("designation") 
        # চেকবক্স থেকে আসা ক্লাসের লিস্ট
        assigned_classes = request.POST.getlist('assigned_classes') 

        with connection.cursor() as cursor:
            # ১. স্টাফ ডাটা ইনসার্ট করা
            sql = "INSERT INTO staff (name, dob, mobile, email, designation_id) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, [name, dob, mobile, email, designation_id])
            
            # ২. সদ্য তৈরি হওয়া স্টাফের আইডি নেওয়া
            staff_id = cursor.lastrowid
            
            # ৩. স্টাফের সাথে ক্লাসগুলো ম্যাপিং টেবিলে সেভ করা
            if assigned_classes:
                for class_id in assigned_classes:
                    cursor.execute("INSERT INTO staff_classes (staff_id, class_id) VALUES (%s, %s)", [staff_id, class_id])
        
        return JsonResponse({"status": "success", "message": "Staff added successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 6. Fetch data for the table (using JOIN).
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

# 7. Save new designation from the popup.
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

# 8. Fetch data for a specific staff member (Includes assigned classes)
def get_single_staff(request):
    staff_id = request.GET.get("id")
    with connection.cursor() as cursor:
        # স্টাফের বেসিক তথ্য
        cursor.execute("SELECT * FROM staff WHERE id = %s", [staff_id])
        staff_res = dictfetchall(cursor)
        
        if staff_res:
            staff = staff_res[0]
            # ওই স্টাফের এসাইন করা ক্লাস আইডিগুলো নিয়ে আসা (Checkbox টিক দেওয়ার জন্য)
            cursor.execute("SELECT class_id FROM staff_classes WHERE staff_id = %s", [staff_id])
            classes_res = cursor.fetchall()
            staff['assigned_classes'] = [c[0] for c in classes_res]
            return JsonResponse({"staff": staff})
            
    return JsonResponse({"staff": {}})

# 9. Staff updated (With Class Assignment)
@csrf_exempt
def update_staff_data(request):
    if request.method == "POST":
        staff_id = request.POST.get("id")
        name = request.POST.get("name")
        dob = request.POST.get("dob")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        designation_id = request.POST.get("designation")
        assigned_classes = request.POST.getlist('assigned_classes')

        with connection.cursor() as cursor:
            # ১. স্টাফের মূল তথ্য আপডেট
            sql = """
                UPDATE staff 
                SET name=%s, dob=%s, mobile=%s, email=%s, designation_id=%s 
                WHERE id=%s
            """
            cursor.execute(sql, [name, dob, mobile, email, designation_id, staff_id])
            
            # ২. আগের সব ক্লাস ম্যাপিং মুছে ফেলা
            cursor.execute("DELETE FROM staff_classes WHERE staff_id = %s", [staff_id])
            
            # ৩. নতুন করে সিলেক্ট করা ক্লাসগুলো ইনসার্ট করা
            if assigned_classes:
                for class_id in assigned_classes:
                    cursor.execute("INSERT INTO staff_classes (staff_id, class_id) VALUES (%s, %s)", [staff_id, class_id])
                    
        return JsonResponse({"status": "success", "message": "Staff updated successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 10. Staff deleted
@csrf_exempt
def delete_staff_data(request):
    if request.method == "POST":
        staff_id = request.POST.get("id")
        with connection.cursor() as cursor:
            # ফরেন কি এরর এড়াতে প্রথমে ম্যাপিং টেবিল থেকে ডিলিট করা
            cursor.execute("DELETE FROM staff_classes WHERE staff_id = %s", [staff_id])
            cursor.execute("DELETE FROM staff WHERE id = %s", [staff_id])
        return JsonResponse({"status": "success", "message": "Staff deleted successfully!"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)