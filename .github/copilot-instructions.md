**Repository Overview**
- **Framework:** Next.js (App Router) — entry UI under `src/app` and server API routes under `src/app/api`.
- **DB / ORM:** Prisma with PostgreSQL (see `prisma/schema.prisma`).
- **Auth:** JWT-based auth; token cookie named `token` is set by `src/app/api/auth/login/route.ts` and validated in `src/middleware.ts`.

**Key Patterns & Files**
- **Server / API:** Route handlers use the App Router `route.ts` files and return `NextResponse.json(...)`. Example: [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts#L1-L80).
- **DB access:** Use the singleton Prisma client in [src/lib/prisma.ts](src/lib/prisma.ts#L1-L40). Always import `prisma` from `@/lib/prisma`.
- **Auth helpers:** `src/lib/auth.ts` exposes `generateToken`, `verifyToken`, and `getTokenFromHeader` — JWT secret from `process.env.JWT_SECRET`.
- **Middleware:** Route protection and cookie verification live in [src/middleware.ts](src/middleware.ts#L1-L140); it reads cookie `token` or `Authorization` header and uses `jose`'s `jwtVerify`.
- **Client auth state:** Client-side persisted auth store uses `zustand` in [src/lib/store/authStore.ts](src/lib/store/authStore.ts#L1-L120) (storage key `auth-storage`).
- **Validation & errors:** Input validated with `zod` in API routes; handlers return localized error messages via `NextResponse.json` with appropriate status codes.

**Developer Workflows (commands)**
- Start dev server: `npm run dev` (runs `next dev`).
- Build: `npm run build` then `npm run start` to serve production build.
- Lint: `npm run lint` (runs `eslint`).
- Prisma dev flow (not in scripts):
  - Generate client: `npx prisma generate`
  - Apply migrations / development DB: `npx prisma migrate dev --name init` (ensure `DATABASE_URL` set).

**Project-specific conventions**
- Path alias: `@/*` maps to `src/*` (see `tsconfig.json`) — prefer imports like `@/lib/prisma`.
- Cookie name for auth: `token` (middleware and login route both rely on this).
- Token libraries: server routes create JWTs with `jsonwebtoken` (`src/app/api/auth/login/route.ts`), while middleware verifies with `jose` — be aware of both being used.
- Prisma model names are mapped to snake_case database tables/columns (see `@@map` and `@map` in `prisma/schema.prisma`).
- UI uses Tailwind + utility helpers: `cn` helper in [src/lib/utils.ts](src/lib/utils.ts#L1-L40) (uses `clsx` + `tailwind-merge`).

**Integration points / external dependencies**
- Environment variables required: `DATABASE_URL`, `JWT_SECRET` (fallback defaults exist in code, but set these for production).
- Third-party libs: `prisma`, `jose`, `jsonwebtoken`, `bcryptjs`, `zod`, `recharts`, `zustand`, `react-query`, `tailwindcss`.

**How to make safe changes**
- When editing schema: run `npx prisma generate` and apply migrations. Update any raw SQL column names if you change `@map`/`@@map`.
- Follow existing API patterns: validate with `zod`, interact via `prisma`, return `NextResponse.json({ ... }, { status })`, and set cookies using `response.cookies.set(...)` when needed.

**Quick examples (copy-paste)**
- Get token in middleware: `const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')`
- Set cookie in a login response: `response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*7, path: '/' })`

**Notes for AI agents**
- Prefer minimal, focused edits. Preserve existing validation/localization patterns (Thai message strings are used in APIs).
- If touching auth flows, check `src/middleware.ts`, `src/lib/auth.ts`, and `src/app/api/auth/*` together to avoid mismatches (e.g., token format or cookie name).
- `src/hooks/useAuth.ts` is currently empty — you may propose implementing it but avoid changing global auth persistence shape (`useAuthStore`) without coordination.

If anything is unclear or you'd like the agent to implement small follow-ups (e.g., implement `useAuth.ts` or unify JWT library usage), tell me which and I'll prepare a focused patch.
