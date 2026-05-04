
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function showToast(msg, type = "success") {
    const toastEl = $('#toast');
    toastEl.removeClass('text-bg-success text-bg-danger');
    toastEl.addClass(type === 'success' ? 'text-bg-success' : 'text-bg-danger');
    toastEl.find('.toast-body').text(msg);
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

$('#addForm').submit(function(e) {
    e.preventDefault();
    const form = $(this);
    clearErrors(form);

    $.ajax({
        url: '/students/add/',
        method: 'POST',
        data: form.serialize(),
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


$('#studentTable').on('click', '.editBtn', function() {
    const btn = $(this);
    $('#edit_id').val(btn.data('id'));
    $('#edit_name').val(btn.data('name'));
    $('#edit_email').val(btn.data('email'));
    $('#edit_phone').val(btn.data('phone'));
    $('#edit_address').val(btn.data('address'));
    $('#edit_status').val(btn.data('status'));

    clearErrors($('#editForm'));
    new bootstrap.Modal(document.getElementById('editModal')).show();
});

$('#editForm').submit(function(e) {
    e.preventDefault();
    const form = $(this);
    clearErrors(form);
    const id = $('#edit_id').val();

    $.ajax({
        url: `/students/update/${id}/`,
        method: 'POST',
        data: form.serialize(),
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

$('#studentTable').on('click', '.deleteBtn', function() {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const id = $(this).data('id');

    $.ajax({
        url: `/students/delete/${id}/`,
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken() },
        success: function(res) {
            if (res.status === 'success') {
                showToast(res.message, 'success');
                $(`#row${id}`).remove();
            } else {
                showToast(res.message || 'Something went wrong!', 'danger');
            }
        },
        error: function() {
            showToast('Server error!', 'danger');
        }
    });
});
