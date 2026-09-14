# Policy Management API

Node.js REST API built for the technical assessment. It ingests insurance policy data from XLSX/CSV into MongoDB, exposes search and aggregation APIs, monitors server CPU usage, and supports delayed message insertion using BullMQ + Redis.

---

## Assessment Coverage

### Task 1
| Requirement | Implementation |
|---|---|
| Upload XLSX/CSV into MongoDB using Worker Threads | `POST /upload/excel` |
| Search policy info by username | `POST /user/search` |
| Aggregated policies by each user | `GET /user/policies/get` |
| Separate collections for Agent, User, Account, LOB, Carrier, Policy | Yes |

### Task 2
| Requirement | Implementation |
|---|---|
| Track CPU usage and restart server when usage stays above 70% | Background monitor + nodemon restart |
| Schedule a message insert at a given day and time | `POST /schedule/message` via BullMQ + Redis |

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (native driver via `helper/mongo.js`)
- **File parsing:** `xlsx`
- **Background jobs:** BullMQ + Redis (Docker)
- **CPU monitoring:** Node `os` module
- **Process manager (dev):** Nodemon

---

## Project Structure

```text
PolicyManagementAPI/
├── api.js                 # App bootstrap & server listen
├── route.js               # Root route mounting
├── config/
│   ├── mongo.js           # MongoDB connection
│   └── redis.js           # Redis connection options
├── helper/
│   ├── mongo.js           # Shared DB helpers (create, getMany, aggregate, etc.)
│   ├── response.js        # Standard API response helpers
│   ├── logger.js          # Request logging middleware
│   └── cpuMonitor.js      # CPU usage tracking & restart trigger
├── upload/                # Excel/CSV upload + Worker Thread processing
├── user/                  # User search APIs
├── policy/                # Policy fetch & merge logic
├── agent/                 # Agent collection model/controller
├── account/               # Account collection model/controller
├── lob/                   # LOB (category) collection model/controller
├── carrier/               # Carrier (company) collection model/controller
├── schedule/              # BullMQ schedule + job list APIs
├── cpu/                   # CPU usage API
├── assets/                # Uploaded Excel/CSV files stored here
└── docker-compose.yml     # Redis container
```

Architecture follows a middleware-chain pattern:
`route → controller middlewares → model → helper/mongo.js → response.js`

Related data for policy responses (LOB, Agent, Carrier, Account) is loaded in separate middlewares and merged using in-memory HashMaps (plain objects), instead of MongoDB `$lookup`.

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas / MongoDB instance
- Docker (for Redis)
- npm

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create / update `.env`:

> Mongo connection uses Atlas-style URI built in `config/mongo.js`. Adjust that file if your cluster URI differs.

### 3. Start Redis

```bash
docker compose up -d
```

This starts Redis on port `6379`.

### 4. Run the server

```bash
# development (auto-restart on file change / CPU restart trigger)
npm run dev

# production-style
npm start
```

Server default: `http://localhost:8060`

---

## MongoDB Collections

| Collection | Fields / Purpose |
|---|---|
| `Agent` | `agentName` |
| `User` | `firstName`, `dob`, `address`, `phone`, `state`, `zip`, `email`, `gender`, `userType` |
| `Account` | `accountName` |
| `LOB` | `categoryName` |
| `Carrier` | `companyName` |
| `Policy` | `policyNumber`, `policyStartDate`, `policyEndDate`, `categoryId`, `companyId`, `userId`, `agentId`, `accountId` |
| `ScheduledMessage` | Scheduled messages inserted by BullMQ worker |

---

## API Reference

Base URL: `http://localhost:8060`

All responses use the shared `helper/response.js` format:

```json
{
  "status": 200,
  "message": "...",
  "data": {}
}
```

### 1. Upload Excel / CSV

**`POST /upload/excel`**

- Content-Type: `multipart/form-data`
- Form field: `file` (`.xlsx`, `.xls`, or `.csv`)
- File is saved under `assets/`
- Parsing & DB insert run in a **Worker Thread**
- Duplicate agents/users/accounts/categories/carriers/policies are skipped

### 2. Search policy by username

**`POST /user/search`**

```json
{
  "name": "Lura Lucca"
}
```

Returns matched users with their policies. Each policy includes nested:

- `category`
- `company`
- `agent`
- `account`

### 3. Aggregated policies by user

**`GET /user/policies/get`**

Returns policies grouped by user (`totalPolicies`, user summary, policies list).  
Each policy in the list includes the same nested `category`, `company`, `agent`, and `account` objects.

### 4. Schedule message insert

**`POST /schedule/message`**

```json
{
  "message": "follow up with client",
  "day": "2026-09-15",
  "time": "14:30"
}
```

- `day`: `YYYY-MM-DD`
- `time`: `HH:mm`
- Must be a future datetime
- Job is queued in BullMQ with delay and inserted into `ScheduledMessage` at the scheduled time
- `runAt` in response is returned in **IST** (`+05:30`)

### 5. List BullMQ jobs

**`GET /schedule/jobs`**

Returns job counts and job list across `waiting`, `delayed`, `active`, `completed`, and `failed`.  
Scheduled inserts typically appear under `delayed` until execution time.

### 6. Get CPU usage

**`GET /cpu/usage/get`**

Returns current CPU usage percentage.

---

## CPU Monitoring & Restart Behavior

- CPU usage is sampled periodically in the background.
- A temporary spike above 70% does **not** restart immediately.
- Restart is triggered only if CPU stays at/above `CPU_LIMIT` (default `70`) for `CPU_HOLD_SECONDS` (default `45` seconds).
- Restart is performed by updating `restart.json`, which nodemon watches and uses to reload the process cleanly (avoids treating it as an app crash).

Use `npm run dev` so nodemon can bring the process back up after a high-CPU restart.

---

## Notes for Reviewers

1. All DB operations go through `helper/mongo.js` (`create`, `createMany`, `getMany`, `aggregate`, etc.).
2. Upload processing is isolated in Worker Threads to keep the main event loop free.
3. Policy enrichment avoids `$lookup` and uses middleware + HashMap merge for LOB / Agent / Carrier / Account.
4. Redis is required for schedule APIs. If Redis is down, schedule endpoints return a clear error.
5. Uploaded sheets are persisted in the project `assets` directory.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `docker compose up -d` | Start Redis |

---

## License

ISC
