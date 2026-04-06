# Finance Dashboard Backend

Implementation of a Node.js backend for a finance dashboard system with user authentication, role-based access control, financial record management, and analytics APIs.

## Tech Stack
- Framework: Express.js
- Database: SQLite 3
- Authentication: JWT (jsonwebtoken)
- Validation: Zod
- Security: bcryptjs for password hashing

## Features

*User & Role Management*: Multiple roles (viewer, analyst, admin) with role-based access control
*Financial Records*: Create, read, update, delete records with proper validations
*Dashboard Summaries*: Income/expense totals, category breakdowns, date range analysis

## API Endpoints

### View Records (Requires Auth: viewer, analyst, admin)

#### GET `/view/getRecords`

Get records with optional filtering and validation.


#### GET `/view/pageRecords`

Get paginated records with strict validation.

### Analytics (Requires Auth: analyst, admin)

#### GET `/analyze/getSummary`

Get income/expense summary with net balance.

#### GET `/analyze/getCategorySummary`

Get totals grouped by category (sorted by amount descending).
``

#### GET `/analyze/getDateRangeSummary`

Get summary for a specific date range.



### Financial Records Management (Requires Auth: admin only)

#### POST `/admin/record/add`

Create a new financial record.

#### PUT `/admin/record/update/:recordId`

Update an existing record.

#### DELETE `/admin/record/delete/:recordId`

Delete a record.


#### POST `/admin/createAccount`

Create a new user account (admin only).


## Assumptions & Design Decisions
- Token accepted in `Authorization: Bearer <token>` header or custom `token` header

- Only admins can create new user accounts via `/admin/createAccount`. Users cannot self-register.

- Timestamps are used for users and records instead of custom date field

- set up first admin directly from backend y executing the cmd or modifying the middleware permission