# Nexus AI (hr-nexus-ai)

An Agentic AI HR Management System. The aim is to give HR teams one place to manage employees, recruitment, leave, training, performance and reporting, with AI agents handling routine HR work under human oversight.

> **Status:** early scaffold. The frontend shell and navigation exist; most pages are placeholders and there is no backend or AI layer yet.

## Tech stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Other scripts (run from `frontend/`):

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the dev server          |
| `npm run build`   | Type-check and build          |
| `npm run lint`    | Run ESLint                    |
| `npm run preview` | Preview the production build  |

## Project structure

```
frontend/
  src/
    components/   Shared UI (Sidebar)
    layouts/      Page layouts (MainLayout)
    pages/        Dashboard, Employees, Recruitment, Leave,
                  Training, Performance, Reports, Login
    routes/       Route definitions (AppRoutes)
```

## Roadmap

- [ ] Repo cleanup (remove committed `node_modules`)
- [ ] Routes for all sidebar pages
- [ ] Dashboard and Employees pages with mock data
- [ ] Login flow and protected routes
- [ ] Backend API and database
- [ ] AI agents (CV screening, leave approvals, onboarding Q&A, reporting) with human-in-the-loop approval and audit logging
