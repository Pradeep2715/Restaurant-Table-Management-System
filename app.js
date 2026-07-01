// ==========================================
// URBAN CRAVE - APPLICATION LOGIC
// ==========================================

// Default data structure for 20 tables with bookings array
const DEFAULT_TABLES = [
  // 2-Seaters (Small Circles)
  { id: 1, capacity: 2, shape: 'circle', bookings: [] },
  { id: 2, capacity: 2, shape: 'circle', bookings: [] },
  { id: 3, capacity: 2, shape: 'circle', bookings: [] },
  { id: 4, capacity: 2, shape: 'circle', bookings: [] },
  { id: 5, capacity: 2, shape: 'circle', bookings: [] },
  { id: 6, capacity: 2, shape: 'circle', bookings: [] },
  
  // 4-Seaters (Medium Squares)
  { id: 7, capacity: 4, shape: 'square', bookings: [] },
  { id: 8, capacity: 4, shape: 'square', bookings: [] },
  { id: 9, capacity: 4, shape: 'square', bookings: [] },
  { id: 10, capacity: 4, shape: 'square', bookings: [] },
  { id: 11, capacity: 4, shape: 'square', bookings: [] },
  { id: 12, capacity: 4, shape: 'square', bookings: [] },
  { id: 13, capacity: 4, shape: 'square', bookings: [] },
  { id: 14, capacity: 4, shape: 'square', bookings: [] },
  
  // 6-Seaters (Medium Circles)
  { id: 15, capacity: 6, shape: 'circle', bookings: [] },
  { id: 16, capacity: 6, shape: 'circle', bookings: [] },
  { id: 17, capacity: 6, shape: 'circle', bookings: [] },
  { id: 18, capacity: 6, shape: 'circle', bookings: [] },
  
  // 8-Seaters VIP (Large Rectangles)
  { id: 19, capacity: 8, shape: 'rectangle', bookings: [] },
  { id: 20, capacity: 8, shape: 'rectangle', bookings: [] }
];

// App State
let state = {
  tables: [],
  users: [],
  currentUser: null,
  selectedTableId: null,
  currentFilter: 'all',
  searchQuery: '',
  // Prebooking active view state
  activeDate: '',
  activeTimeSlot: '06:00 PM - 08:00 PM'
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const signupUsernameInput = document.getElementById('signup-username');
const signupPasswordInput = document.getElementById('signup-password');
const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');

// Auth Toggles Links
const linkShowSignup = document.getElementById('link-show-signup');
const linkShowLogin = document.getElementById('link-show-login');

const dashboardSection = document.getElementById('dashboard-section');
const displayUsername = document.getElementById('display-username');
const userBadge = document.getElementById('user-badge');
const btnLogout = document.getElementById('btn-logout');

// Prebooking Date & Slot Filter Elements
const viewDateInput = document.getElementById('view-date');
const viewTimeSlotSelect = document.getElementById('view-time-slot');

const floorPlan = document.getElementById('floor-plan');
const searchInput = document.getElementById('search-input');
const filterTabs = document.querySelectorAll('.filter-tab');

// Stats Counters
const statAvailable = document.getElementById('stat-available');
const statReserved = document.getElementById('stat-reserved');

// Sidebar Reservation Panels
const panelTitle = document.getElementById('panel-title');
const noTableSelected = document.getElementById('no-table-selected');
const tableDetailsPanel = document.getElementById('table-details-panel');
const selectedTableBadge = document.getElementById('selected-table-badge');
const selectedTableStatus = document.getElementById('selected-table-status');
const tableCapacityText = document.getElementById('table-capacity-text');

// Form for booking
const bookingForm = document.getElementById('booking-form');
const bookingNameInput = document.getElementById('booking-name');
const bookingGuestsSelect = document.getElementById('booking-guests');
const bookingDateDisplay = document.getElementById('booking-date-display');
const bookingTimeDisplay = document.getElementById('booking-time-display');

// Details display for reserved
const reservationInfo = document.getElementById('reservation-info');
const resGuestName = document.getElementById('res-guest-name');
const resPartySize = document.getElementById('res-party-size');
const resDate = document.getElementById('res-date');
const resTime = document.getElementById('res-time');
const btnReleaseTable = document.getElementById('btn-release-table');

// Customer History Panel elements
const userVisitsCount = document.getElementById('user-visits-count');
const userBookingsCount = document.getElementById('user-bookings-count');
const historyList = document.getElementById('history-list');

// ==========================================
// INITIATION & SESSION MANAGEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  bindAuthTogglerEvents();
  bindPrebookingEvents();
  bindUtilityEvents();
});

function initApp() {
  // Set default view date to today in YYYY-MM-DD (local timezone-safe)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  state.activeDate = todayString;
  viewDateInput.value = todayString;
  
  // Set default viewing limits to prevent booking in the past
  viewDateInput.min = todayString;

  // 1. Load Registered Users
  const savedUsers = localStorage.getItem('urbanCraveUsers');
  if (savedUsers) {
    try {
      state.users = JSON.parse(savedUsers);
      // Migration: Ensure bookings and visits properties exist
      state.users.forEach(u => {
        if (!u.bookings) u.bookings = [];
        if (u.visits === undefined) u.visits = 1;
      });
      // Schema Migration: Ensure 'admin' user profile always exists
      const adminExists = state.users.some(u => u.username === 'admin');
      if (!adminExists) {
        state.users.push({
          username: 'admin',
          password: '123',
          visits: 1,
          bookings: []
        });
      }
    } catch (e) {
      state.users = [];
    }
  } else {
    // Seed with a default customer and admin
    state.users = [
      {
        username: 'admin',
        password: '123',
        visits: 1,
        bookings: []
      },
      { 
        username: 'pradeep', 
        password: '123', 
        visits: 2, 
        bookings: [
          { tableId: 5, date: todayString, timeSlot: '06:00 PM - 08:00 PM', partySize: 2, status: 'active' }
        ] 
      }
    ];
    localStorage.setItem('urbanCraveUsers', JSON.stringify(state.users));
  }

  // 2. Load Table Data
  const savedTables = localStorage.getItem('urbanCraveTables');
  if (savedTables) {
    try {
      state.tables = JSON.parse(savedTables);
      // Migration: Ensure bookings array exists for all tables
      state.tables.forEach(t => {
        if (!t.bookings) t.bookings = [];
      });
    } catch (e) {
      state.tables = JSON.parse(JSON.stringify(DEFAULT_TABLES));
    }
  } else {
    state.tables = JSON.parse(JSON.stringify(DEFAULT_TABLES));
    // Pre-seed Table 5 with a booking for today Dinner slot under pradeep
    state.tables[4].bookings = [{
      date: todayString,
      timeSlot: '06:00 PM - 08:00 PM',
      guestName: 'pradeep',
      partySize: 2
    }];
    
    saveTablesToStorage();
  }

  // 3. Check Session Logins
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const savedUser = sessionStorage.getItem('username');

  if (isLoggedIn && savedUser) {
    state.currentUser = savedUser.trim().toLowerCase();
    showDashboard(savedUser.trim().toLowerCase());
  } else {
    showLogin();
  }
}

function saveTablesToStorage() {
  localStorage.setItem('urbanCraveTables', JSON.stringify(state.tables));
}

function saveUsersToStorage() {
  localStorage.setItem('urbanCraveUsers', JSON.stringify(state.users));
}

function bindPrebookingEvents() {
  const handleDateChange = (e) => {
    state.activeDate = e.target.value;
    renderFloorPlan();
    updateStats();
    if (state.selectedTableId) {
      selectTable(state.selectedTableId);
    }
  };

  const handleTimeSlotChange = (e) => {
    state.activeTimeSlot = e.target.value;
    renderFloorPlan();
    updateStats();
    if (state.selectedTableId) {
      selectTable(state.selectedTableId);
    }
  };

  // Bind both change and input to ensure compatibility across all browsers
  viewDateInput.addEventListener('change', handleDateChange);
  viewDateInput.addEventListener('input', handleDateChange);
  
  viewTimeSlotSelect.addEventListener('change', handleTimeSlotChange);
  viewTimeSlotSelect.addEventListener('input', handleTimeSlotChange);
}

function bindUtilityEvents() {
  const btnResetDb = document.getElementById('btn-reset-db');
  if (btnResetDb) {
    btnResetDb.addEventListener('click', () => {
      if (confirm('🔄 Are you sure you want to reset all bookings and accounts? This will clear local data and log you out.')) {
        localStorage.clear();
        sessionStorage.clear();
        showToast('🔄 Database reset successful. Reloading...', 'info');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }
}

// ==========================================
// VIEWS SWITCHING (LOGIN / SIGNUP)
// ==========================================
function bindAuthTogglerEvents() {
  linkShowSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupUsernameInput.value = '';
    signupPasswordInput.value = '';
    signupConfirmPasswordInput.value = '';
  });

  linkShowLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
  });
}

// ==========================================
// CUSTOMER REGISTRATION (SIGN UP)
// ==========================================
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const username = signupUsernameInput.value.trim().toLowerCase();
  const password = signupPasswordInput.value.trim();
  const confirmPassword = signupConfirmPasswordInput.value.trim();

  if (username.length < 3) {
    showToast('⚠️ Username must be at least 3 characters.', 'error');
    return;
  }

  if (password.length < 4) {
    showToast('⚠️ Password must be at least 4 characters.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('⚠️ Passwords do not match. Please verify.', 'error');
    return;
  }

  const userExists = state.users.some(u => u.username === username);
  if (userExists) {
    showToast('⚠️ Username is already taken.', 'error');
    return;
  }

  const newUser = {
    username: username,
    password: password,
    visits: 1, 
    bookings: []
  };

  state.users.push(newUser);
  saveUsersToStorage();

  showToast(`✨ Account created! Welcome to Urban Crave, ${username}.`, 'success');

  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('username', username);
  state.currentUser = username;

  setTimeout(() => {
    showDashboard(username);
  }, 500);
});

// ==========================================
// AUTHENTICATION LOG IN
// ==========================================
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  const user = state.users.find(u => u.username === username && u.password === password);

  if (user) {
    user.visits = (user.visits || 0) + 1;
    saveUsersToStorage();

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('username', username);
    state.currentUser = username;
    
    showToast(`🔑 Welcome back, ${username}! (Visits: ${user.visits})`, 'success');
    
    loginForm.classList.add('fade-out');
    setTimeout(() => {
      showDashboard(username);
      loginForm.classList.remove('fade-out');
      usernameInput.value = '';
      passwordInput.value = '';
    }, 400);
  } else {
    showToast('❌ Invalid credentials. Please register if you are new.', 'error');
    const card = document.querySelector('.login-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
  }
});

btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('username');
  state.currentUser = null;
  showToast('🔒 Logged out successfully.', 'info');
  
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  showLogin();
});

function showLogin() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
  document.body.style.overflow = 'hidden';
}

function showDashboard(username) {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  document.body.style.overflow = '';
  
  displayUsername.textContent = username;
  
  // Custom badges
  const user = state.users.find(u => u.username === username);
  if (user) {
    if (user.visits >= 10 || user.bookings.length >= 5) {
      userBadge.textContent = 'Gold Craver';
      userBadge.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
      userBadge.style.borderColor = 'rgba(212, 175, 55, 0.4)';
    } else if (user.visits >= 4) {
      userBadge.textContent = 'Regular Member';
      userBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      userBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      userBadge.textContent = 'Lounge Guest';
      userBadge.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      userBadge.style.borderColor = 'var(--glass-border)';
    }
  }

  renderFloorPlan();
  updateStats();
  renderHistoryList();
  deselectAllTables();
}

// ==========================================
// RENDER FLOOR MAP & CHAIRS (DYNAMIC LOOKUPS)
// ==========================================
function getTableReservation(table, date, timeSlot) {
  if (!table.bookings) return null;
  return table.bookings.find(b => b.date === date && b.timeSlot === timeSlot);
}

function renderFloorPlan() {
  floorPlan.innerHTML = '';
  
  state.tables.forEach(table => {
    // Resolve reservation status for the currently selected Date and Time Slot
    const booking = getTableReservation(table, state.activeDate, state.activeTimeSlot);
    const isReserved = !!booking;

    const tableEl = document.createElement('div');
    tableEl.className = `dining-table shape-${table.shape} cap-${table.capacity} status-${isReserved ? 'reserved' : 'available'}`;
    tableEl.setAttribute('data-id', table.id);
    
    // Check search & filters
    if (!matchesFilter(table, isReserved) || !matchesSearch(table, booking)) {
      tableEl.classList.add('dimmed');
    }
    
    if (state.selectedTableId === table.id) {
      tableEl.classList.add('active');
    }

    const bodyEl = document.createElement('div');
    bodyEl.className = 'table-body';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'table-label';
    
    const numEl = document.createElement('span');
    numEl.className = 'table-num';
    numEl.textContent = `${table.id}`;
    
    const subEl = document.createElement('span');
    subEl.className = 'table-sub';
    subEl.textContent = isReserved ? 'Reserved' : `${table.capacity} Pax`;
    
    labelEl.appendChild(numEl);
    labelEl.appendChild(subEl);
    bodyEl.appendChild(labelEl);
    tableEl.appendChild(bodyEl);
    
    // Chairs
    const chairsContainer = document.createElement('div');
    chairsContainer.className = 'chairs-container';
    
    const chairPositions = getChairPositions(table.capacity, table.shape);
    chairPositions.forEach(pos => {
      const chair = document.createElement('span');
      chair.className = 'chair';
      chair.style.cssText = pos;
      chairsContainer.appendChild(chair);
    });
    
    tableEl.appendChild(chairsContainer);
    
    // Tooltip details
    const tooltip = document.createElement('div');
    tooltip.className = 'table-tooltip';
    if (isReserved) {
      const isMine = booking.guestName.toLowerCase() === state.currentUser.toLowerCase();
      const displayGuest = isMine ? 'You (Me)' : 'Reserved Guest';
      tooltip.innerHTML = `Table ${table.id} • <span class="tooltip-status reserved">Reserved</span><br>By: ${displayGuest} (${booking.partySize} guests)`;
    } else {
      tooltip.innerHTML = `Table ${table.id} • <span class="tooltip-status available">Available</span><br>Capacity: ${table.capacity} Seats`;
    }
    tableEl.appendChild(tooltip);
    
    tableEl.addEventListener('click', () => {
      selectTable(table.id);
    });
    
    floorPlan.appendChild(tableEl);
  });
}

function getChairPositions(capacity, shape) {
  const chairs = [];
  if (capacity === 2) {
    chairs.push('top: -12px; left: calc(50% - 5px);');
    chairs.push('bottom: -12px; left: calc(50% - 5px);');
  } 
  else if (capacity === 4) {
    chairs.push('top: -12px; left: calc(50% - 5px);');
    chairs.push('bottom: -12px; left: calc(50% - 5px);');
    chairs.push('left: -12px; top: calc(50% - 5px);');
    chairs.push('right: -12px; top: calc(50% - 5px);');
  } 
  else if (capacity === 6) {
    chairs.push('top: -10px; left: calc(50% - 5px);');
    chairs.push('bottom: -10px; left: calc(50% - 5px);');
    chairs.push('top: 15%; left: -10px;');
    chairs.push('top: 15%; right: -10px;');
    chairs.push('bottom: 15%; left: -10px;');
    chairs.push('bottom: 15%; right: -10px;');
  } 
  else if (capacity === 8) {
    chairs.push('top: -12px; left: 22%;');
    chairs.push('top: -12px; left: calc(50% - 5px);');
    chairs.push('top: -12px; right: 22%;');
    chairs.push('bottom: -12px; left: 22%;');
    chairs.push('bottom: -12px; left: calc(50% - 5px);');
    chairs.push('bottom: -12px; right: 22%;');
    chairs.push('left: -12px; top: calc(50% - 5px);');
    chairs.push('right: -12px; top: calc(50% - 5px);');
  }
  return chairs;
}

// ==========================================
// SEARCH & FILTER TRIGGERS
// ==========================================
function matchesFilter(table, isReserved) {
  if (state.currentFilter === 'all') return true;
  if (state.currentFilter === 'available') return !isReserved;
  if (state.currentFilter === 'reserved') return isReserved;
  return true;
}

function matchesSearch(table, booking) {
  if (!state.searchQuery) return true;
  const q = state.searchQuery.toLowerCase();
  
  if (table.id.toString() === q || `table ${table.id}`.includes(q)) return true;
  
  if (booking) {
    const isMine = booking.guestName === state.currentUser;
    if (isMine && booking.guestName.toLowerCase().includes(q)) return true;
    if (!isMine && "reserved guest".includes(q)) return true;
    if (booking.date.includes(q) || booking.timeSlot.toLowerCase().includes(q)) return true;
  }
  
  return false;
}

searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.trim();
  renderFloorPlan();
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    state.currentFilter = tab.getAttribute('data-filter');
    renderFloorPlan();
  });
});

// ==========================================
// SELECTION & PANEL LOADING
// ==========================================
function selectTable(id) {
  state.selectedTableId = id;
  
  const tables = document.querySelectorAll('.dining-table');
  tables.forEach(el => {
    if (parseInt(el.getAttribute('data-id')) === id) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  const table = state.tables.find(t => t.id === id);
  if (!table) return;

  noTableSelected.classList.add('hidden');
  tableDetailsPanel.classList.remove('hidden');
  
  panelTitle.textContent = `Manage Table ${table.id}`;
  selectedTableBadge.textContent = `Table ${table.id < 10 ? '0' + table.id : table.id}`;
  tableCapacityText.textContent = `Configuration: ${table.shape.charAt(0).toUpperCase() + table.shape.slice(1)} • Capacity: ${table.capacity} Seaters`;
  
  // Query booking for the currently selected Date and Time Slot
  const booking = getTableReservation(table, state.activeDate, state.activeTimeSlot);
  const isReserved = !!booking;

  if (isReserved) {
    // Reserved View
    selectedTableStatus.textContent = 'Reserved';
    selectedTableStatus.className = 'status-tag tag-reserved';
    
    bookingForm.classList.add('hidden');
    reservationInfo.classList.remove('hidden');
    
    const isMine = booking.guestName.toLowerCase() === state.currentUser.toLowerCase();
    
    if (isMine) {
      resGuestName.textContent = `You (${booking.guestName})`;
      resPartySize.textContent = `${booking.partySize} Members`;
      resDate.textContent = booking.date;
      resTime.textContent = booking.timeSlot;
      btnReleaseTable.classList.remove('hidden');
    } else {
      resGuestName.textContent = 'Reserved Guest';
      resPartySize.textContent = 'Private Details';
      resDate.textContent = booking.date;
      resTime.textContent = booking.timeSlot;
      btnReleaseTable.classList.add('hidden');
    }
  } else {
    // Available Booking Form View
    selectedTableStatus.textContent = 'Available';
    selectedTableStatus.className = 'status-tag tag-available';
    
    bookingForm.classList.remove('hidden');
    reservationInfo.classList.add('hidden');
    
    bookingNameInput.value = state.currentUser;
    
    // Show Prebooking Date/Time targets in the form
    bookingDateDisplay.value = state.activeDate;
    bookingTimeDisplay.value = state.activeTimeSlot.split('(')[0].trim();
    
    // Rebuild party sizes dropdown
    bookingGuestsSelect.innerHTML = '';
    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = 'Select guests count...';
    defOpt.disabled = true;
    defOpt.selected = true;
    bookingGuestsSelect.appendChild(defOpt);
    
    for (let i = 1; i <= table.capacity; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} ${i === 1 ? 'Guest' : 'Guests'}`;
      bookingGuestsSelect.appendChild(opt);
    }
  }
}

function deselectAllTables() {
  state.selectedTableId = null;
  const tables = document.querySelectorAll('.dining-table');
  tables.forEach(el => el.classList.remove('active'));
  
  panelTitle.textContent = 'Select a Table';
  noTableSelected.classList.remove('hidden');
  tableDetailsPanel.classList.add('hidden');
}

// ==========================================
// PREBOOKING ACTIONS (BOOK / CANCEL)
// ==========================================
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (state.selectedTableId === null) return;
  
  const partySize = parseInt(bookingGuestsSelect.value);
  
  if (isNaN(partySize) || partySize <= 0) {
    showToast('⚠️ Please select the number of guests.', 'error');
    return;
  }

  const table = state.tables.find(t => t.id === state.selectedTableId);
  if (!table) return;

  // Safety double check to prevent slot overlaps
  const alreadyBooked = getTableReservation(table, state.activeDate, state.activeTimeSlot);
  if (alreadyBooked) {
    showToast('⚠️ Table is already booked for this specific slot.', 'error');
    return;
  }

  // 1. Add Booking to Table
  table.bookings.push({
    date: state.activeDate,
    timeSlot: state.activeTimeSlot,
    guestName: state.currentUser,
    partySize: partySize
  });

  // 2. Add Booking to User History
  const user = state.users.find(u => u.username.toLowerCase() === state.currentUser.toLowerCase());
  if (user) {
    user.bookings.push({
      tableId: table.id,
      date: state.activeDate,
      timeSlot: state.activeTimeSlot,
      partySize: partySize,
      status: 'active'
    });
  }

  saveTablesToStorage();
  saveUsersToStorage();
  
  showToast(`🎉 Table ${table.id} prebooked successfully for ${state.activeDate}!`, 'success');
  
  const targetTableEl = document.querySelector(`.dining-table[data-id="${table.id}"]`);
  if (targetTableEl) {
    targetTableEl.classList.add('just-booked');
    setTimeout(() => targetTableEl.classList.remove('just-booked'), 500);
  }

  renderFloorPlan();
  updateStats();
  renderHistoryList();
  selectTable(table.id);
});

btnReleaseTable.addEventListener('click', () => {
  if (state.selectedTableId === null) return;
  
  const table = state.tables.find(t => t.id === state.selectedTableId);
  if (!table) return;

  const booking = getTableReservation(table, state.activeDate, state.activeTimeSlot);
  if (!booking) return;

  if (booking.guestName.toLowerCase() !== state.currentUser.toLowerCase()) {
    showToast('❌ Authorization error: You cannot cancel another guest\'s reservation.', 'error');
    return;
  }

  if (confirm(`Do you wish to cancel your reservation for Table ${table.id} on ${state.activeDate}?`)) {
    // 1. Remove Booking from Table
    table.bookings = table.bookings.filter(b => !(b.date === state.activeDate && b.timeSlot === state.activeTimeSlot));

    // 2. Mark in User History as released
    const user = state.users.find(u => u.username.toLowerCase() === state.currentUser.toLowerCase());
    if (user) {
      const activeBooking = user.bookings.find(b => 
        b.tableId === state.selectedTableId && 
        b.date === state.activeDate && 
        b.timeSlot === state.activeTimeSlot && 
        b.status === 'active'
      );
      if (activeBooking) {
        activeBooking.status = 'released';
      }
    }

    saveTablesToStorage();
    saveUsersToStorage();
    
    showToast(`🍃 Reservation cancelled. Table ${table.id} slot is now vacant.`, 'success');

    renderFloorPlan();
    updateStats();
    renderHistoryList();
    selectTable(table.id);
  }
});

// ==========================================
// HISTORY RENDERING & NAVIGATION TELEPORTING
// ==========================================
function renderHistoryList() {
  historyList.innerHTML = '';
  
  const user = state.users.find(u => u.username.toLowerCase() === state.currentUser.toLowerCase());
  if (!user) return;

  userVisitsCount.textContent = user.visits || 0;
  const activeBookingsCount = user.bookings.filter(b => b.status === 'active').length;
  userBookingsCount.textContent = activeBookingsCount;

  if (!user.bookings || user.bookings.length === 0) {
    historyList.innerHTML = '<div class="history-placeholder">No prebookings recorded on this account yet.</div>';
    return;
  }

  const sortedBookings = [...user.bookings].reverse();

  sortedBookings.forEach(booking => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.title = 'Click to view this reservation on the floor map!';
    
    // Add dynamic cursor
    item.style.cursor = 'pointer';

    const details = document.createElement('div');
    details.className = 'history-item-details';

    const title = document.createElement('span');
    title.className = 'history-item-title';
    title.textContent = `Table ${booking.tableId}`;

    const meta = document.createElement('span');
    meta.className = 'history-item-meta';
    
    // Get short time display
    const shortTime = booking.timeSlot.split(' - ')[0];
    meta.textContent = `${booking.partySize} pax • ${booking.date} @ ${shortTime}`;

    details.appendChild(title);
    details.appendChild(meta);

    const statusTag = document.createElement('span');
    statusTag.className = `history-item-status ${booking.status}`;
    statusTag.textContent = booking.status === 'active' ? 'Active' : 'Released';

    item.appendChild(details);
    item.appendChild(statusTag);
    
    // TELEPORT NAVIGATION: Click history item to switch date/time and select the table!
    item.addEventListener('click', () => {
      // 1. Switch View inputs
      viewDateInput.value = booking.date;
      // Find matching select option
      for (let i = 0; i < viewTimeSlotSelect.options.length; i++) {
        if (viewTimeSlotSelect.options[i].value === booking.timeSlot) {
          viewTimeSlotSelect.selectedIndex = i;
          break;
        }
      }
      
      // 2. Trigger updates
      state.activeDate = booking.date;
      state.activeTimeSlot = booking.timeSlot;
      
      showToast(`🔍 Showing Table ${booking.tableId} reservation for ${booking.date}...`, 'info');
      
      renderFloorPlan();
      updateStats();
      selectTable(booking.tableId);
    });

    historyList.appendChild(item);
  });
}

// ==========================================
// AUXILIARY UTILITIES
// ==========================================
function updateStats() {
  let reservedCount = 0;
  
  state.tables.forEach(table => {
    const hasBooking = getTableReservation(table, state.activeDate, state.activeTimeSlot);
    if (hasBooking) reservedCount++;
  });
  
  const availableCount = state.tables.length - reservedCount;
  statAvailable.textContent = availableCount;
  statReserved.textContent = reservedCount;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '🔔';
  if (type === 'success') icon = '✨';
  if (type === 'error') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}
