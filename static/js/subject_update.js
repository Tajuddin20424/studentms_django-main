$(document).ready(function(){
    $('#updateSubjectBtn').click(function(e) {
            e.preventDefault();   // stop the page from reloading

        const sub_id = $('#sub_id').val();
        const sub_name = $('#name').val();
        const sub_description = $('#description').val();
        const teacher_id = $('#teachers').val();
       
        console.log(sub_name);
        console.log(sub_description);
        console.log(teacher_id);

        if (!sub_id) return alert("⚠️ Please enter subject name.");
        if (!sub_name) return alert("⚠️ Please enter subject name.");
        if (!sub_description) return alert("⚠️ Please enter subject description.");
        if (!teacher_id) return alert("⚠️ Please select teacher.");

        $.ajax({
            url: '/subjects/update-subjects/',
            method: 'POST',
            headers: { "X-CSRFToken": csrftoken },  // ✅ this is critical
            data: {
                'sub_id': sub_id,
                'name': sub_name,
                'description': sub_description,
                'teachers': teacher_id,
            },
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message,"✅ Update successful!");
                    loadSubjects();   // 🔥 Reload table
                    $('#addForm')[0].reset(); // clear form
                } 
                else if (response.status === 'exists') {
                    alert(response.message,"⚠️ Schedule already EXISTS");
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
