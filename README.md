# GarageX — Vehicle Management Dashboard

GarageX is a lightweight full-stack vehicle management dashboard built with Node.js, Express and SQLite.  
The application runs locally without external services and demonstrates a clean CRUD workflow, API routing, and a responsive frontend dashboard UI.

---

## Features

Backend (Node.js + Express + SQLite)

- SQLite database initialized automatically
- REST API with CRUD operations for vehicles
- Filtering and search endpoints
- Sorting by price, year, mileage and date
- Structured routing (`routes/`)
- Centralized DB connection and schema

Frontend

- Responsive dashboard layout
- Table view with mobile-friendly formatting
- Search and filter interface
- Statistics overview (totals, status groups, averages)
- Modal forms for add / edit actions
- Vanilla JavaScript (no frameworks)

Data model includes:

- make, model, year  
- price, mileage  
- fuel type, transmission  
- status (available / reserved / sold)  
- created date  

---

## Project Structure

```
/ 
├─ public/
│  ├─ index.html
│  ├─ style.css
│  └─ script.js
├─ sql/
│  └─ schema.sql
├─ src/
│  ├─ routes/
│  │  └─ cars.js
│  ├─ app.js
│  └─ db.js
├─ package.json
├─ package-lock.json
└─ README.md
```

---

## Run Locally

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node src/app.js
```

Open in browser:

```
http://localhost:3000
```

SQLite database and demo data are created automatically on first run.
