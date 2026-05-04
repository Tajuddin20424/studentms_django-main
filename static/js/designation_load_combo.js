function loadDesignationCombo() {
    $.ajax({
        url: '/designation/get-designation-combo/',
        method: 'GET',

        success: function(response) {
            let data = response.designation_combo;
            let $select = $('#designation');

            $select.empty();

            $.each(data, function(index, d) {
                $select.append(`<option value="${d.id}">${d.name}</option>`);
            });

            if (data.length > 0) {
                const firstId = data[0].id;
                $select.val(firstId).trigger('change');
            }
        },

        error: function() {
            alert("Failed to load designation");
        }
    });
}