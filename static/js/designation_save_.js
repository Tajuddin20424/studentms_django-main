$(document).ready(function() {
    // Initialization code for designation save functionality
    $('#saveDesignationBtn').click(function(e) {
        e.preventDefault();   // stop the page from reloading
        const desig_name = $('#desig_name').val();
        const desig_created_by = $('#desig_created_by').val();
        const desig_status = $('#desig_status').val();

        console.log(desig_name);
        console.log(desig_created_by);
        console.log(desig_status);

        if (!desig_name) return alert("⚠️ Please enter designation name.");
        if (!desig_created_by) return alert("⚠️ Please enter created by.");
        if (!desig_status) return alert("⚠️ Please select status.");

        $.ajax({
            url: '/designation_list/save-designation/',
            method: 'POST',
            headers: { "X-CSRFToken": csrftoken },  // ✅ this is critical
            data: {
                'name': desig_name,
                'created_by': desig_created_by,
                'status': desig_status,
            },
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message,"✅ Save successful!");
                    loadDesignation();
                    $('#addForm')[0].reset(); // clear form
                } 
                else if (response.status === 'exists') {
                    alert(response.message,"⚠️ Designation already EXISTS");
                } 
                else {
                    alert("❌ Error: " + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert("❌ Server error: " + error);
            }
        });
    });
});