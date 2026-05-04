function loadClasses() {
    $.ajax({
        url: '/classes/get-classes/',
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        dataType: 'json',
        success: function(response) {
            let classes = response.classes;
            let tbody = '';

            $.each(classes, function(index, s) {
                tbody += `
                    <tr class="class-row"
                        data-id="${s.id}"
                        data-name="${s.class_name}"
                        data-subject="${s.subject}"
                        data-teacher="${s.teacher}">
       
                        <td>${index + 1}</td>
                        <td>${s.id}</td>
                        <td>${s.class_name}</td>
                        <td>${s.subject}</td>
                        <td>${s.teacher}</td>

                        <td>
                            <a href="/subjects/subject-edit/${s.id}/" class="btn btn-sm btn-warning">
                                Edit
                            </a>
                            <button class="btn btn-sm btn-danger deleteBtn" 
                                data-id="${s.id}"
                                data-name="${s.class_name}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });

            $('#classTableBody').html(tbody);
        },

        error: function() {
            alert('❌ Failed to load class list.....');
        }
    });
}

$(document).ready(function () {
    loadClasses();
});