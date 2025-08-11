const student = JSON.parse(localStorage.getItem('student'));
console.log("Student from localStorage:", student);
window.addEventListener('DOMContentLoaded', () => {
  if (!student) {
    alert('Not logged in!');
    window.location.href = 'student-login.html';
    return;
  }

  fetch(`http://localhost:3000/student/${student.id}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('name').value = data.name;
      document.getElementById('email').value = data.email;
      document.getElementById('phone').value = data.phone;
      document.getElementById('major').value = data.major;
      document.getElementById('university').value = data.university;
      document.getElementById('dob').value = data.dob?.split('T')[0];

    })
    .catch(error => {
      console.error('Fetch profile error:', error);
      alert('Error fetching profile data.');
    });
});

const form = document.getElementById('profileForm');
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const updatedProfile = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    major: document.getElementById('major').value,
    university: document.getElementById('university').value,
    dob: document.getElementById('dob').value
  };

  fetch(`http://localhost:3000/student/${student.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProfile)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    console.error('Update profile error:', error);
    alert('Something went wrong while updating your profile.');
  });
});

// Handle password change
document.getElementById('passwordForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert("New passwords don't match.");
    return;
  }

  fetch(`http://localhost:3000/student/${student.id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    console.error('Password update error:', error);
    alert('Something went wrong while updating your password.');
  });
});

document.querySelector('.logout-button').addEventListener('click', () => {
  localStorage.removeItem('company'); // 💣 Clear the logged-in company data
  window.location.href = 'home.html'; // 🌍 Redirect to PEAR home page
});