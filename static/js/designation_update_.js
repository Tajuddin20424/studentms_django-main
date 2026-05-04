$(document).ready(function(){
    $('#updateDesignationBtn').click(function(e) {
            e.preventDefault();   // stop the page from reloading
        const des_id = $('#des_id').val();
        const des_name = $('#name').val();
        const des_description = $('#description').val();

        console.log(des_name);
        console.log(des_description);

        if (!des_id) return alert("⚠️ Please enter designation name.");
        if (!des_name) return alert("⚠️ Please enter designation name.");
        if (!des_description) return alert("⚠️ Please enter designation description.");
        $.ajax({
            url: '/designations/update-designations/',
            method: 'POST',
            headers: { "X-CSRFToken": csrftoken },  // ✅ this is critical

            data: {
                'des_id': des_id,
                'name': des_name,
            },
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message,"✅ Update successful!");
                    loadDesignations();   // 🔥 Reload tabl
                    //e clear form
                    $('#addForm')[0].reset(); 
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