"# the-commons" 
# The Commons 

## 📖 Project Title & Description

**The Commons** is a full-stack web application that enables neighbors to lend and borrow tools, equipment, and household items within their community. By facilitating resource sharing, The Commons builds trust, reduces waste, and strengthens neighborhood connections.

### Key Features
- 🔐 **User Authentication** - Secure registration/login with JWT & bcrypt
- 📦 **Item Management** - List, edit, and manage items with categories & conditions
- 📅 **Reservation System** - Request items with date ranges & approval workflow
- 🛡️ **Admin Dashboard** - Manage users Items, categories, and reservations
- 🔍 **Search & Filter** - Find items by category, condition, availability

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework & REST API |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication & session management |
| **bcryptjs** | Password hashing |
| **Morgan** | Request logging |
| **Helmet** | Security headers |
| **Express Rate Limit** | API rate limiting |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **React Router** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **React Hot Toast** | Toast notifications |
| **CSS3** | Custom styling with dark mode |

### Development Tools
| Technology | Purpose |
|------------|---------|
| **Nodemon** | Auto-restart during development |
| **EJS** | Admin panel templating |



---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** 
- **PostgreSQL** 
- **Git** 

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/mihreteab-desta/the-commons.git
cd the-commons
```

#### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root
cd ..
```

<<<<<<< HEAD
=======


>>>>>>> 6b1222bb67ccb74013e9d48305b688e3a3b7d503

#### 4. Set Up Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE the_commons;"

# Initialize tables
cd backend
npm run db:init

# Seed with sample data
npm run db:seed
```

#### 5. Start the Application

**Development Mode (Both servers):**
```bash
# From the root directory
npm run dev
```

**Or start servers separately:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

#### 6. Access the Application

- **Main App:** http://localhost:3000
- **Admin Panel:** http://localhost:5000/admin
- **API Health Check:** http://localhost:5000/api/health

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin_yohannes` | `admin123` |
| Resident | `sara_tadesse` | `password123` |
| Resident | `mike_abebe` | `password123` |

---

## 📁 Project Structure

```
the-commons/
├── backend/
│   ├── app.js                    # Main server entry
│   ├── package.json
│   ├── .env                      # Backend environment variables
│   ├── config/
│   │   ├── database.js           # PostgreSQL connection
│   │   ├── session.js            # Express session config
│   │   └── jwt.js                # JWT config & helpers
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Item.js
│   │   ├── Reservation.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── api/                  # REST API endpoints
│   │   │   ├── auth.js
│   │   │   ├── items.js
│   │   │   ├── reservations.js
│   │   │   ├── users.js
│   │   │   └── admin.js
│   │   ├── auth.js               # Admin login (EJS)
│   │   ├── admin.js              # Admin panel routes
│   │   └── index.js
│   ├── middleware/
│   │   ├── auth.js               # JWT & session auth
│   │   ├── flash.js              # Flash messages
│   │   └── validation.js         # Input validation
│   ├── db/
│   │   ├── init.js               # Database setup
│   │   └── seed.js               # Sample data
│   └── views/                    # EJS admin views
│       ├── admin/
│       ├── auth/
│       └── partials/
│
├── client/                       # React frontend
│   ├── src/
│   │   ├── index.js
│   │   ├── App.jsx
│   │   ├── styles/
│   │   │   └── App.css           # Complete styling
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Items.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ItemCard.jsx
│   │   │   └── layout/
│   │   │       └── Layout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # JWT auth state
│   │   └── services/
│   │       └── api.js            # Axios API client
│   └── package.json
│
├── package.json                   # Root scripts
├── .gitignore
└── README.md
```


## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items with filters |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item (auth required) |
| PUT | `/api/items/:id` | Update item (auth required) |
| DELETE | `/api/items/:id` | Delete item (auth required) |
| PATCH | `/api/items/:id/toggle` | Toggle availability |

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations/my` | Get user's reservations |
| POST | `/api/reservations` | Create reservation |
| PATCH | `/api/reservations/:id/approve` | Approve request |
| PATCH | `/api/reservations/:id/reject` | Reject request |
| PATCH | `/api/reservations/:id/activate` | Mark as picked up |
| PATCH | `/api/reservations/:id/return` | Confirm return |
| PATCH | `/api/reservations/:id/cancel` | Cancel request |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update user profile |
| GET | `/api/users/:id` | Get user by ID |

---

<<<<<<< HEAD

=======
>>>>>>> 6b1222bb67ccb74013e9d48305b688e3a3b7d503
