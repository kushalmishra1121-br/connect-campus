# 🎓 Campus Connect - Student Issue Reporting System

A modern, full-stack web application for students to report and track campus issues. Built with React, Node.js, Express, and PostgreSQL.

![Demo Mode](https://img.shields.io/badge/Demo-Available-brightgreen)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql)

## ✨ Features

### For Students
- 📝 **Report Issues** - Submit campus issues with title, description, location, and images
- 📊 **Track Progress** - Monitor issue status from submission to resolution
- 🔔 **Real-time Notifications** - Get instant updates when issues are updated
- 👤 **Profile Management** - Update profile information and avatar

### For Administrators
- 📋 **Issue Management** - View, filter, and manage all reported issues
- ✅ **Status Updates** - Update issue status (Submitted → In Review → In Progress → Resolved)
- 📈 **Analytics Dashboard** - View statistics and trends
- 👥 **User Management** - Manage student accounts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express 5, Socket.io |
| **Database** | PostgreSQL with Prisma ORM |
| **File Storage** | Cloudinary |
| **Email** | Resend API |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kushalmishra1121-br/connect-campus.git
   cd connect-campus
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/stitch_db"
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   RESEND_API_KEY=your_resend_key
   ```

4. **Setup database**
   ```bash
   cd server
   npx prisma db push
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎮 Demo Mode

The app includes a **Demo Mode** for quick testing:
- Click **"Enter as Student"** or **"Enter as Admin"** on the login page
- No credentials required!
- Full functionality available for testing

## 📁 Project Structure

```
connect-campus/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── services/      # API & Socket services
│   └── package.json
│
├── server/                 # Express Backend
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth & validation
│   ├── routes/            # API routes
│   ├── prisma/            # Database schema
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | Get user's issues |
| POST | `/api/issues` | Create new issue |
| GET | `/api/issues/:id` | Get issue details |
| PATCH | `/api/admin/issues/:id/status` | Update issue status (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |

## 🎨 Screenshots

### Student Dashboard
- View submitted issues
- Track issue status
- Real-time notifications

### Admin Dashboard  
- Manage all issues
- Filter by status
- Update issue progress

## 👤 Author

**Kushal Mishra**
- GitHub: [@kushalmishra1121-br](https://github.com/kushalmishra1121-br)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

⭐ Star this repo if you found it helpful!
