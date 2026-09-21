# 🌿 Darukaa.Earth

A full-stack geospatial platform for managing environmental projects, geographical sites, and carbon & biodiversity performance data.

## 📌 Overview

Darukaa.Earth is a geospatial environmental project management platform.

The application allows an administrator to:

- Create and manage environmental projects
- Define geographical monitoring sites directly on an interactive map
- Draw polygon boundaries for sites using Mapbox
- Store site geometries using PostgreSQL + PostGIS
- View project-specific sites on the map
- Select a site to view its details
- Visualize carbon and biodiversity performance over time
- Authenticate securely using JWT-based authentication

The core workflow is:

**Project → Geographical Site → Spatial Data → Environmental Analytics**

---

## 🎯 Problem Statement

Environmental projects often contain both geographical information and performance data.

For example, a forest conservation project may contain multiple geographical areas that need to be monitored separately. Managing project information, geographical boundaries, and environmental metrics across different tools can make monitoring difficult.

Darukaa.Earth brings these components together into a single dashboard.

---

## 🚀 Key Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Protected project and site operations
- Logout functionality

### 📁 Project Management

- Create environmental projects
- View projects belonging to the authenticated user
- Switch between multiple projects
- Associate geographical sites with specific projects

### 🗺️ Interactive Geospatial Map

- Mapbox GL JS integration
- Interactive map navigation
- Polygon drawing using Mapbox Draw
- Geographical site creation
- Site boundaries stored as PostGIS polygons
- Project-specific site visualization

### 📍 Site Management

Each site contains:

- Site name
- Description
- Project association
- Geographical polygon
- Site ID

Clicking a site on the map opens its detailed information.

### 📊 Environmental Analytics

Each site can contain time-series environmental data such as:

- Carbon value
- Biodiversity score
- Measurement date

The data is visualized using interactive Chart.js line charts.

> **Note:** The current MVP uses synthetic/sample analytics data to demonstrate the analytics workflow. It does not represent real environmental measurements.

---

# 🏗️ System Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│ Login / Dashboard            │
│ Project Management           │
│ Mapbox Map                   │
│ Site Visualization           │
│ Chart.js Analytics           │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│                              │
│ Authentication               │
│ Project APIs                 │
│ Site APIs                    │
│ Analytics APIs               │
│ JWT Authorization            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    PostgreSQL + PostGIS      │
│                              │
│ Users                        │
│ Projects                     │
│ Sites                        │
│ Analytics                    │
│                              │
│ Spatial Polygon Geometry     │
└──────────────────────────────┘