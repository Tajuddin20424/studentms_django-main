$(document).ready(function(){
    $('#saveClassBtn').click(function(e) {
            e.preventDefault();   // stop the page from reloading

        const cls_name = $('#class_name').val();
        const subject_id = $('#subjects').val();
        const teacher_id = $('#teachers').val();
       
        console.log(cls_name);
        console.log(subject_id);
        console.log(teacher_id);

        if (!cls_name) return alert("⚠️ Please enter class name.");
        if (!subject_id) return alert("⚠️ Please select subject.");
        if (!teacher_id) return alert("⚠️ Please select teacher.");

        $.ajax({
            url: '/classes/save-classes/',
            method: 'POST',
            headers: { "X-CSRFToken": csrftoken },  // ✅ this is critical
            data: {
                'class_name': cls_name,
                'subjects': subject_id,
                'teachers': teacher_id,
            },
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message,"✅ Save successful!");
                    loadClasses();   // 🔥 Reload table
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
