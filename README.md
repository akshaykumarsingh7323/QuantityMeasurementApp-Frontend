# QuantityMeasurementApp-Frontend

A web application to convert, compare, and compute measurements across **Length**, **Weight**, **Temperature**, and **Volume**.

---

## Project Structure

```
quantity-measurement/
├── index.html            Main HTML page
├── css/
│   ├── styles.css        Global styles, theme variables, responsive breakpoints
│   └── components.css    Component-level styles (type cards, tabs, input panels)
├── js/
│   ├── app.js            Entry point — DOMContentLoaded, event wiring
│   ├── api.js            Fetch wrappers: getUnits(), getConversion(), postHistory(), getHistory()
│   ├── conversion.js     Pure JS: conversion, comparison, arithmetic logic
│   ├── ui.js             DOM helpers: populateDropdown(), showResult(), toggleOperators()
│   └── state.js          Module-level state: selectedType, selectedAction, values, units
├── db.json               json-server database: units[], conversions[], history[]
└── package.json          npm scripts to run json-server + dev server
```

---

## Tech Stack

| Layer       | Technology             |
| ----------- | ---------------------- |
| Markup      | HTML5                  |
| Styling     | CSS3 (Flexbox + Grid)  |
| Logic       | JavaScript ES6 Modules |
| HTTP Client | Fetch API (native)     |
| Backend     | json-server (npm)      |
| Storage     | json-server `/history` |

---

## API Endpoints (json-server)

| Resource    | Method | Endpoint                        | Description                      |
| ----------- | ------ | ------------------------------- | -------------------------------- |
| units       | GET    | `/units?type=Length`            | Fetch units filtered by type     |
| conversions | GET    | `/conversions?from=km&to=m`     | Fetch conversion factor/formula  |
| history     | GET    | `/history?_sort=id&_order=desc` | Fetch all history (newest first) |
| history     | POST   | `/history`                      | Save a new calculation           |
| history     | DELETE | `/history/:id`                  | Delete a history entry           |

---

## Features

- **4 Measurement Types** — Length, Weight, Temperature, Volume
- **3 Actions** — Comparison, Conversion, Arithmetic (+, −, ×, ÷)
- **Real-time calculation** with unit dropdowns populated from the API
- **History sidebar** — persisted to json-server, loaded on app start
- **Offline fallback** — bundled unit data used if API is unavailable
- **Auth flow** — Signup / Login with in-memory validation
- **Responsive** — works on mobile, tablet, and desktop

---

## Notes

- Temperature conversions (°C ↔ °F ↔ K) use non-linear formulas handled in `conversion.js`.
- All other conversions use the factor table in `conversion.js → TO_BASE`.
- The auth system is in-memory only (no backend persistence for users). Replace with a real auth service for production.
