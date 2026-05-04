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
                <td>${d.desig_status == 1 ? 'Active' : 'Inactive'}</td>
                <td>
                    <button onclick="deleteDesignation(${d.desig_id})">Delete</button>
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


$(document).ready(function () {
    loadDesignation();
});
 

function deleteDesignation(id) {
    if (confirm('Are you sure you want to delete this designation?')) {
        $.ajax({
            url: `/designation/delete/${id}/`,
            method: 'POST',
            data: {
                'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
            },
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

