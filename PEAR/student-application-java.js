const student = JSON.parse(localStorage.getItem('student'));
window.addEventListener('DOMContentLoaded', () => {
  if (!student) {
    alert("Not logged in!");
    window.location.href = "student-login.html";
    return;
  }

  fetch(`http://localhost:3000/applications/student-email/${encodeURIComponent(student.email)}`)
    .then(res => res.json())
    .then(data => {
      const tableBody = document.querySelector('.table-body');
      tableBody.innerHTML = '';

      if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No applications yet.</td></tr>';
        return;
      }

      data.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
  <td>${app.internship_title}</td>
  <td>${app.company_name}</td>
  <td>${app.status || 'Pending'}</td>
  <td>${app.date_applied?.split('T')[0] || '-'}</td>
`;
        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error('Error loading applications:', err);
      document.querySelector('.table-body').innerHTML = '<tr><td colspan="5">Failed to load data.</td></tr>';
    });
});

//Logout
document.querySelector('.logout-button').addEventListener('click', () => {
  localStorage.removeItem('company');
  window.location.href = 'home.html';
});