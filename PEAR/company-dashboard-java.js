const company = JSON.parse(localStorage.getItem('company'));
window.addEventListener('DOMContentLoaded', () => {
if (!company) {
    alert('Not logged in!');
    window.location.href = 'company-login.html';
    return;
}

fetch(`http://localhost:3000/internships/${company.id}`)
    .then(res => res.json())
    .then(data => {
    const tbody = document.getElementById('internship-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No internships yet.</td></tr>';
        return;
    }

    data.forEach(internship => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${internship.title}</td>
            <td>${internship.description || '-'}</td>
            <td>${internship.duration}</td>
            <td>${internship.location}</td>
            <td>${internship.category}</td>
            <td>${internship.paid}</td>
            <td>${internship.type}</td>
            <td>
                <button onclick="editInternship(
                    ${internship.id},
                    \`${internship.title}\`,
                    \`${internship.description}\`,
                    \`${internship.duration}\`,
                    \`${internship.location}\`,
                    \`${internship.category}\`,
                    \`${internship.paid}\`,
                    \`${internship.type}\`
                )">Edit</button>
                <button onclick="deleteInternship(${internship.id})">Delete</button>
            </td>
            `;

        tbody.appendChild(row);
    });
    })
    .catch(error => {
    console.error('Error loading internships:', error);
    document.getElementById('internship-tbody').innerHTML = '<tr><td colspan="5">Failed to load data.</td></tr>';
    });
});

function editInternship(id, oldTitle, oldDesc, oldDuration, oldLoc, oldCategory, oldPaid, oldType) {
  const title = prompt("Edit title:", oldTitle);
  const description = prompt("Edit description:", oldDesc);
  const duration = prompt("Edit duration (in months):", oldDuration);
  const location = prompt("Edit location:", oldLoc);
  const category = prompt("Edit category:", oldCategory);
  const paid = prompt("Edit paid status (paid/unpaid):", oldPaid);
  const type = prompt("Edit type (fulltime/parttime):", oldType);

  if (!title || !description || !duration || !location || !category || !paid || !type) {
    alert("All fields are required.");
    return;
  }

  fetch(`http://localhost:3000/company/internships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      duration,
      location,
      category,
      paid,
      type
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      location.reload(); // refresh to see updates
    })
    .catch(err => {
      console.error("Update error:", err);
    });
}


function deleteInternship(id) {
if (!confirm("Are you sure you want to delete this internship?")) return;

fetch(`http://localhost:3000/company/internships/${id}`, {
    method: 'DELETE'
})
.then(res => res.json())
.then(data => {
    alert(data.message);
    location.reload(); // refresh to see updated list
})
.catch(err => {
    console.error("Delete error:", err);
    alert("Failed to delete internship.");
});
}
//logout
document.querySelector('.logout-button').addEventListener('click', () => {
localStorage.removeItem('company'); 
window.location.href = 'home.html'; 
});