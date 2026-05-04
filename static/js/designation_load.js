$(document).on("click", ".desig-row", function() {
    $("#desig_id").val($(this).data("id"));
    $("#name").val($(this).data("name"));
    $("#created_by").val($(this).data("created_by"));
    $("#status").val($(this).data("status"));
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loadDesignation() {
   $.ajax({
        url: '/designation/list/',
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'},

        success: function(response) {
            let designations = response.designations;
            let tbody = '';

            $.each(designations, function(index, d) {
            tbody +=`
            <tr class="desig-row"
                data-id="${d.desig_id}"
                data-name="${d.desig_name}"
                data-dept_id="${d.dept_name}"
                data-status="${d.desig_status}">

                <td>${index + 1}</td>
                <td>${d.desig_id}</td>
                <td>${d.desig_name}</td>
                <td>${d.dept_name || ''}</td>
                <td>
                    <button type="button" 
                            class="btn btn-sm ${d.desig_status == 1 ? 'btn-success' : 'btn-secondary'} me-2"
                            onclick="toggleDesignationStatus(${d.desig_id}, this)">
                        ${d.desig_status == 1 ? 'Active' : 'Inactive'}
                    </button>
                    <a href="/designation/edit/${d.desig_id}/" class="btn btn-sm btn-warning me-1">Edit</a>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteDesignation(${d.desig_id})">Delete</button>
                </td>
            </tr>
        `;

        });

        $('#designationTableBody').html(tbody);

        },

        error: function() {
            alert("Failed to load designation");
        }
    });

}

function deleteDesignation(id) {
    if (confirm('Are you sure you want to delete this designation?')) {
        $.ajax({
            url: `/designation/delete/${id}/`,
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            success: function(response) {
                alert(response.message || 'Deleted successfully');
                loadDesignation(); // Refresh the list after deletion
            },
            error: function() {
                alert("Failed to delete designation");
            }
        });
    }
}

$(document).ready(function () {
    loadDesignation();
});