const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Simple Validation
  if (email === '' || password === '') {
    alert("Email and password are required.");
    return;
  }
  
  const loginData = { email, password };

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  })
    .then(res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    })
    .then(data => {
      alert(data.message);
      if (data.student) {
        localStorage.setItem('student', JSON.stringify(data.student));
        window.location.href = 'student-dashboard.html';
      }
    })
    .catch(error => {
      alert('Login failed: ' + error.message);
    });
});
