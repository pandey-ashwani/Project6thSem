// Patient History Page - Modern Interactive Features
document.addEventListener('DOMContentLoaded', function() {
  const patientData = window.patientData || [];
  const totalPatients = patientData.length;

  // Elements
  const searchInput = document.getElementById('patientSearch');
  const diseaseFilter = document.getElementById('diseaseFilter');
  const hospitalFilter = document.getElementById('hospitalFilter');
  const toggleViewBtn = document.getElementById('toggleView');
  const cardsView = document.getElementById('cardsView');
  const tableView = document.getElementById('tableView');
  const patientCards = document.getElementById('patientCards');
  const patientTableBody = document.getElementById('patientTableBody');
  const paginationContainer = document.getElementById('paginationContainer');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyState = document.getElementById('emptyState');
  const clearFiltersBtn = document.getElementById('clearFilters');

  let currentPage = 1;
  const itemsPerPage = 9;
  let currentView = 'cards';
  let sortColumn = 'name';
  let sortDirection = 'asc';
  let filteredData = [...patientData];

  // Initialize filters
  function initFilters() {
    const diseases = [...new Set(patientData.map(p => p.disease || 'N/A').filter(Boolean))].sort();
    const hospitals = [...new Set(patientData.map(p => p.hospital || 'N/A').filter(Boolean))].sort();

    diseaseFilter.innerHTML = '<option value="">All Diseases</option>' + diseases.map(d => `<option value="${d}">${d}</option>`).join('');
    hospitalFilter.innerHTML = '<option value="">All Hospitals</option>' + hospitals.map(h => `<option value="${h}">${h}</option>`).join('');
  }

  // Render cards
  function renderCards(data) {
    patientCards.innerHTML = data.map(patient => `
      <div class="col-md-6 col-lg-4 col-xl-3" data-patient-id="${patient._id}">
        <div class="modern-card h-100">
          <div class="modern-card-header">
            <div class="modern-avatar patient-avatar">
              <i class="fa-solid fa-user-injured"></i>
            </div>
            <div class="modern-meta">
              <h5>${escapeHtml(patient.name)}</h5>
              <span class="modern-tag">Age: ${patient.age}</span>
            </div>
          </div>
          <div class="modern-card-body">
            <div class="modern-detail">
              <i class="fa-solid fa-virus"></i>
              <span>${patient.disease || 'N/A'}</span>
            </div>
            <div class="modern-detail">
              <i class="fa-solid fa-hospital"></i>
              <span>${patient.hospital || 'N/A'}</span>
            </div>
            <div class="modern-detail">
              <i class="fa-solid fa-location-dot"></i>
              <span>${patient.district || 'N/A'}</span>
            </div>
          </div>
          <div class="modern-card-footer">
            <a href="/patient-profile/${patient._id}/view" class="btn-view">
              <i class="fa-solid fa-eye me-1"></i>View Profile
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render table
  function renderTable(data) {
    patientTableBody.innerHTML = data.map(patient => `
      <tr data-patient-id="${patient._id}">
        <td>${escapeHtml(patient.name)}</td>
        <td>${patient.age}</td>
        <td>${patient.disease || 'N/A'}</td>
        <td>${patient.hospital || 'N/A'}</td>
        <td>${patient.district || 'N/A'}</td>
        <td>
          <a href="/patient-profile/${patient._id}/view" class="btn btn-sm btn-primary">
            <i class="fa-solid fa-eye"></i>
          </a>
        </td>
      </tr>
    `).join('');
  }

  // Sort data
  function sortData(data, column, direction) {
    return [...data].sort((a, b) => {
      let aVal = (a[column] || '').toString().toLowerCase();
      let bVal = (b[column] || '').toString().toLowerCase();
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Filter data
  function filterData(data) {
    const searchTerm = (searchInput.value || '').toLowerCase();
    const selectedDisease = diseaseFilter.value;
    const selectedHospital = hospitalFilter.value;

    return data.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchTerm) ||
        (patient.disease || '').toLowerCase().includes(searchTerm) ||
        (patient.hospital || '').toLowerCase().includes(searchTerm);
      
      const matchesDisease = !selectedDisease || (patient.disease || 'N/A') === selectedDisease;
      const matchesHospital = !selectedHospital || (patient.hospital || 'N/A') === selectedHospital;

      return matchesSearch && matchesDisease && matchesHospital;
    });
  }

  // Pagination
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let paginationHTML = '';

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    // Previous
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;

    // Pages
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    // Next
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;

    paginationContainer.innerHTML = `<ul class="pagination">${paginationHTML}</ul>`;
  }

  // Get current page data
  function getCurrentPageData(data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }

  // Update view
  function updateView() {
    loadingSpinner.classList.remove('d-none');
    
    setTimeout(() => {
      filteredData = filterData(patientData);
      const sortedData = sortData(filteredData, sortColumn, sortDirection);
      const currentData = getCurrentPageData(sortedData);
      
      // Hide empty original state if data exists
      if (patientData.length === 0) {
        document.querySelector('.empty-state')?.classList.remove('d-none');
        return;
      }

      // Update stat
      document.querySelector('.stat-count').textContent = filteredData.length;

      if (currentData.length === 0) {
        cardsView.classList.add('d-none');
        tableView.classList.add('d-none');
        emptyState.classList.remove('d-none');
        renderPagination(0);
      } else {
        emptyState.classList.add('d-none');
        if (currentView === 'cards') {
          cardsView.classList.remove('d-none');
          tableView.classList.add('d-none');
          renderCards(currentData);
        } else {
          cardsView.classList.add('d-none');
          tableView.classList.remove('d-none');
          renderTable(currentData);
        }
        renderPagination(filteredData.length);
      }

      loadingSpinner.classList.add('d-none');
    }, 300);
  }

  // Toggle view
  toggleViewBtn.addEventListener('click', function() {
    currentView = currentView === 'cards' ? 'table' : 'cards';
    toggleViewBtn.innerHTML = currentView === 'cards' ? 
      '<i class="fa-solid fa-table-cells"></i> Table View' : 
      '<i class="fa-solid fa-grip-vertical"></i> Cards View';
    updateView();
  });

  // Event listeners
  searchInput.addEventListener('input', () => { currentPage = 1; updateView(); });
  diseaseFilter.addEventListener('change', () => { currentPage = 1; updateView(); });
  hospitalFilter.addEventListener('change', () => { currentPage = 1; updateView(); });
  clearFiltersBtn?.addEventListener('click', () => {
    searchInput.value = '';
    diseaseFilter.value = '';
    hospitalFilter.value = '';
    currentPage = 1;
    updateView();
  });

  // Pagination click
  paginationContainer.addEventListener('click', function(e) {
    if (e.target.dataset.page) {
      currentPage = parseInt(e.target.dataset.page);
      updateView();
    }
  });

  // Sort headers (table view only)
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
      if (currentView !== 'table') return;
      const column = this.dataset.sort;
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
      updateView();
    });
  });

  // Navbar search integration (if exists)
  const navbarSearch = document.querySelector('.admin-searchBar input');
  if (navbarSearch) {
    navbarSearch.addEventListener('input', function() {
      searchInput.value = this.value;
      currentPage = 1;
      updateView();
    });
  }

  // Utils
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize
  initFilters();
  updateView();
});
