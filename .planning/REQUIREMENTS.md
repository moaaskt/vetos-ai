# VetOS AI - Requirements

## Overview
A scalable SaaS platform for veterinary clinics and petshops with WhatsApp integration and AI-powered assistance.

## Functional Requirements
1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Veterinarian, Receptionist, Client)
2. **Multi-Tenancy**
   - Data isolation by clinic/petshop.
3. **Clients Management**
   - CRUD operations for pet owners (name, contact, address).
4. **Pets Management**
   - CRUD operations for pets (name, species, breed, age, medical history).
5. **Appointments**
   - Scheduling, rescheduling, and canceling appointments.
   - Calendar views.
6. **WhatsApp Integration**
   - Webhook to receive incoming messages.
   - Sender to dispatch notifications (reminders, results).
7. **AI Assistant**
   - Analyze incoming WhatsApp messages to automate appointment booking.
   - Draft responses to client questions based on clinic context.

## Non-Functional Requirements
1. **Architecture:** Modular, Domain-Driven Design (DDD) style in NestJS.
2. **Performance:** Redis caching and background job processing (queues) for WhatsApp and AI tasks.
3. **Security:** JWT authentication, data validation, parameterized queries (via Prisma or TypeORM).
4. **Scalability:** Stateless API, ready to be scaled horizontally.

## Constraints
- **Backend:** Node.js with NestJS
- **Frontend:** React (Vite) with TailwindCSS
- **Database:** PostgreSQL
- **Cache/Queue:** Redis
- **Integrations:** WhatsApp Cloud API, OpenAI/Gemini
