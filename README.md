# Urban Crave - Restaurant Table Management System

A premium, classically designed Table Management System for **Urban Crave**. This application allows restaurant staff to track table availability, book reservations with party counts and primary guest names, and release tables once dining sessions are completed.

---

## 🔑 Login Credentials

To access the management portal, use the following credentials on the login screen:
- **Username**: `admin`
- **Password**: `crave123`

---

## ✨ Features

1. **Brand Identity**:
   - **Unique Logo**: A custom-designed SVG symbol representing Urban Crave — featuring a golden monogram 'UC' intertwined with elegant dinner plate contours and crown-fork prongs.
   - **Aesthetics**: Premium dark slate background with warm gold, emerald green (available), and rose red (reserved) neon-glow accent colors.
2. **Interactive 2D Floor Plan**:
   - Spatially visualizes 20 tables with varied seating capacities (2-seater, 4-seater, 6-seater, and VIP 8-seater rectangular booths).
   - Dynamically renders seating arrangements (chairs) around each table.
   - Interactive hover tooltips showing current reservation details or table capacities.
3. **Reservation Workflow**:
   - **Table Selection**: Click any table to inspect its status.
   - **Table 5 / Booking**: Select an available table, input the guest's name, choose the party size (capped at that table's max capacity), and confirm.
   - **State Control**: Check details of any reserved table (time of booking, name, party size) and release it when the guests check out.
4. **Search and Filter Tools**:
   - Filter tables instantly by status: **All**, **Available**, or **Reserved** (dims out non-matching tables while keeping spatial awareness).
   - Search box to look up table numbers or active customer names.
5. **Robust Persistence**:
   - All reservation states are automatically synchronized with the browser's `localStorage` so configurations persist across tab closing and page refreshes.

---

## 🛠️ File Structure

The project is built entirely on standard Web standards (Vanilla HTML, CSS, JavaScript) without any external dependency files:
```text
UrbanCrave_TableManagement/
├── index.html   # HTML5 Semantic structure & brand SVG symbols
├── styles.css   # Theme styling, layout positions, responsiveness, and animations
└── app.js       # Core logic: authentication, local state, storage, and event bindings
```

---

## 🚀 How to Run

1. Navigate to the project folder: `c:\Users\jampa\OneDrive\Documents\Pradeep\UrbanCrave_TableManagement`
2. Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) by double-clicking it.
3. Alternatively, serve it locally using a server extension (like VS Code Live Server or Python's `http.server`).
