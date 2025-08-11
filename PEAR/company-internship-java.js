const company = JSON.parse(localStorage.getItem('company'));

window.addEventListener('DOMContentLoaded', () => {
  // Check if logged in
  if (!company) {
    alert("Not logged in!");
    window.location.href = "company-login.html";
    return;
  }

  // Form submission handler
  document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const internshipData = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      duration: parseInt(document.getElementById('duration').value),
      location: document.getElementById('location').value,
      category: document.getElementById('category').value,
      paid: document.getElementById('paid').value,
      type: document.getElementById('type').value
    };

    fetch(`http://localhost:3000/company/${company.id}/internship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(internshipData)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        document.querySelector('form').reset();
      })
      .catch(err => {
        console.error('Internship creation failed:', err);
        alert('Something went wrong while creating the internship.');
      });
  });

  // Logout
  document.querySelector('.logout-button').addEventListener('click', () => {
    localStorage.removeItem('company');
    window.location.href = 'home.html';
  });
});
