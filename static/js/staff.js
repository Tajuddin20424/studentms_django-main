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

$(document).ready(function () {
  // 1.Show the list when the page loads.
  loadStaffList();

  // 2.Form submission for adding and updating staff.
  $("#addStaffForm").on("submit", function (e) {
    e.preventDefault();

    // If the form contains a staff_id, use the update URL; otherwise, use the add URL.
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
          $("#staff_id").val(""); // Clear the ID.
          $("#addStaffModal h4").text("Add New Staff"); // Reset the title.
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

  // 3. Logic for editing staff (fetching data and populating the form).
  $(document).on("click", ".editStaffBtn", function () {
    let id = $(this).data("id");

    $.ajax({
      url: "/staff/get-single/",
      method: "GET",
      data: { id: id },
      success: function (response) {
        let s = response.staff;
        
        // Set values into the form fields
        $("#addStaffModal h4").text("Edit Staff Member"); // Change the modal title.
        $("input[name='name']").val(s.name);
        $("input[name='dob']").val(s.dob);
        $("input[name='mobile']").val(s.mobile);
        $("input[name='email']").val(s.email);
        $("#designation_combo").val(s.designation_id);
        
        // Store the ID in a hidden field so that it is identified as an update during form submission.
        if($("#staff_id").length == 0) {
            $("#addStaffForm").append(`<input type="hidden" id="staff_id" name="id" value="${s.id}">`);
        } else {
            $("#staff_id").val(s.id);
        }

        $("#addStaffModal").modal("show");
      }
    });
  });

  // ৪. Staff deleted logic
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

  // ৫. New Designation save logic
  $(document).on("submit", "#quickAddDesignationForm", function (e) {
    e.preventDefault();
    let name = $("#new_designation_name").val();
    let csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $.ajax({
      url: "/staff/add-designation/", // views.py According to the name.
      method: "POST",
      data: {
        name: name,
        status: 1,
        csrfmiddlewaretoken: csrfToken,
      },
      success: function (response) {
        alert("✅ New Designation Added!");
        $("#addDesignationModal").modal("hide");
        $("#new_designation_name").val("");
        if (typeof loadDesignationCombo === "function") {
          loadDesignationCombo();
        }
      },
      error: function () {
        alert("❌ Error saving designation");
      },
    });
  });
});