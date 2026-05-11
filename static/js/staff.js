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
        }
    });
}

// 2. Function to load the teacher dropdown
function loadTeacherCombo() {
    $.ajax({
        url: "/staff/get-all-classes/", 
        method: "GET",
        success: function (response) {
            let options = '<option value="">Choose Teacher...</option>';
            if (response.classes && response.classes.length > 0) {
                $.each(response.classes, function (i, item) {
                    let displayName = item.teacher_name ? item.teacher_name : item.class_name;
                    options += `<option value="${item.id}">${displayName}</option>`;
                });
            }
            $("#class_combo").html(options); 
        }
    });
}

// 3. Function to load the checkbox list
function loadAllTeachers(selectedItems = []) {
    $.ajax({
        url: "/staff/get-all-classes/",
        method: "GET",
        success: function(response) {
            let listDiv = $("#classes_checkbox_list");
            let html = "";
            if (response.classes && response.classes.length > 0) {
                $.each(response.classes, function(i, item) {
                    let isChecked = selectedItems.map(String).includes(String(item.id)) ? "checked" : "";
                    let displayName = item.teacher_name ? item.teacher_name : item.class_name;
                    html += `
                        <div class="form-check col-md-12 mb-1">
                            <input class="form-check-input" type="checkbox" name="assigned_classes" value="${item.id}" id="item_${item.id}" ${isChecked}>
                            <label class="form-check-label" for="item_${item.id}">
                                ${displayName}
                            </label>
                        </div>`;
                });
                listDiv.html(html);
                $("#class_selection_section").show();
            }
        }
    });
}

$(document).ready(function () {
    // Initial data load
    loadStaffList();
    loadTeacherCombo();

    // --- 4. Function to add a new designation (Fixed with correct HTML IDs) ---
    $("#quickAddDesignationForm").on("submit", function (e) {
        e.preventDefault();
        
        let designationName = $("#new_designation_name").val(); // HTML ID: new_designation_name

        if (!designationName) {
            alert("Please enter a designation name!");
            return;
        }

        $.ajax({
            url: "/staff/add-designation/", 
            method: "POST",
            data: {
                name: designationName,
                csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (response) {
                if (response.status === "success") {
                    // Add the new designation to the dropdown menu.
                    let newOption = `<option value="${response.id}" selected>${response.name}</option>`;
                    $("#designation_combo").append(newOption); 

                    // Close the modal (HTML ID: addDesignationModal).
                    $("#addDesignationModal").modal("hide"); 
                    $("#quickAddDesignationForm")[0].reset();
                    
                    alert("✅ Designation Added Successfully!");
                } else {
                    alert("❌ Error: " + response.message);
                }
            },
            error: function () {
                alert("Server error! Please check your backend.");
            }
        });
    });

    $(document).on("change", "#class_combo", function() {
        if($(this).val() !== "") {
            loadAllTeachers();
        } else {
            $("#class_selection_section").hide();
        }
    });

    // Save/Update Staff
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
                    alert("✅ Staff Data Saved!");
                    $("#addStaffModal").modal("hide");
                    $("#addStaffForm")[0].reset();
                    $("#staff_id").val(""); 
                    loadStaffList();
                }
            }
        });
    });

    // Edit Staff
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
                $("input[name='mobile']").val(s.mobile);
                $("#designation_combo").val(s.designation_id);
                
                if($("#staff_id").length == 0) {
                    $("#addStaffForm").append(`<input type="hidden" id="staff_id" name="id" value="${s.id}">`);
                } else {
                    $("#staff_id").val(s.id);
                }

                let assigned = s.assigned_classes || [];
                loadAllTeachers(assigned);
                $("#addStaffModal").modal("show");
            }
        });
    });
});