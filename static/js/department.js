function loadDepartments2() {
    $.ajax({
        url: '/department/get_list/',
        method: 'GET',
        success: function(response) {
            let departments = response.departments;
            let tbody = '';

            $.each(departments, function(index, d) {
                let statusText = d.status == 1 ? 'Active' : 'Inactive';

                tbody += `
                    <tr class="department-row"
                        data-id="${d.id}"
                        data-name="${d.name}"
                        data-status="${d.status}"
                        data-created_at="${d.created_at}"
                        data-created_by="${d.created_by}">

                        <td>${index + 1}</td>
                        <td>${d.id}</td>
                        <td>${d.name}</td>
                        <td>${statusText}</td>
                        <td>${d.created_at}</td>
                        <td>${d.created_by}</td>

                        <td>
                            <button 
                                class="btn btn-sm btn-warning editBtn"
                                data-id="${d.id}"
                                data-name="${d.name}"
                                data-status="${d.status}">
                                Edit
                            </button>

                            <button 
                                class="btn btn-sm btn-danger deleteBtn" 
                                data-id="${d.id}"
                                data-name="${d.name}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });

            $('#departmentTable').html(tbody);
        },
        error: function() {
            alert('❌ Failed to load department list');
        }
    });
}

$(document).ready(function () {
    loadDepartments2();
});


// GET CSRF TOKEN
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');


// OPEN EDIT MODAL
$(document).on('click', '.editBtn', function () {
    const id = $(this).data('id');
    const name = $(this).data('name');
    const status = $(this).data('status');

    $('#edit_id').val(id);
    $('#edit_name').val(name);
    $('#edit_status').val(status);

    $('.edit_name_error').text('');
    $('.edit_status_error').text('');

    $('#editModal').modal('show');
});


// SUBMIT EDIT FORM
$('#editForm').on('submit', function(e) {
    e.preventDefault();

    const id = $('#edit_id').val();
    const name = $('#edit_name').val();
    const status = $('#edit_status').val();

    $('.edit_name_error').text('');
    $('.edit_status_error').text('');

    $.ajax({
        url: `/department/edit/${id}/`,
        type: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        data: {
            name: name,
            status: status
        },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                $('#editModal').modal('hide');
                loadDepartments2();
                alert(response.message || '✅ Department updated successfully!');
            } else if (response.status === 'error_fields') {
                if (response.errors.name) {
                    $('.edit_name_error').text(response.errors.name);
                }
                if (response.errors.status) {
                    $('.edit_status_error').text(response.errors.status);
                }
            } else {
                alert(response.message || 'Something went wrong');
            }
        },
        error: function(xhr) {
            console.log(xhr.responseText);
            alert('❌ Failed to update department');
        }
    });
});


// DELETE DEPARTMENT
$(document).on('click', '.deleteBtn', function(e) {
    e.preventDefault();

    const dept_id = $(this).data('id');
    const dept_name = $(this).data('name');

    if (confirm(`Confirm to remove department "${dept_name}"?`)) {
        $.ajax({
            url: `/department/delete/${dept_id}/`,
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message || '✅ Delete successful!');
                    loadDepartments2();
                } else {
                    alert(response.message || 'Error occurred');
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                alert("❌ Server error: " + error);
            }
        });
    }
});