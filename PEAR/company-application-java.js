const company = JSON.parse(localStorage.getItem('company'));

window.addEventListener('DOMContentLoaded', () => {
  if (!company) {
    alert('Not logged in!');
    window.location.href = 'company-login.html';
    return;
  }

  let allApplications = [];

  // Fetch all applications for this company
  fetch(`http://localhost:3000/company/applications/${company.id}`)
    .then(res => res.json())
    .then(data => {
      allApplications = data;
      renderTable(allApplications);
    })
    .catch(err => {
      console.error('Error loading applications:', err);
      document.querySelector('.table-body').innerHTML = '<tr><td colspan="8">Failed to load data.</td></tr>';
    });

  // Function to render applications, grouped by internship title
  function renderTable(data) {
    const tableBody = document.querySelector('.table-body');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8">No applications received.</td></tr>';
      return;
    }

    const grouped = {};

    // Group by internship title
    data.forEach(app => {
      if (!grouped[app.internship_title]) {
        grouped[app.internship_title] = [];
      }
      grouped[app.internship_title].push(app);
    });

    for (const title in grouped) {
      // Internship group header row
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <td colspan="8" style="background:#f2f2f2; font-weight:bold;">📄 Applications for: ${title}</td>
      `;
      tableBody.appendChild(headerRow);

      // Application rows
      grouped[title].forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${app.internship_title}</td>
          <td>${app.student_name}</td>
          <td>${app.student_email}</td>
          <td>${app.phone}</td>
          <td>${app.created_at.split('T')[0]}</td>
          <td><a href="http://localhost:3000/uploads/${encodeURIComponent(app.cv_filename)}" download target="_blank">Download CV</a></td>
          <td class="current-status">${app.status || 'Pending'}</td>
          <td>
            <select class="status-dropdown" data-id="${app.application_id}">
              <option value="">Change</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </td>
        `;
        tableBody.appendChild(row);

        // Handle status change
        const dropdown = row.querySelector('.status-dropdown');
        dropdown.addEventListener('change', function () {
          const newStatus = this.value;
          const appId = this.dataset.id;
          const statusCell = this.closest('tr').querySelector('.current-status');

          fetch(`http://localhost:3000/application/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
          .then(res => res.json())
          .then(data => {
            alert(data.message || 'Status updated!');
            statusCell.textContent = newStatus;
          })
          .catch(err => {
            console.error('Status update error:', err);
            alert('Failed to update status.');
          });
        });
      });
    }
  }

  // Live search by student name
  const searchInput = document.getElementById('searchStudent');
  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allApplications.filter(app =>
      app.student_name.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
  });

  // Logout
  document.querySelector('.logout-button').addEventListener('click', () => {
    localStorage.removeItem('company');
    window.location.href = 'home.html';
  });
});