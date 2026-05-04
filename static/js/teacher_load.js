function loadTeachers() {
    $.ajax({
        url: '/subjects/get-teachers/',
        method: 'GET',
        success: function(response) {
            let teachers = response.teachers;
            let $select = $('#teachers');
            $select.empty(); // Clear existing options
            // $select.append('<option value="">-- Select Event --</option>');
            $.each(teachers, function(index, e) {
                $select.append(`<option value="${e.id}">${e.name}</option>`);
            });

            // ✅ Automatically trigger table load for first event
            if (teachers.length > 0) {
                const firstTeachertId = teachers[0].id;
                $select.val(firstTeachertId).trigger('change');
            }
        },
        error: function() {
            alert("Failed to load teachers");
        }
    });
};
    
$(document).ready(function () {
    loadTeachers();
});