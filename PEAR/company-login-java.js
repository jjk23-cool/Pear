const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value;

  // Validate fields
  if (email === '' || password === '') {
    alert("Email and password are required.");
    return;
  }

  fetch('http://localhost:3000/company-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    })
    .then(data => {
      alert(data.message);
      localStorage.setItem('company', JSON.stringify(data.company));
      window.location.href = 'company-dashboard.html';
    })
    .catch(err => {
      alert('Login failed: ' + err.message);
    });
});
