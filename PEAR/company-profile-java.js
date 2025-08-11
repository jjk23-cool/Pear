const company = JSON.parse(localStorage.getItem('company'));

window.addEventListener('DOMContentLoaded', () => {
    if (!company) {
        alert('Not logged in!');
        window.location.href = 'company-login.html';
        return;
    }

    // Fetch and fill profile data
    fetch(`http://localhost:3000/company/${company.id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('companyName').value = data.name;
            document.getElementById('email').value = data.email;
            document.getElementById('address').value = data.address;
        })
        .catch(err => {
            console.error('Fetch profile error:', err);
            alert('Error fetching profile data.');
        });

    // Handle profile update
    document.querySelector('.form-section.profile form').addEventListener('submit', e => {
        e.preventDefault();
        const updatedCompany = {
            name: document.getElementById('companyName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        fetch(`http://localhost:3000/company/${company.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCompany)
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        })
        .catch(err => {
            console.error('Update error:', err);
            alert('Error updating company profile');
        });
    });

    //Handle password change
    document.querySelector('.form-section.password form').addEventListener('submit', e => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert("Passwords don't match.");
            return;
        }

        fetch(`http://localhost:3000/company/${company.id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        })
        .catch(err => {
            console.error('Password update error:', err);
            alert('Error updating password.');
        });
    });

    //Logout
    document.querySelector('.logout-button').addEventListener('click', () => {
        localStorage.removeItem('company');
        window.location.href = 'home.html';
    });
});
