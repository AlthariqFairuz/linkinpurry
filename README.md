# LinkInPurry

LinkInPurry is a professional social networking platform agents. It enables secure communication, information sharing, and networking between agents through features like connection management, real-time chat, and news feed updates.

## Features

### Authentication and Authorization
- Secure JWT-based authentication with 1-hour session duration
- Protected routes and API endpoints
- Username and email validation
- Password encryption using bcrypt

### User Profiles
- Customizable profile information including name, work history, and skills
- Profile photo upload functionality
- Different visibility levels based on connection status
- Connection count tracking

### Connection Management
- Send and receive connection requests
- Accept or decline incoming requests
- View connected users
- Disconnect from existing connections
- Search functionality for finding other users

### Feed System
- Create, read, update, and delete posts
- Maximum 280 characters per post
- Infinite scroll with cursor-based pagination
- Posts visible only from connected users and self

### Real-time Chat
- Private messaging between connected users
- Real-time message delivery using WebSocket
- Chat history preservation
- Typing indicators
- Unread message counters

### Push Notifications
- Real-time notifications for new messages
- New post notifications for connections
- Service Worker implementation for background notification handling
- Notification click handling and navigation

### Technical Features
- Redis caching for improved performance
- Responsive design for various screen sizes
- Docker containerization
- Stress testing and load testing capabilities

## Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Service Workers for push notifications

### Backend
- Node.js
- Hono (Web Framework)
- Prisma (ORM)
- PostgreSQL
- Redis
- Socket.IO
- JWT for authentication

### Development & Deployment
- Docker & Docker Compose
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd linkinpurry
```

2. Create .env files:

Backend (change .env.example to .env):
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=123
POSTGRES_DB=linkinpurry
POSTGRES_HOST=postgres
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}
REDIS_URL=redis://redis:6379
JWT_SECRET=kocakgeming123 
CLOUDINARY_CLOUD_NAME= your_api_key
CLOUDINARY_API_KEY= your_api_key
CLOUDINARY_API_SECRET= your_api_key
VAPID_PUBLIC= your_api_key
VAPID_PRIVATE= your_api_key
```

Root (.env):
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=123
POSTGRES_DB=linkinpurry
POSTGRES_HOST=postgres
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}
REDIS_URL=redis://redis:6379
JWT_SECRET=kocakgeming123 
```

3. Install dependencies:

### Running with Docker

1. Start the application:
```bash
docker compose up --build
```

### Running Locally 

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

## API Documentation

The API documentation is available through Swagger UI when running the backend server. Access it at:
```
http://localhost:3000/swagger
```


## Troubleshooting

### Common Issues

1. Database Connection:
   - Ensure PostgreSQL is running and accessible
   - Verify DATABASE_URL in .env is correct
   - Check if Prisma migrations are up to date

2. WebSocket Connection:
   - Verify CORS settings in backend
   - Check if frontend is using correct WebSocket URL
   - Ensure cookies are being properly sent with requests

3. Push Notifications:
   - Verify VAPID keys are properly configured
   - Check if Service Worker is registered successfully
   - Ensure browser supports Push API

## Contributors
### Client-side:
- Login and Register : 13522027
- Feed : 13522027
- Home : 13522027
- Profil : 13522027
- Chat and Websocket : 13522027
- Connections : 13522002, 13522027
- Push Notifications : 13522044
- 
### Server-side:
- Login and Register : 13522027
- Feed : 13522027, 13522044
- Home : 13522027
- Profil : 13522027
- Chat and Websocket : 13522027
- Connections : 13522002, 13522027
- Push Notifications : 13522044
