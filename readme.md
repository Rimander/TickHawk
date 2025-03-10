# 🦅✨ **TickHawk** — *Effortless Ticket & Issue Management*

**TickHawk** is your go-to solution for managing tickets and issues efficiently. Designed for businesses that prioritize organization and collaboration, **TickHawk** empowers teams to resolve tasks swiftly and effectively. 

> **"Stay sharp. Stay organized. Let TickHawk handle the chaos."** 🦅

> [!WARNING]
> **Disclaimer**  
> This project is still in development and **contains bugs** 🐛, as well as several **unfinished features** 🚧.  


---

## 🚀 **Features Implemented**

### 🏢 **Multiple companies**
- Role-based permissions system with admin, agent, and customer roles
- Department organization within companies

### 🎫 **Complete Ticket Lifecycle Management**
- Create, assign, track, and resolve tickets
- Priority levels: Low, Medium, High, Critical
- Status tracking: Open, In Progress, Resolved, Closed, Pending
- Comment system with file attachments
- Event history for all ticket changes

### 📁 **File Management**
- Upload and download file attachments
- Multiple storage provider options:
  - Local file system
  - AWS S3
  - MinIO
  - OVH Object Storage

### 👥 **User Management**
- Comprehensive profile management
- Role assignment
- Company and department association

### 📊 **Reporting**
- View tickets and metrics by date ranges
- Customer and agent reporting views

---

## 🛠️ **Tech Stack**
- **Backend**: NestJS, MongoDB, TypeScript
- **Frontend**: React, Tailwind CSS, TypeScript
- **Containerization**: Docker, Docker Compose
- **Tooling**: Turborepo

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v18+)
- MongoDB
- Docker and Docker Compose (for containerized deployment)

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see API and App README files for details)
4. Start development servers: `npm run start`

### Docker Deployment
1. Simply run: `docker compose up -d`
2. Access the application at http://localhost

---

## 📂 **Project Structure**
- **/api** - NestJS backend application
- **/app** - React frontend application
- **/doc** - Documentation files

---

## 🔐 **Environment Configuration**

See the README files in the `/api` and `/app` directories for detailed environment configuration options.

---

## 🤝 **Contributing**

We welcome contributions! Please feel free to submit a Pull Request.
