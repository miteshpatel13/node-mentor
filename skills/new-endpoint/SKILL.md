---
name: new-endpoint
description: Use whenever the user asks to add, create, implement, or scaffold an HTTP endpoint, route, controller method, or API operation in a NestJS or Express TypeScript service. Follows the conventions the codebase already uses — controller/route, DTO validation, service, per-resource authorization, error handling, OpenAPI docs — adds Jest unit and e2e tests, then reviews the result against Engineering Mentor's API and security standards.
argument-hint: "[METHOD /path — what it does]"
---

# New Endpoint

Build the endpoint the way this codebase already builds endpoints. Consistency with the existing code beats any generic template, including the examples below.

## 1. Pin down the contract

Confirm before writing code: method and path, request body/query/params, response shape and status codes, who may call it (authentication and which resource-ownership rule applies), error cases, and whether it must be idempotent (retries, payments, webhooks). If the request is a new capability with open design questions, run `/engineering-mentor:api-contract-design` first. If anything above is unknown, ask — don't invent it.

## 2. Learn the local conventions

Detect the framework from `package.json`: `@nestjs/core` → NestJS (even though NestJS runs on Express); otherwise `express` → Express. Then read **two existing endpoints similar to the new one** and note:

- **NestJS:** module/controller/service/DTO file layout and naming; whether `ValidationPipe` is global (check `main.ts` for `whitelist`, `forbidNonWhitelisted`, `transform`); DTO style (`class-validator`/`class-transformer`, or zod); guards and custom decorators for auth (`@UseGuards`, `@Roles`, a `@CurrentUser()` decorator); data access (TypeORM repositories, custom repositories, Prisma service); exception style (built-in `HttpException` subclasses vs a project filter); response envelope and pagination; `@nestjs/swagger` decorators if the project uses them.
- **Express:** router file layout; validation middleware in use (zod, joi, celebrate, express-validator); how async errors reach the error middleware (Express 5 handles rejected promises; Express 4 needs a wrapper such as an `asyncHandler` or `express-async-errors`); the error-response shape; auth middleware; how routes are registered on the app.

Mirror what you find. Introduce a new library or pattern only if the user agrees.

## 3. Implement

- **Validate at the boundary.** Every body, query, and path field is validated and typed; unknown fields are rejected or stripped per the project's settings. Parse numbers and dates explicitly.
- **Authorize per resource.** Authentication isn't enough: check that the caller may act on *this* record (ownership, tenant, role). Never take the acting user's id, role, price, or total from the request body; derive them on the server.
- **Keep controllers thin.** Business rules go in the service, which is unit-testable without HTTP.
- **Errors:** use the project's error types and status codes (400 validation, 401/403 auth, 404 missing, 409 conflict); never leak stack traces or SQL errors to the client.
- **Data:** wrap multi-write operations in a transaction; select only needed columns; paginate list endpoints; add or verify indexes for new query patterns.
- **NestJS wiring:** register the controller/provider in its module, and import that module where needed. Check for circular module imports before reaching for `forwardRef`.
- **Docs:** update OpenAPI decorators or spec if the project has them (`/engineering-mentor:swagger-openapi`).

## 4. Test

Follow the existing test layout (`*.spec.ts` beside the source, e2e specs under `test/`).

- **Service unit tests:** with NestJS, build the module with `Test.createTestingModule` and replace repositories or clients with `useValue` mocks. Cover the success path, validation-relevant branches, not-found, forbidden (another user's resource), and conflict cases.
- **HTTP tests:** with supertest, if the project already has them (NestJS e2e with `app.init()`; Express with the exported `app`). Assert status codes and response shape, including 400 on an invalid body and 403 on another user's resource.

Run the related tests: `./node_modules/.bin/jest <spec files>`.

## 5. Review

Run `/engineering-mentor:api-review` on the new endpoint, and `/engineering-mentor:security-review` if it handles auth, money, personal data, or file uploads. Fix blocking findings before calling it done.

## Output

Report the files created and changed, the contract as implemented, the tests added with their result, the review verdict, and any follow-ups (a migration to write, an e2e test that needs infrastructure).
