document.addEventListener('DOMContentLoaded', () => {
  const internshipContainer = document.getElementById('internshipCardsContainer');
  const checkboxes = document.querySelectorAll('.sidebar-filter input[type="checkbox"]');
  const searchInput = document.querySelector('.search-input');
  const clearBtn = document.querySelector('.clear-filters-btn');
  let internships = [];

  function renderInternships(data) {
    internshipContainer.innerHTML = '';

    if (data.length === 0) {
      internshipContainer.innerHTML = '<p>No internships found.</p>';
      return;
    }

    data.forEach(int => {
      const card = document.createElement('div');
      card.className = 'internship-card';
      card.dataset.category = int.category || '';
      card.dataset.location = int.location || '';
      card.dataset.paid = int.paid || '';
      card.dataset.type = int.type || '';
      card.innerHTML = `
        <h2>${int.title}</h2>
        <p>${int.description || 'No description provided.'}</p>
        <a href="student-internship-form.html?id=${int.id}" class="btn-card">Apply Now →</a>
      `;
      internshipContainer.appendChild(card);
    });
  }

  function applyFilters() {
    const filters = {
      category: getCheckedValues('category'),
      location: getCheckedValues('location'),
      paid: getCheckedValues('paid'),
      type: getCheckedValues('type')
    };

    const searchQuery = searchInput.value.trim().toLowerCase();

    const filtered = internships.filter(int => {
      const matches = (field, value) =>
        filters[field].length === 0 || filters[field].includes(value?.toLowerCase());
      const matchesSearch =
        int.title.includes(searchQuery) || int.description.includes(searchQuery);

      return (
        matches('category', int.category) &&
        matches('location', int.location) &&
        matches('paid', int.paid) &&
        matches('type', int.type) &&
        matchesSearch
      );
    });

    renderInternships(filtered);
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
  }

  checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));
  searchInput.addEventListener('input', applyFilters);
  clearBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = false);
    searchInput.value = '';
    applyFilters();
  });

  fetch('http://localhost:3000/internships')
    .then(res => res.json())
    .then(data => {
      internships = data.map(int => ({
        ...int,
        category: int.category?.toLowerCase(),
        type: int.type?.toLowerCase(),
        paid: int.paid?.toLowerCase(),
        location: int.location?.toLowerCase(),
        title: int.title?.toLowerCase(),
        description: int.description?.toLowerCase()
      }));

      applyFilters();
    })
    .catch(err => {
      internshipContainer.innerHTML = '<p>Error loading internships.</p>';
      console.error(err);
    });
});

// Logout Handler
document.querySelector('.logout-button').addEventListener('click', () => {
  localStorage.removeItem('company');
  window.location.href = 'home.html';
});