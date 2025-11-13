# Smart Property Management System (SPMS)

A full-stack, cloud-ready property management system built with **React.js**, **Node.js**, **Express**, and **MongoDB**.
SPMS enables landlords and tenants to manage leases, payments, and property details with real-time updates and automation.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mandeepkaur2001/smart-property-management-system.git
cd smart-property-management-system
```

### 2. Environment Configuration

Each service (frontend and backend) has its own environment configuration file.
You’ll find an example file named `.env.example` in both folders.

#### To set up your environment files:

```bash
# For the backend
cd backend
cp .env.example .env

# For the frontend
cd ../frontend
cp .env.example .env
```

Then open each `.env` file in your editor and update values as needed, e.g.:

```env
# Backend .env
PORT=4000
MONGO_URI=mongodb://localhost:27017/spms
JWT_SECRET=your_secret_key

# Frontend .env
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Smart Property Management System
```

---

### 3. Install Dependencies

Run these commands to install all required packages:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 4. Run the Application

#### Development Mode

Run both servers locally:

```bash
# In backend/
npm run dev

# In frontend/
npm run dev
```

Frontend will typically run on `http://localhost:3000`
Backend will run on `http://localhost:4000`

#### Production Mode

To build and serve in production:

```bash
# Backend
cd backend
npm start

# Frontend
cd ../frontend
npm run build
npm start
```

---

### Default Features

* User authentication (tenant / landlord)
* Property and lease management
* Mock payment integration
* Dashboard analytics
* Role-based access control
* MongoDB data persistence

