
function loadSubjects() {
    $.ajax({
        url: '/subjects/get-subjects/',
        method: 'GET',
        success: function(response) {
            let subjects = response.subjects;
            let tbody = '';

            $.each(subjects, function(index, s) {
                tbody += `
                    <tr class="subject-row"
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
                            <a href="/subjects/subject-edit/${s.id}/" class="btn btn-sm btn-warning">
                                Edit
                            </a>
                            <button class="btn btn-sm btn-danger deleteBtn" 
                                data-id="${s.id}"
                                data-name="${s.name}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });

            $('#subjectTableBody').html(tbody);
        },

        error: function() {
            alert('❌ Failed to load subject list.....');
        }
    });
}

$(document).ready(function () {
    loadSubjects();
});



$(document).on('click', '.deleteBtn', function(e) {
    e.preventDefault(); // stop form submission

    const sub_id = $(this).data('id');  // ✔ Works now
    const sub_name = $(this).data('name');  // ✔ Works now
    console.log("Deleting ID>>>>:", sub_id);
    console.log("Deleting Name>>>>:", sub_name);
    // const tr = $(this).closest('tr');
    // const sub_id = tr.data('id');

    // document.getElementById("sub_id").value = sub_id;
    // console.log(sub_id);

    if (confirm("Confirm to remove this subject?")) {
        $.ajax({
            url: '/subjects/remove-subjects/',
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },  // ✅ critical
            data: {
            'sub_id': sub_id,
                },
            dataType: 'json',
            success: function(response) {
                console.log("Server returned:", response); // 👈 add this
                if (response.status === 'success') {
                    alert(response.message || "✅ Remove successful!");
                    loadSubjects();
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
