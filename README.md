Finance Tracker is a full-stack web application designed to help users manage personal finances through structured expense tracking, savings monitoring, and budget analysis.

The system follows a production-oriented architecture using a decoupled frontend and backend connected via RESTful APIs.

Live Demo

https://finance-frontend-8dfd.onrender.com/

Project Overview

Finance Tracker allows users to:

Register and securely log in (in progress)

Track income and expenses

Monitor savings patterns

Analyze spending behavior

Manage financial data securely

The application demonstrates secure authentication, persistent data storage, and scalable API design.

System Architecture

React Frontend
→ REST API (Node.js / Express)
→ Authentication Middleware (JWT)
→ MongoDB Database
→ Structured JSON Responses

The frontend and backend are separated to allow independent scaling and deployment.

Core Features

User registration and login with JWT-based authentication

Protected routes using authentication middleware

Expense and income tracking

Persistent financial data storage

RESTful API design

Environment-based configuration for secure deployment

Cloud deployment via Render

Technology Stack
Frontend

React.js

Axios (API communication)

Component-based UI architecture

Backend

Node.js

Express.js

JWT Authentication

RESTful API design

Middleware-based request validation

Database

MongoDB

Structured schema for financial records

Deployment

Render (Cloud Hosting)

Environment variable configuration (.env)

API Structure (Example Endpoints)

POST /api/auth/register
POST /api/auth/login

GET /api/transactions
POST /api/transactions
PUT /api/transactions/:id
DELETE /api/transactions/:id

All protected routes require valid JWT token.

Engineering Design Decisions

JWT authentication for stateless session management

Middleware-based route protection

Modular backend structure for scalability

Separation of concerns between frontend and backend

Environment-based secrets for security

Security Considerations

Password hashing before storage

Token-based authentication

Environment variables for secret management

Protected API endpoints

Future Enhancements

Budget goal tracking

Data visualization dashboards (charts)

Category-based expense analytics

Role-based access control

Docker containerization

Why This Project Matters

Finance Tracker demonstrates:

Full-stack development capability

Secure authentication implementation

REST API design and middleware architecture

Database integration

Cloud deployment readiness
