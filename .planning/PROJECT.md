# VetOS AI

## What This Is
A scalable SaaS platform for veterinary clinics and petshops with WhatsApp integration and AI-powered assistance. The system centralizes customer communication, appointment scheduling, pet records, and intelligent automation.

## Core Value
Streamline veterinary clinic operations and client communication through centralized records and AI-assisted WhatsApp integration, improving efficiency and customer satisfaction.

## Target Audience
- Veterinary clinics
- Petshops
- Pet owners (Clients)

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] Modular architecture (domain-driven style)
- [ ] Multi-tenant support (clinics isolation)
- [ ] REST API
- [ ] Queue system for async processing
- [ ] Clean separation: controllers, services, modules
- [ ] Auth Module (JWT)
- [ ] Clinics Module (multi-tenant)
- [ ] Clients Module (pet owners)
- [ ] Pets Module
- [ ] Appointments Module
- [ ] WhatsApp Integration Module (webhook + sender)
- [ ] AI Service Module (OpenAI/Gemini)
- [ ] Scalable and Production-ready structure

### Out of Scope
- Native mobile applications (focus is web platform with WhatsApp integration first)

## Architecture & Stack
- **Backend:** Node.js with NestJS
- **Frontend:** React (Vite) with TailwindCSS
- **Database:** PostgreSQL
- **Cache & Queue:** Redis
- **Integrations:** WhatsApp Cloud API, OpenAI/Gemini

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| NestJS for backend | Provides a robust, modular, domain-driven architecture out of the box. | — Pending |
| React + Vite + TailwindCSS | Fast development, modern styling, scalable frontend. | — Pending |
| PostgreSQL + Redis | Relational data for multi-tenancy; Redis for queueing async tasks (WhatsApp sending/AI). | — Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-05 after initialization*
