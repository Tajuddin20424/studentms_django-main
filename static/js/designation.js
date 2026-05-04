function getcsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }  
        }
    }
    return cookieValue;
}

function showToast(message, type='success') {
    const toastEl = $('#toast');
    toastEl.removeClass('text-bg-success text-bg-danger');
    toastEl.addClass(type === 'success' ? 'text-bg-success' : 'text-bg-danger');
    toastEl.find('.toast-body').text(message);
    new bootstrap.Toast(toastEl[0]).show();
}

function clearErrors(form) {
    form.find('.text-danger').text('');
}

function displayErrors(form, errors) {
    for (const field in errors) {
        form.find(`.${field}_error`).text(errors[field]);
    }   

}

function setupRealtimeValidation(form) {
    form.find('input, textarea, select').on('input change', function() {
        $(this).siblings('.text-danger').text('');
    });
}

function loadDepartments(selectId, selectedId = null) {
    $.ajax({
        url: '/designations/get-departments/',
        type: 'GET',
        success: function(response) {
            let select = $(selectId);
            select.empty();
            select.append('<option value="">-- Select Department --</option>');
            response.departments.forEach(function(d) {
                let selected = (selectedId && d.id == selectedId) ? 'selected' : '';
                select.append(`<option value="${d.id}" ${selected}>${d.name}</option>`);
            });
        },
        error: function() {
            alert('Failed to load departments');
        }
    });
}

$(document).ready(function() {
    loadDepartments('#department');
});

$('#addForm').submit(function(e) {
    e.preventDefault();
    const form = $(this);
    clearErrors(form);
    $.ajax({
        url: '/designations/add/',
        method: 'POST',
        data: form.serialize(),
        headers: {'X-CSRFToken': getcsrfToken()}
        ,
        success: function(res) {
            if (res.status === 'success') {
                showToast(res.message, 'success');
                $('#addModal').modal('hide');
                setTimeout(() => location.reload(), 500);
            } else if (res.status === 'error_fields') {
                displayErrors(form, res.errors);
            } else {
                showToast(res.message || 'Something went wrong!', 'danger');
            }
        },
        error: function() {
            showToast('Server error!', 'danger');
        }
    });
});

setupRealtimeValidation($('#addForm'));

$('#designationTable').on('click', '.editBtn', function() {
    const btn = $(this);
    $('#edit_id').val(btn.data('id'));
    $('#edit_name').val(btn.data('name'));


    loadDepartments('#edit_department', btn.data('department-id'));

});

$('#editForm').submit(function(e) {
    e.preventDefault();
    const form = $(this);
    clearErrors(form);
    $.ajax({
        url: '/designations/edit/',
        method: 'POST',
        data: form.serialize(),
        headers: {'X-CSRFToken': getcsrfToken()}
        ,
        success: function(res) {
            if (res.status === 'success') {
                showToast(res.message, 'success');
                $('#editModal').modal('hide');
                setTimeout(() => location.reload(), 500);
            } else if (res.status === 'error_fields') {
                displayErrors(form, res.errors);
            } else {
                showToast(res.message || 'Something went wrong!', 'danger');
            }
        },
        error: function() {
            showToast('Server error!', 'danger');
        }
    });
});

setupRealtimeValidation($('#editForm'));

$('#designationTable').on('click', '.deleteBtn', function() {
    const btn = $(this);
    $('#edit_id').val(btn.data('id'));
    $('#edit_name').val(btn.data('name'));

    clearErrors($('#editForm'));
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
});


$('#editForm').submit(function(e) {
    e.preventDefault();
    const form = $(this);
    clearErrors(form);
    const id = $('#edit_id').val();

    $.ajax({
        url: '/designations/delete/',
        method: 'POST',
        data: { id },
        headers: {'X-CSRFToken': getcsrfToken()}
        ,
        success: function(res) {
            if (res.status === 'success') {
                showToast(res.message, 'success');
                setTimeout(() => location.reload(), 500);
            } else {
                showToast(res.message || 'Something went wrong!', 'danger');
            }
        },
        error: function() {
            showToast('Server error!', 'danger');
        }
    });
});