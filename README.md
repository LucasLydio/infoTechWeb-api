# Info Tech Web API

<p align="center">
	<img src="https://img.shields.io/badge/Node.js-18.x-green?logo=node.js" alt="Node.js" />
	<img src="https://img.shields.io/badge/Express.js-4.x-blue?logo=express" alt="Express.js" />
	<img src="https://img.shields.io/badge/Prisma-ORM-purple?logo=prisma" alt="Prisma ORM" />
	<img src="https://img.shields.io/badge/Redis-Cache-red?logo=redis" alt="Redis" />
	<img src="https://img.shields.io/badge/JWT-Auth-yellow?logo=jsonwebtokens" alt="JWT" />
</p>

## Overview

Info Tech Web API is a RESTful backend for a modern forum platform. It provides endpoints for user authentication, topics, messages, news, replies, and more. Built with Node.js, Express, Prisma ORM, and Redis for caching and session management.

---

## Technologies Used

- <b>Node.js</b> (18+)
- <b>Express.js</b>
- <b>Prisma ORM</b> (with PostgreSQL/MySQL/SQLite)
- <b>Redis</b> (caching, session, rate limiting)
- <b>JWT</b> (authentication)
- <b>dotenv</b> (environment variables)
- <b>Custom middlewares</b> (auth, error handling)

---

## Getting Started

1. Clone the repository:
	 ```bash
	 git clone https://github.com/your-username/info-tech-web-api.git
	 cd info-tech-web-api
	 ```
2. Install dependencies:
	 ```bash
	 npm install
	 ```
3. Copy `.env.example` to `.env` and configure your environment variables.
4. Start the server:
	 ```bash
	 npm start
	 ```

---

## Main Endpoints

### Authentication

#### Register
`POST /api/users/register`

Request body:
```json
{
	"username": "string",
	"email": "string",
	"password": "string"
}
```
Response:
```json
{
	"user": {
		"id": 1,
		"username": "string",
		"email": "string"
	},
	"token": "jwt-token"
}
```

#### Login
`POST /api/users/login`

Request body:
```json
{
	"email": "string",
	"password": "string"
}
```
Response:
```json
{
	"user": {
		"id": 1,
		"username": "string",
		"email": "string"
	},
	"token": "jwt-token"
}
```

### Topics

#### Get All Topics
`GET /api/topics`

Response:
```json
[
	{
		"id": 1,
		"title": "First Topic",
		"content": "...",
		"authorId": 1,
		"createdAt": "2026-01-27T12:00:00Z"
	}
]
```

#### Create Topic
`POST /api/topics`

Request body:
```json
{
	"title": "string",
	"content": "string"
}
```
Response:
```json
{
	"id": 2,
	"title": "string",
	"content": "string",
	"authorId": 1,
	"createdAt": "2026-01-27T12:00:00Z"
}
```

### Messages

#### Get Inbox
`GET /api/messages/inbox`

Response:
```json
[
	{
		"id": 1,
		"fromUserId": 2,
		"toUserId": 1,
		"content": "Hello!",
		"createdAt": "2026-01-27T12:00:00Z"
	}
]
```

#### Send Message
`POST /api/messages/send`

Request body:
```json
{
	"toUserId": 2,
	"content": "string"
}
```
Response:
```json
{
	"id": 2,
	"fromUserId": 1,
	"toUserId": 2,
	"content": "string",
	"createdAt": "2026-01-27T12:00:00Z"
}
```

### News

#### Get News
`GET /api/news`

Response:
```json
[
	{
		"id": 1,
		"title": "Update",
		"content": "...",
		"createdAt": "2026-01-27T12:00:00Z"
	}
]
```

---

## Redis Integration

This API uses <b>Redis</b> for caching, session management, and rate limiting. Make sure you have a Redis server running and configure the connection in your `.env` file.

---

## License

MIT License
