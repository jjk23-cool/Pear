const form = document.getElementById('company-signup-form');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Grab and trim input values
  const name = document.getElementById('companyName').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;

  // Validate required fields
  if (name === '' || email === '' || address === '' || password === '') {
    alert("Please fill out all required fields.");
    return;
  }

  // Validate email format
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Invalid email format.");
    return;
  }

  // Validate password length
  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  // Validate phone if entered
  if (phone && !/^\d{7,15}$/.test(phone)) {
    alert("Phone number should be digits only (7–15 characters).");
    return;
  }

  const companyData = {
    name,
    email,
    address,
    phone,
    password
  };

  fetch('http://localhost:3000/company/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(companyData)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.href = 'company-login.html';
    })
    .catch(err => {
      alert('Signup failed.');
      console.error(err);
    });
});
