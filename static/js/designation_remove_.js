$(document).on('click', '.deleteDesignationBtn', function(e) {
    e.preventDefault();

    const tr = $(this).closest('tr');
    const desig_id = tr.data('id');
    const desig_name = tr.data('name');

    console.log("Deleting ID>>>>:", desig_id);
    console.log("Deleting Name>>>>:", desig_name);  

    if (!desig_id) {
        return alert("❌ No designation selected");
    }

    if (confirm("Confirm to REMOVE this designation?")) {
        $.ajax({
            url: '/designation/delete/',   
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },

            data: {
                'desig_id': desig_id  
            },

            dataType: 'json',

            success: function(response) {
                console.log("Server returned:", response);

                if (response.status === 'success') {
                    alert(response.message || "✅ Deleted successfully!");
                    loadDesignation();   // 🔄 reload table
                } else {
                    alert(response.message || "Error occurred");
                }
            },

            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                alert("❌ Server error: " + error);
            }
        });
    }
});