const API_BASE = '/api/cars';

let cars = [];
let filters = {
  q: '',
  status: '',
  sortBy: 'created_at',
  sortDir: 'DESC'
};
let editingId = null;

const tableBody = document.querySelector('#cars-table tbody');
const messageEl = document.getElementById('message');
const listSubtitleEl = document.getElementById('list-subtitle');

const statTotalEl = document.getElementById('stat-total');
const statAvailableEl = document.getElementById('stat-available');
const statReservedEl = document.getElementById('stat-reserved');
const statSoldEl = document.getElementById('stat-sold');
const statAvgPriceEl = document.getElementById('stat-avg-price');

const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const sortBySelect = document.getElementById('sort-by');
const sortDirSelect = document.getElementById('sort-dir');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

const addCarBtn = document.getElementById('add-car-btn');
const modalBackdrop = document.getElementById('car-modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const carForm = document.getElementById('car-form');

const carIdInput = document.getElementById('car-id');
const makeInput = document.getElementById('make');
const modelInput = document.getElementById('model');
const yearInput = document.getElementById('year');
const mileageInput = document.getElementById('mileage');
const priceInput = document.getElementById('price');
const fuelInput = document.getElementById('fuel_type');
const transmissionInput = document.getElementById('transmission');
const statusInput = document.getElementById('status');
const modalTitle = document.getElementById('car-modal-title');

function showMessage(text, type = '') {
  messageEl.textContent = text;
  messageEl.className = 'message ' + (type || '');
  if (text) {
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }, 3000);
  }
}

async function fetchCars() {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortDir) params.set('sortDir', filters.sortDir);

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error('Greška u dohvaćanju');
    cars = await res.json();
    renderCars();
    updateStats();
  } catch (err) {
    console.error(err);
    showMessage('Greška pri dohvaćanju vozila.', 'error');
  }
}

function renderCars() {
  tableBody.innerHTML = '';

  if (!cars || cars.length === 0) {
    listSubtitleEl.textContent = 'Nema vozila koja zadovoljavaju filtere.';
    return;
  }

  listSubtitleEl.textContent = `Prikazano vozila: ${cars.length}`;

  cars.forEach((car) => {
    const row = document.createElement('tr');

    const priceFormatted = isFinite(car.price)
      ? `${Number(car.price).toFixed(2)} €`
      : '-';
    const mileageFormatted =
      car.mileage !== null && car.mileage !== undefined
        ? `${car.mileage.toLocaleString('hr-HR')} km`
        : '—';

    const displayFuel = car.fuel_type
      ? {
          diesel: 'Dizel',
          petrol: 'Benzin',
          hybrid: 'Hibrid',
          electric: 'Električni'
        }[car.fuel_type] || car.fuel_type
      : '—';

    const displayTrans = car.transmission
      ? { manual: 'Ručni', automatic: 'Automatski' }[car.transmission] ||
        car.transmission
      : '—';

    const statusClass =
      car.status === 'available'
        ? 'badge-available'
        : car.status === 'reserved'
        ? 'badge-reserved'
        : 'badge-sold';

    const statusLabel =
      car.status === 'available'
        ? 'Dostupan'
        : car.status === 'reserved'
        ? 'Rezerviran'
        : 'Prodan';

    row.innerHTML = `
      <td data-label="ID">${car.id}</td>
      <td data-label="Vozilo">
        <strong>${car.make} ${car.model}</strong>
      </td>
      <td data-label="God.">${car.year}</td>
      <td data-label="KM">${mileageFormatted}</td>
      <td data-label="Gorivo">${displayFuel}</td>
      <td data-label="Mjenjač">${displayTrans}</td>
      <td data-label="Status">
        <span class="badge ${statusClass}">${statusLabel}</span>
      </td>
      <td data-label="Cijena">${priceFormatted}</td>
      <td data-label="Akcije">
        <div class="action-group">
          <button class="action-btn edit">Uredi</button>
          <button class="action-btn delete">Obriši</button>
        </div>
      </td>
    `;

    const editBtn = row.querySelector('.action-btn.edit');
    const deleteBtn = row.querySelector('.action-btn.delete');

    editBtn.addEventListener('click', () => openEditModal(car));
    deleteBtn.addEventListener('click', () => deleteCar(car.id));

    tableBody.appendChild(row);
  });
}

function updateStats() {
  const total = cars.length;
  const available = cars.filter((c) => c.status === 'available').length;
  const reserved = cars.filter((c) => c.status === 'reserved').length;
  const sold = cars.filter((c) => c.status === 'sold').length;

  const avgPrice =
    total > 0
      ? cars.reduce((sum, c) => sum + (Number(c.price) || 0), 0) / total
      : 0;

  statTotalEl.textContent = total;
  statAvailableEl.textContent = available;
  statReservedEl.textContent = reserved;
  statSoldEl.textContent = sold;
  statAvgPriceEl.textContent = avgPrice
    ? `${avgPrice.toFixed(0).toLocaleString('hr-HR')} €`
    : '0 €';
}

function setFiltersFromUI() {
  filters.q = searchInput.value.trim();
  filters.status = statusFilter.value;
  filters.sortBy = sortBySelect.value;
  filters.sortDir = sortDirSelect.value;
}

let searchTimeout = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    setFiltersFromUI();
    fetchCars();
  }, 300);
});

statusFilter.addEventListener('change', () => {
  setFiltersFromUI();
  fetchCars();
});

sortBySelect.addEventListener('change', () => {
  setFiltersFromUI();
  fetchCars();
});

sortDirSelect.addEventListener('change', () => {
  setFiltersFromUI();
  fetchCars();
});

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  statusFilter.value = '';
  sortBySelect.value = 'created_at';
  sortDirSelect.value = 'DESC';
  setFiltersFromUI();
  fetchCars();
});

function openCreateModal() {
  editingId = null;
  modalTitle.textContent = 'Novi automobil';
  carIdInput.value = '';
  makeInput.value = '';
  modelInput.value = '';
  yearInput.value = '';
  mileageInput.value = '';
  priceInput.value = '';
  fuelInput.value = '';
  transmissionInput.value = '';
  statusInput.value = 'available';
  showModal();
}

function openEditModal(car) {
  editingId = car.id;
  modalTitle.textContent = `Uredi #${car.id}`;
  carIdInput.value = car.id;
  makeInput.value = car.make || '';
  modelInput.value = car.model || '';
  yearInput.value = car.year || '';
  mileageInput.value = car.mileage || '';
  priceInput.value = car.price || '';
  fuelInput.value = car.fuel_type || '';
  transmissionInput.value = car.transmission || '';
  statusInput.value = car.status || 'available';
  showModal();
}

function showModal() {
  modalBackdrop.classList.add('active');
}

function hideModal() {
  modalBackdrop.classList.remove('active');
}

addCarBtn.addEventListener('click', openCreateModal);
modalCloseBtn.addEventListener('click', hideModal);
modalCancelBtn.addEventListener('click', hideModal);

modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) {
    hideModal();
  }
});

carForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    make: makeInput.value.trim(),
    model: modelInput.value.trim(),
    year: Number(yearInput.value),
    price: Number(priceInput.value),
    mileage: mileageInput.value ? Number(mileageInput.value) : null,
    fuel_type: fuelInput.value || null,
    transmission: transmissionInput.value || null,
    status: statusInput.value || 'available'
  };

  if (!payload.make || !payload.model || !payload.year || !payload.price) {
    showMessage('Molim ispuni obavezna polja.', 'error');
    return;
  }

  try {
    let url = API_BASE;
    let method = 'POST';

    if (editingId) {
      url = `${API_BASE}/${editingId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Greška pri spremanju');
    }

    await res.json();

    hideModal();
    showMessage(
      editingId ? 'Vozilo je ažurirano.' : 'Novo vozilo je dodano.',
      'success'
    );
    fetchCars();
  } catch (err) {
    console.error(err);
    showMessage('Greška pri spremanju vozila.', 'error');
  }
});

async function deleteCar(id) {
  if (!confirm(`Stvarno želiš obrisati vozilo #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Greška pri brisanju');
    }

    showMessage('Vozilo je obrisano.', 'success');
    fetchCars();
  } catch (err) {
    console.error(err);
    showMessage('Greška pri brisanju vozila.', 'error');
  }
}

setFiltersFromUI();
fetchCars();
