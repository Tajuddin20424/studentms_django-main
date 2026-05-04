function loadSubjectsCombo() {
    $.ajax({
        url: '/classes/get-subjects-combo/',
        method: 'GET',
        success: function(response) {
            let subjects_combo = response.subjects_combo;
            let $select = $('#subjects');
            $select.empty(); // Clear existing options
            // $select.append('<option value="">-- Select Event --</option>');
            $.each(subjects_combo, function(index, e) {
                $select.append(`<option value="${e.id}">${e.name}</option>`);
            });

            // ✅ Automatically trigger table load for first event
            if (subjects_combo.length > 0) {
                const firstSubjecttId = subjects_combo[0].id;
                $select.val(firstSubjecttId).trigger('change');
            }
        },
        error: function() {
            alert("Failed to load subject");
        }
    });
};
    
$(document).ready(function () {
    loadSubjectsCombo();
});