// 1. Function to load the staff list table.
function loadStaffList() {
    $.ajax({
        url: "/staff/get-data/",
        method: "GET",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        success: function (response) {
            let staffList = response.staff;
            let tbody = "";
            $.each(staffList, function (index, s) {
                tbody += `
                <tr class="staff-row">
                    <td>${index + 1}</td>
                    <td>${s.name}</td>
                    <td>${s.dob}</td>
                    <td>${s.mobile}</td>
                    <td>${s.email}</td>
                    <td>${s.designation_name ? s.designation_name : "N/A"}</td> 
                    <td>
                        <button class="btn btn-sm btn-warning editStaffBtn" data-id="${s.id}">Edit</button>
                        <button class="btn btn-sm btn-danger deleteStaffBtn" data-id="${s.id}">Delete</button>
                    </td>
                </tr>`;
            });
            $("#staffTableBody").html(tbody);
        },
        error: function () {
            console.error("Error loading staff list.");
        },
    });
}

// 2. Function to load class data in the dropdown (URL FIX: /staff/ added)
function loadClassCombo() {
    $.ajax({
        url: "/staff/get-all-classes/", // Terminal 404 error fix
        method: "GET",
        success: function (response) {
            let options = '<option value="">Choose Class...</option>';
            if (response.classes && response.classes.length > 0) {
                $.each(response.classes, function (i, cls) {
                    let teacherInfo = cls.teacher_name ? ` - ${cls.teacher_name}` : "";
                    options += `<option value="${cls.id}">${cls.class_name}${teacherInfo}</option>`;
                });
            }
            $("#class_combo").html(options); 
        },
        error: function(xhr) {
            console.error("AJAX Error (Class Combo):", xhr.responseText);
        }
    });
}

// 3. Function to load classes in the checkbox list (URL FIX: /staff/ added)
function loadAllClasses(selectedClasses = []) {
    $.ajax({
        url: "/staff/get-all-classes/", // URL Fix
        method: "GET",
        success: function(response) {
            let classesListDiv = $("#classes_checkbox_list");
            let html = "";
            
            if (response.classes && response.classes.length > 0) {
                $.each(response.classes, function(i, cls) {
                    let isChecked = selectedClasses.map(String).includes(String(cls.id)) ? "checked" : "";
                    let teacherInfo = cls.teacher_name ? ` (${cls.teacher_name})` : "";
                    
                    html += `
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="checkbox" name="assigned_classes" value="${cls.id}" id="class_${cls.id}" ${isChecked}>
                            <label class="form-check-label" for="class_${cls.id}">
                                ${cls.class_name}${teacherInfo}
                            </label>
                        </div>`;
                });
                classesListDiv.html(`<div class="row">${html}</div>`);
                $("#class_selection_section").show();
            } else {
                classesListDiv.html("<p class='text-muted'>No classes found.</p>");
            }
        },
        error: function() {
            console.error("Error loading classes checkboxes.");
        }
    });
}

$(document).ready(function () {
    // 1. Initial data load
    loadStaffList();
    loadClassCombo();

    // 2. Update checkbox list when class dropdown changes
    $(document).on("change", "#class_combo", function() {
        if($(this).val() !== "") {
            loadAllClasses();
        } else {
            $("#class_selection_section").hide();
        }
    });

    // 3. Quick Add Class
    $(document).on("submit", "#quickAddClassForm", function (e) {
        e.preventDefault();
        $.ajax({
            url: "/staff/add-class-data/", // URL Sync
            method: "POST",
            data: $(this).serialize(),
            success: function (response) {
                alert("✅ New Class Added!");
                $("#addClassModal").modal("hide");
                $("#quickAddClassForm")[0].reset();
                loadClassCombo(); 
            }
        });
    });

    // 4. Add and Update Staff
    $("#addStaffForm").on("submit", function (e) {
        e.preventDefault();
        let staffId = $("#staff_id").val();
        let targetUrl = staffId ? "/staff/update-data/" : "/staff/add-data/";

        $.ajax({
            url: targetUrl,
            method: "POST",
            data: $(this).serialize(), 
            success: function (response) {
                if (response.status === "success") {
                    alert("✅ " + response.message);
                    $("#addStaffModal").modal("hide");
                    $("#addStaffForm")[0].reset();
                    $("#staff_id").val(""); 
                    $("#class_selection_section").hide(); 
                    loadStaffList();
                } else {
                    alert("❌ " + response.message);
                }
            }
        });
    });

    // 5. Edit Staff
    $(document).on("click", ".editStaffBtn", function () {
        let id = $(this).data("id");
        $.ajax({
            url: "/staff/get-single/",
            method: "GET",
            data: { id: id },
            success: function (response) {
                let s = response.staff;
                $("#addStaffModal h4").text("Edit Staff Member");
                $("input[name='name']").val(s.name);
                $("input[name='dob']").val(s.dob);
                $("input[name='mobile']").val(s.mobile);
                $("input[name='email']").val(s.email);
                $("#designation_combo").val(s.designation_id);
                
                if($("#staff_id").length == 0) {
                    $("#addStaffForm").append(`<input type="hidden" id="staff_id" name="id" value="${s.id}">`);
                } else {
                    $("#staff_id").val(s.id);
                }

                let assignedClasses = s.assigned_classes || [];
                loadAllClasses(assignedClasses);
                $("#addStaffModal").modal("show");
            }
        });
    });

    // 6. Delete Staff
    $(document).on("click", ".deleteStaffBtn", function () {
        let id = $(this).data("id");
        let csrfToken = $("input[name=csrfmiddlewaretoken]").val();
        if (confirm("Are you sure?")) {
            $.ajax({
                url: "/staff/delete-data/",
                method: "POST",
                data: { id: id, csrfmiddlewaretoken: csrfToken },
                success: function (response) {
                    alert("🗑️ " + response.message);
                    loadStaffList();
                }
            });
        }
    });

    // 7. Quick Add Designation
    $(document).on("submit", "#quickAddDesignationForm", function (e) {
        e.preventDefault();
        $.ajax({
            url: "/staff/add-designation/", 
            method: "POST",
            data: $(this).serialize(),
            success: function (response) {
                alert("✅ New Designation Added!");
                $("#addDesignationModal").modal("hide");
                $("#quickAddDesignationForm")[0].reset();
                if (typeof loadDesignationCombo === "function") {
                    loadDesignationCombo();
                }
            }
        });
    });
});