// ১. স্টাফ লিস্ট লোড করার ফাংশন
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
            console.log("Error loading staff list.");
        },
    });
}

// ২. ড্রপডাউনে ক্লাসের ডেটা লোড করার ফাংশন
function loadClassCombo() {
    $.ajax({
        url: "/get-all-classes/",
        method: "GET",
        success: function (response) {
            let options = '<option value="">Choose Class...</option>';
            if (response.classes) {
                $.each(response.classes, function (i, cls) {
                    options += `<option value="${cls.id}">${cls.class_name}</option>`;
                });
            }
            $("#class_combo").html(options); 
            console.log("Class dropdown loaded.");
        },
        error: function() {
            console.log("Error loading class dropdown.");
        }
    });
}

// ৩. চেকবক্স লিস্টে সব ক্লাস লোড করার ফাংশন (স্টাফ মোডালের জন্য)
function loadAllClasses(selectedClasses = []) {
    $.ajax({
        url: "/get-all-classes/",
        method: "GET",
        success: function(response) {
            let classesListDiv = $("#classes_checkbox_list");
            let html = "";
            
            if (response.classes && response.classes.length > 0) {
                $.each(response.classes, function(i, cls) {
                    // এডিট মোড হলে আগের সেভ করা ক্লাসগুলো টিক (checked) থাকবে
                    let isChecked = selectedClasses.map(String).includes(String(cls.id)) ? "checked" : "";
                    
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="assigned_classes" value="${cls.id}" id="class_${cls.id}" ${isChecked}>
                            <label class="form-check-label" for="class_${cls.id}">
                                ${cls.class_name}
                            </label>
                        </div>`;
                });
                classesListDiv.html(html);
                $("#class_selection_section").show();
            } else {
                classesListDiv.html("<p class='text-muted'>No classes found.</p>");
            }
        },
        error: function() {
            console.log("Error loading classes checkboxes.");
        }
    });
}

$(document).ready(function () {
    // পেজ লোড হওয়ার সময় প্রয়োজনীয় ডাটা নিয়ে আসা
    loadStaffList();
    loadClassCombo();

    // --- Select Class ড্রপডাউন পরিবর্তন হলে চেকবক্স লিস্ট আপডেট হবে ---
    $(document).on("change", "#class_combo", function() {
        if($(this).val() !== "") {
            loadAllClasses();
        }
    });

    // --- নতুন ক্লাস সেভ করার লজিক (Quick Add Class Modal) ---
    $(document).on("submit", "#quickAddClassForm", function (e) {
        e.preventDefault();
        let className = $("#new_class_name").val();
        let csrfToken = $("input[name=csrfmiddlewaretoken]").val();

        if (!className) {
            alert("Please enter a class name");
            return;
        }

        $.ajax({
            url: "/staff/add-class/", 
            method: "POST",
            data: {
                class_name: className,
                csrfmiddlewaretoken: csrfToken,
            },
            success: function (response) {
                alert("✅ New Class Added!");
                $("#addClassModal").modal("hide");
                $("#quickAddClassForm")[0].reset();
                loadClassCombo(); // মেইন ড্রপডাউন রিফ্রেশ
                loadAllClasses(); // চেকবক্স লিস্ট রিফ্রেশ
            },
            error: function (xhr) {
                alert("❌ Error saving class: " + xhr.statusText);
            }
        });
    });

    // ৪. স্টাফ অ্যাড এবং আপডেট করার লজিক
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
                    $("#addStaffModal h4").text("Add New Staff"); 
                    loadStaffList();
                } else {
                    alert("❌ " + response.message);
                }
            },
            error: function () {
                alert("❌ Error saving staff member.");
            },
        });
    });

    // ৫. স্টাফ এডিট করার লজিক
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
                
                // স্টাফ আইডি সেট করা (আপডেটের জন্য)
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

    // ৬. স্টাফ ডিলিট করার লজিক
    $(document).on("click", ".deleteStaffBtn", function () {
        let id = $(this).data("id");
        let csrfToken = $("input[name=csrfmiddlewaretoken]").val();

        if (confirm("Are you sure you want to delete this staff member?")) {
            $.ajax({
                url: "/staff/delete-data/",
                method: "POST",
                data: {
                    id: id,
                    csrfmiddlewaretoken: csrfToken,
                },
                success: function (response) {
                    alert("🗑️ " + response.message);
                    loadStaffList();
                },
                error: function () {
                    alert("❌ Error deleting staff member");
                },
            });
        }
    });

    // ৭. নতুন পদবী (Designation) সেভ করার লজিক
    $(document).on("submit", "#quickAddDesignationForm", function (e) {
        e.preventDefault();
        let name = $("#new_designation_name").val();
        let csrfToken = $("input[name=csrfmiddlewaretoken]").val();

        $.ajax({
            url: "/staff/add-designation/", 
            method: "POST",
            data: {
                name: name,
                status: 1,
                csrfmiddlewaretoken: csrfToken,
            },
            success: function (response) {
                alert("✅ New Designation Added!");
                $("#addDesignationModal").modal("hide");
                $("#quickAddDesignationForm")[0].reset();
                // যদি loadDesignationCombo অন্য কোথাও ডিফাইন করা থাকে
                if (typeof loadDesignationCombo === "function") {
                    loadDesignationCombo();
                } else {
                    // অল্টারনেটিভ: সরাসরি রিলোড বা ফিল্ড আপডেট
                    console.log("Designation combo refreshed.");
                }
            },
            error: function () {
                alert("❌ Error saving designation");
            },
        });
    });
});