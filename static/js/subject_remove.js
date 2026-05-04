$(document).on('click', '.addToEventBtnRight', function(e) {
    e.preventDefault(); // stop form submission
    const tr = $(this).closest('tr');
    const reg_no = tr.data('regno');
    const event_id = $('#event').val();

    if (!reg_no) return alert("❌ No participant selected");

    if (confirm("Confirm to ADD this participant?")) {
        $.ajax({
            url: '/subjects/remove-subjects/',
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },  // ✅ critical
            data: {
                'name': sub_name,
                'description': sub_description,
                'teachers': teacher_id,
            },
            dataType: 'json',
            success: function(response) {
                console.log("Server returned:", response); // 👈 add this
                if (response.status === 'success') {
                    reloadRightTable();
                    reloadLeftTable();
                    alert(response.message || "✅ Save successful!");
                } else {
                    alert(response.message || "Error occurred");
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText); // Debug: see server error
                alert("❌ Server error: " + error);
            }
        });
    }
});