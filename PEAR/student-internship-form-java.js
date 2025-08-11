const urlParams = new URLSearchParams(window.location.search);
const internshipId = urlParams.get('id');
const student = JSON.parse(localStorage.getItem('student'));
document.getElementById('email').value = student.email;


if (!student) {
  alert("You're not logged in!");
  window.location.href = 'student-login.html';
}

const form = document.querySelector('.form');
const fileInput = document.getElementById('fileInput');

// LIVE FILE PREVIEW
const fileNameDisplay = document.createElement('p');
fileNameDisplay.style.marginTop = '10px';
fileNameDisplay.style.fontWeight = 'bold';
fileNameDisplay.style.color = '#333';
fileInput.parentNode.appendChild(fileNameDisplay);

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Selected file: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = '';
  }
});

// FORM SUBMISSION
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('fullname', document.getElementById('fullname').value);
  formData.append('email', student.email);
  formData.append('phone', document.getElementById('phone').value);
  formData.append('coverLetter', document.getElementById('coverLetter').value);

  if (fileInput.files.length > 0) {
    formData.append('cv', fileInput.files[0]);
  }

  fetch(`http://localhost:3000/apply/${internshipId}`, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert('Application submitted successfully!');
    form.reset();
  })
  .catch(err => {
    console.error('Application submission error:', err);
    alert('Something went wrong while submitting your application.');
  });
});
