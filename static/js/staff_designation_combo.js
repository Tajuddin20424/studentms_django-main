function loadDesignationCombo() {
    $.ajax({
        url: "/staff/get-designation/", // views.py url
        method: "GET",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        success: function (response) {
            let designationList = response.designation;
            let options = '<option value="">Choose Designation...</option>';
            
            $.each(designationList, function (index, d) {
                options += `<option value="${d.id}">${d.name}</option>`;
            });
            
            // Push data into the dropdown ID.
            $("#designation_combo").html(options);
        },
        error: function () {
            console.log("Error fetching designations.");
        }
    });
}

// Page load with dropdown load
$(document).ready(function () {
    loadDesignationCombo();
});