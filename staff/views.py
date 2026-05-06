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

# --- ৩. ড্রপডাউনের জন্য সব ক্লাস নিয়ে আসা (Teacher Name সহ) ---
def get_all_classes(request):
    try:
        with connection.cursor() as cursor:
            # 'classes' টেবিলের সাথে 'teachers' টেবিল বাম জয়েন করা হয়েছে
            sql = """
                SELECT 
                    c.id, 
                    c.class_name, 
                    COALESCE(t.name, 'No Teacher Assigned') as teacher_name 
                FROM classes c
                LEFT JOIN teachers t ON c.teacher_id = t.id
                ORDER BY c.class_name ASC
            """
            cursor.execute(sql) 
            classes = dictfetchall(cursor)
        
        # ডিবাগিং এর জন্য কনসোলে প্রিন্ট করা
        print(f"Classes Data Loaded: {len(classes)} items found.") 
        return JsonResponse({'classes': classes})
    except Exception as e:
        print(f"Error in get_all_classes: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# --- ৪. কুইক অ্যাড মোডাল থেকে নতুন ক্লাস সেভ করা ---
@csrf_exempt
def add_class_data(request):
    if request.method == "POST":
        class_name = request.POST.get("class_name")
        teacher_id = request.POST.get("teacher_id") # ঐচ্ছিক: যদি টিচার সিলেক্ট করার অপশন থাকে
        
        if not class_name:
            return JsonResponse({"status": "error", "message": "Class name is required"}, status=400)

        try:
            with connection.cursor() as cursor:
                if teacher_id:
                    sql = "INSERT INTO classes (class_name, teacher_id) VALUES (%s, %s)"
                    cursor.execute(sql, [class_name, teacher_id])
                else:
                    sql = "INSERT INTO classes (class_name) VALUES (%s)"
                    cursor.execute(sql, [class_name])
                    
            return JsonResponse({"status": "success", "message": "New Class added successfully!"})
        except Exception as e:
            print(f"Database Error in add_class_data: {e}")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
                
    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

# 5. Add new staff member (With Class Assignment)
@csrf_exempt
def add_staff_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        dob = request.POST.get("dob")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        designation_id = request.POST.get("designation") 
        assigned_classes = request.POST.getlist('assigned_classes') 

        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO staff (name, dob, mobile, email, designation_id) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql, [name, dob, mobile, email, designation_id])
                staff_id = cursor.lastrowid
                
                # বহু-থেকে-বহু (Many-to-Many) রিলেশন হ্যান্ডেল করা
                if assigned_classes:
                    for class_id in assigned_classes:
                        cursor.execute("INSERT INTO staff_classes (staff_id, class_id) VALUES (%s, %s)", [staff_id, class_id])
            
            return JsonResponse({"status": "success", "message": "Staff added successfully!"})
        except Exception as e:
            print(f"Error in add_staff_data: {e}")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 6. Fetch data for the table (using JOIN).
def get_staff_data(request):
    try:
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
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 7. Save new designation from the popup.
@csrf_exempt
def add_designation_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        status = request.POST.get("status", 1)
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO designation (name, status) VALUES (%s, %s)"
                cursor.execute(sql, [name, status])
            return JsonResponse({"status": "success", "message": "New Designation added successfully!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
            
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 8. Fetch data for a specific staff member (Includes assigned classes)
def get_single_staff(request):
    staff_id = request.GET.get("id")
    if not staff_id:
        return JsonResponse({"status": "error", "message": "Missing ID"}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM staff WHERE id = %s", [staff_id])
            staff_res = dictfetchall(cursor)
            
            if staff_res:
                staff = staff_res[0]
                cursor.execute("SELECT class_id FROM staff_classes WHERE staff_id = %s", [staff_id])
                classes_res = cursor.fetchall()
                staff['assigned_classes'] = [c[0] for c in classes_res]
                return JsonResponse({"staff": staff})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
            
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

        try:
            with connection.cursor() as cursor:
                sql = """
                    UPDATE staff 
                    SET name=%s, dob=%s, mobile=%s, email=%s, designation_id=%s 
                    WHERE id=%s
                """
                cursor.execute(sql, [name, dob, mobile, email, designation_id, staff_id])
                
                # পুরাতন ক্লাস অ্যাসাইনমেন্ট মুছে নতুন করে ইনসার্ট করা
                cursor.execute("DELETE FROM staff_classes WHERE staff_id = %s", [staff_id])
                if assigned_classes:
                    for class_id in assigned_classes:
                        cursor.execute("INSERT INTO staff_classes (staff_id, class_id) VALUES (%s, %s)", [staff_id, class_id])
                        
            return JsonResponse({"status": "success", "message": "Staff updated successfully!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

# 10. Staff deleted
@csrf_exempt
def delete_staff_data(request):
    if request.method == "POST":
        staff_id = request.POST.get("id")
        try:
            with connection.cursor() as cursor:
                # প্রথমে ফরেন কি টেবিল থেকে মুছতে হবে (staff_classes)
                cursor.execute("DELETE FROM staff_classes WHERE staff_id = %s", [staff_id])
                cursor.execute("DELETE FROM staff WHERE id = %s", [staff_id])
            return JsonResponse({"status": "success", "message": "Staff deleted successfully!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
            
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)