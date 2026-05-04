function loadDepartments() {
  $.ajax({
    url: '/department/list/',
    type: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: function(response) {
      let departments = '';

      if (!response.departments || response.departments.length === 0) {
        departments = `
          <tr>
            <td colspan="6">No departments found</td>
          </tr>
        `;
      } else {
        response.departments.forEach((d, index) => {
          departments += `
            <tr id="row_${d.id}">
              <td>${index + 1}</td>
              <td>${d.id}</td>
              <td>${d.name}</td>
              <td>
                ${d.status == 1
                  ? '<span class="badge bg-success">Active</span>'
                  : '<span class="badge bg-danger">Inactive</span>'}

                <button
                  class="btn btn-sm btn-warning mt-1 editBtn"
                  data-id="${d.id}"
                  data-name="${d.name}"
                  data-status="${d.status}"
                >
                  Edit
                </button>

                <button
                  class="btn btn-sm btn-danger mt-1 deleteBtn"
                  data-id="${d.id}"
                >
                  Delete
                </button>
              </td>
              <td>${d.created_at}</td>
              <td>${d.created_by}</td>
            </tr>
          `;
        });
      }

      $('#departmentTable').html(departments);
    },
    error: function(xhr) {
      console.log(xhr.responseText);
      alert('Failed to load departments');
    }
  });
}

$(document).ready(function() {
  loadDepartments();
});