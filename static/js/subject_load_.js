
function loadSubjects() {
    $.ajax({
    url: '/subjects/get-subjects/',
    method: 'GET',
    success: function(response) {
        let subjects = response.subjects;
        let tbody = '';
        $.each(subjects, function(index, s) {
        tbody += `
            <tr
                class="subject-row"
                data-id="${s.id}"
                data-name="${s.name}"
                data-description="${s.description}"
                data-teacher_id="${s.teacher_id}"
                data-teacher="${s.teacher}">

                <td>${index + 1}</td>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.description}</td>
                <td>${s.teacher}</td>
                <td>
                    <button class="btn btn-sm btn-warning editBtn"
                        data-id="${s.id}"
                        data-name="${s.name}"
                        data-description="${s.description}"
                        data-teacher_id="${s.teacher_id}"
                        data-teacher="${s.teacher}">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-danger deleteBtn" data-id="${s.id}">
                        Delete
                    </button>
                </td>
            </tr>`;
        });
        $('#subjectTableBody').html(tbody);
    },
    error: function() {
        alert('❌ Failed to load subject list.....');
    }
    });
};

$(document).ready(function () {
    loadSubjects();
});

// Row click event
$(document).on("click", ".subject-row", function() {
    $("#sub_id").val($(this).data("id"));
    $("#name").val($(this).data("name"));
    $("#description").val($(this).data("description"));
    $("#teachers").val($(this).data("teacher_id"));
});