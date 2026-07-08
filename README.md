# EdTech Skills, Testing, and Talent Platform

This repository is the early service foundation for a learning, testing, proctoring, skills inventory, and talent-management platform. The long-term product direction is a verified skills graph: people learn or are assessed, evidence is captured, skills are validated by tests and reviewers, and organizations use the resulting inventory for hiring, internal mobility, workforce planning, and development.

The current codebase is intentionally small. It implements a Node.js API with authentication, roles, and basic course records. This README separates what exists today from the load-bearing platform ideas that should guide future work.

## Current implementation status

### Implemented today

- User registration and login.
- Password hashing with `bcryptjs`.
- JWT issuance with user id and role claims.
- Role-based route protection for selected endpoints.
- Course creation by `educator` and `admin` users.
- Public course listing.
- PostgreSQL persistence through Sequelize.

### Scaffolded but not implemented

- `frontend/` contains empty React-oriented files and package metadata.
- `infrastructure/` contains empty Terraform files.
- `scripts/start.sh` and `scripts/deploy.sh` are empty.

### Not yet implemented

- Assessments, exams, quizzes, or question banks.
- Proctoring sessions, identity verification, screen/webcam telemetry, or review queues.
- Skills taxonomy, skill claims, proficiency scoring, or evidence records.
- Crowd-sourced endorsements, expert reviews, reputation, or fraud controls.
- Talent profiles, role matching, team dashboards, hiring workflows, or internal mobility workflows.
- Course enrollment, course updates, course deletion, lessons, modules, or certificates.
- Migrations, seed data, automated tests, CI, Docker, deployment automation, or production infrastructure.

## Tech stack

- Runtime: Node.js with CommonJS modules.
- API framework: Express.
- Database: PostgreSQL.
- ORM: Sequelize.
- Authentication: JSON Web Tokens via `jsonwebtoken`.
- Password hashing: `bcryptjs`.
- Configuration: `dotenv`.

## Repository layout

```text
backend/
  config/database.js      Sequelize PostgreSQL connection
  middleware/auth.js      JWT verification and role checks
  models/Course.js        Course Sequelize model
  models/User.js          User Sequelize model and password hashing hook
  routes/auth.js          Registration and login routes
  routes/courses.js       Course creation and listing routes
  server.js               Express app and server startup
frontend/
  package.json            Empty frontend package placeholder
  src/                    Empty frontend app/component/page placeholders
infrastructure/
  *.tf                    Empty Terraform placeholders
scripts/
  deploy.sh               Empty deployment placeholder
  start.sh                Empty start placeholder
package.json              Backend dependencies and npm scripts
```

## Service behavior

### Authentication and authorization

Users have one of three roles:

- `student`
- `educator`
- `admin`

Registration and login return a JWT that includes:

```json
{
  "id": 1,
  "role": "student"
}
```

Protected routes expect the token in the `x-auth-token` header. The auth middleware verifies the token and rejects users whose role is not allowed for a route.

### Data model

#### User

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `username` | string | yes | Unique. |
| `email` | string | yes | Unique. |
| `password` | string | yes | Hashed before create. |
| `role` | enum | yes | `student`, `educator`, or `admin`. |

#### Course

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Course title. |
| `description` | text | yes | Course description. |
| `educatorId` | integer | yes | Set from the authenticated user's JWT id when a course is created. |

## API reference

The server mounts routes under `/api` and listens on port `5000`.

### `POST /api/auth/register`

Create a user and return a JWT.

Request:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "correct-horse-battery-staple",
  "role": "student"
}
```

Response:

```json
{
  "token": "<jwt>"
}
```

Notes:

- `role` must be one of `student`, `educator`, or `admin`.
- Passwords are hashed by the `User` model before insertion.
- There is no input validation beyond Sequelize constraints yet.

### `POST /api/auth/login`

Authenticate a user and return a JWT.

Request:

```json
{
  "email": "alice@example.com",
  "password": "correct-horse-battery-staple"
}
```

Response:

```json
{
  "token": "<jwt>"
}
```

Possible errors:

- `400` with `{"error":"User not found"}`
- `400` with `{"error":"Invalid credentials"}`

### `POST /api/courses`

Create a course. Requires an `educator` or `admin` token.

Headers:

```http
x-auth-token: <jwt>
```

Request:

```json
{
  "title": "Intro to JavaScript",
  "description": "A practical introduction to JavaScript fundamentals."
}
```

Response:

```json
{
  "id": 1,
  "title": "Intro to JavaScript",
  "description": "A practical introduction to JavaScript fundamentals.",
  "educatorId": 1,
  "createdAt": "2026-07-08T00:00:00.000Z",
  "updatedAt": "2026-07-08T00:00:00.000Z"
}
```

Possible errors:

- `401` when no token is supplied.
- `400` when the token is invalid or creation fails.
- `403` when the authenticated role is not allowed.

### `GET /api/courses`

Return all courses.

Response:

```json
[
  {
    "id": 1,
    "title": "Intro to JavaScript",
    "description": "A practical introduction to JavaScript fundamentals.",
    "educatorId": 1,
    "createdAt": "2026-07-08T00:00:00.000Z",
    "updatedAt": "2026-07-08T00:00:00.000Z"
  }
]
```

## Local development

### Prerequisites

- Node.js.
- npm.
- PostgreSQL with a database available to the service.

### Install dependencies

```bash
npm install
```

### Configure environment

The backend reads configuration through `dotenv`:

```text
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=edtech_platform
JWT_SECRET=replace-with-a-long-random-secret
```

Required variables:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

### Start the API

The root `package.json` does not currently define a start script. Run the server directly from the backend directory so local `.env` resolution is predictable:

```bash
cd backend
node server.js
```

The API listens at:

```text
http://localhost:5000
```

### Tests

Automated tests are not implemented yet. The current `npm test` script exits with an error placeholder.

## Operational warnings

This code is prototype-stage and should not be deployed as-is.

- `backend/server.js` runs `sequelize.sync({ force: true })`, which drops and recreates tables every time the server starts.
- User registration currently accepts the requested role from the request body, so a caller can self-register as `admin`.
- JWTs require `JWT_SECRET`; token creation and verification fail without it.
- There are no migrations, backups, seed scripts, or schema versioning.
- API errors may expose raw exception messages.
- There is no rate limiting, input validation, CORS policy, security headers, password reset flow, email verification, refresh tokens, or token revocation.
- `Course.educatorId` is not currently enforced through a Sequelize association or database foreign key.

## Product spec: target platform

The intended service can be understood as five connected systems.

### 1. Assessment engine

Purpose: measure knowledge, applied skill, and job readiness.

Core concepts:

- Question banks with tags, difficulty, skill mappings, and versioning.
- Test forms assembled from blueprints.
- Timed attempts with retake policies.
- Multiple item types: multiple choice, free response, coding, project upload, oral review, and practical simulations.
- Rubrics for human and automated grading.
- Adaptive testing paths based on answer confidence and observed performance.
- Score normalization, cut scores, confidence intervals, and proficiency bands.

Load-bearing requirement: every score must be explainable, reproducible, and tied to specific evidence.

### 2. Proctoring and integrity layer

Purpose: make assessment evidence trustworthy without ignoring privacy, accessibility, or due process.

Core concepts:

- Identity verification before high-stakes attempts.
- Session controls for timed assessments.
- Browser, device, screen, and webcam event capture where legally and ethically allowed.
- Integrity events with severity, timestamps, source, and review state.
- Suspicion scoring as a triage signal, not an automatic verdict.
- Human proctor and reviewer queues.
- Candidate appeal and remediation workflows.
- Audit logs for every integrity decision.

Load-bearing requirement: proctoring decisions must be auditable and contestable.

### 3. Verified skills inventory

Purpose: maintain a living skills graph for individuals, teams, and organizations.

Core concepts:

- Canonical skill taxonomy with aliases and parent/child relationships.
- Skill claims made by users, managers, peers, or imported systems.
- Evidence artifacts such as test scores, reviewed projects, course completions, work samples, credentials, and endorsements.
- Proficiency levels that decay or expire unless refreshed.
- Confidence scores based on evidence quality, recency, reviewer reputation, and assessment reliability.
- Gap analysis against roles, teams, projects, and career paths.

Load-bearing requirement: a skill is not just a label; it is a claim backed by weighted evidence.

### 4. Crowd-sourced validation network

Purpose: use distributed expertise to review, endorse, challenge, and update skill evidence.

Core concepts:

- Expert reviewer profiles and reputation.
- Peer endorsements with relationship context.
- Blind review for project-based assessments.
- Challenge workflows where a skill claim can be tested or disputed.
- Reviewer calibration and quality scoring.
- Fraud, collusion, and brigading detection.
- Incentives for reviewers, mentors, proctors, and subject matter experts.

Load-bearing requirement: crowd signals need reputation weighting and anti-gaming controls before they can influence credentials or hiring decisions.

### 5. Talent management and marketplace

Purpose: turn verified skills into workforce decisions.

Core concepts:

- Talent profiles with skills, evidence, credentials, goals, availability, and consent settings.
- Role profiles with required, preferred, and trainable skills.
- Matching for hiring, internal mobility, teams, projects, gigs, apprenticeships, and mentorship.
- Workforce dashboards for inventory, gaps, risk, succession, and development planning.
- Learning recommendations tied to measured gaps.
- Integrations with LMS, ATS, HRIS, identity providers, calendars, and communication tools.

Load-bearing requirement: users and organizations need explicit controls over consent, visibility, data retention, and downstream use of talent data.

## Murderboard: load-bearing ideas and failure modes

### Ideas that must survive scrutiny

- The product should be a verified skills graph, not only an LMS or quiz app.
- Assessment, proctoring, crowd validation, and talent matching should share a common evidence model.
- Trust should come from evidence quality, audit trails, reviewer reputation, and repeatable scoring.
- Crowd-sourced validation is useful only when reputation and fraud controls are first-class.
- Proctoring must be privacy-aware, accessible, and reviewable; otherwise it becomes a liability.
- Talent workflows must respect consent because skills and assessment data can affect livelihoods.

### Questions to answer early

- Which assessments are low-stakes learning checks versus high-stakes credentials?
- What evidence is strong enough to affect hiring or promotion decisions?
- Who can create skill taxonomies and change skill definitions?
- How are reviewer reputation, conflicts of interest, and reviewer drift measured?
- How does a candidate appeal a proctoring or scoring decision?
- What data can employers see, and what requires user consent?
- How will the system integrate with existing LMS, ATS, HRIS, and identity systems?

### Known failure modes

- Role self-selection creates privilege escalation.
- Proctoring can create privacy, bias, accessibility, and regulatory risks.
- Crowd endorsements can be gamed through collusion or popularity effects.
- AI-generated questions can be low quality, biased, leaked, or misaligned to skill claims.
- Talent matching can encode biased historical hiring patterns.
- Credential trust collapses if scoring, evidence, and review trails are not transparent.
- Enterprise adoption slows if integrations are treated as an afterthought.

## SWOT analysis

### Strengths

- Simple Express and Sequelize foundation is easy to inspect and extend.
- PostgreSQL is a solid fit for users, roles, attempts, evidence, skills, and audit data.
- Role concepts already exist and can evolve into stronger authorization boundaries.
- Course records provide a seed for learning paths, assessments, and credentials.

### Weaknesses

- Current implementation is prototype-level and not production-safe.
- The frontend, infrastructure, scripts, tests, and CI are placeholders.
- There are no assessment, proctoring, skills inventory, crowd validation, or talent-management models yet.
- Auth and role management need hardening before expansion.
- Startup currently destroys data through forced schema sync.

### Opportunities

- Differentiate around verified, evidence-backed skills rather than course completion alone.
- Serve both education and workforce markets: schools, training providers, employers, marketplaces, and professional communities.
- Create reusable assessment and proctoring primitives that can support certifications, hiring screens, apprenticeships, and internal mobility.
- Build a distributed network of expert reviewers, mentors, proctors, and validators.
- Use AI for assessment authoring assistance, anomaly detection, skill inference, rubric support, and role matching, while keeping humans in the loop for high-stakes decisions.

### Threats

- LMS, assessment, HRIS, ATS, and credentialing incumbents already control many distribution channels.
- Privacy and employment regulations can constrain data collection and automated decision-making.
- Proctoring products face user distrust when they are opaque or invasive.
- Skills taxonomies can become stale unless maintained with real labor-market signals.
- Fraud and credential gaming become more attractive as credentials gain value.

## Suggested roadmap

### Foundation hardening

- Replace `sequelize.sync({ force: true })` with migrations.
- Add centralized configuration validation.
- Move secrets out of the repository and document safe `.env` handling.
- Add request validation for all inputs.
- Prevent public self-assignment of privileged roles.
- Add tests for auth, authorization, and course APIs.
- Add health checks, structured logging, and error handling.

### Learning and assessment core

- Add course ownership, enrollment, modules, and lessons.
- Add assessment, question, attempt, response, score, and rubric models.
- Add attempt lifecycle endpoints.
- Add grading workflows and score reports.
- Add certificate or credential records backed by evidence.

### Integrity and proctoring

- Add proctoring session records.
- Add identity verification state.
- Add integrity event capture and review queues.
- Add audit logs and appeal workflows.

### Skills graph and crowd validation

- Add skill taxonomy and skill claim models.
- Link courses, assessments, scores, reviews, and artifacts to skills.
- Add peer endorsement and expert review flows.
- Add reviewer reputation and anti-fraud controls.

### Talent management

- Add talent profiles and organization/team models.
- Add role profiles and skill gap analysis.
- Add matching APIs for roles, projects, learning paths, and mentors.
- Add consent, visibility, retention, and export controls.

## Contributing

Contributions should keep implementation and product claims aligned. When adding a feature, update this README with:

- The user-facing capability.
- The API or data model contract.
- Required environment variables or operational steps.
- Security, privacy, and integrity considerations.
- Tests or manual verification steps.
