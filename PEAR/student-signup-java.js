const form = document.querySelector('form');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Grab and trim input values
  const firstName = document.getElementById('name').value.trim();
  const lastName = document.getElementById('lastname').value.trim();
  const email = document.getElementById('email').value.trim();
  const dob = document.getElementById('dob').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const phone = document.getElementById('phone').value.trim();
  const major = document.getElementById('major').value.trim();
  const university = document.getElementById('university').value.trim();

  if (firstName === '' || lastName === '' || email === '' || password === '') {
    alert("Please fill out all required fields.");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Invalid email format.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (phone && !/^\d{7,15}$/.test(phone)) {
    alert("Phone number should contain only digits and be 7–15 characters long.");
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  const userData = {
    name: fullName,
    email,
    dob,
    password,
    role,
    phone,
    major,
    university
  };

  fetch('http://localhost:3000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        localStorage.setItem('student', JSON.stringify(data.student));
        window.location.href = 'student-login.html';
      } else {
        alert("Signup failed: " + data.message);
      }
    })
    .catch(error => {
      alert('An error occurred. Try again later.');
      console.error(error);
    });
});
