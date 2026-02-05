# Info Tech Web API

<p align="center">
	<img src="https://img.shields.io/badge/Node.js-18.x-green?logo=node.js" alt="Node.js" />
	<img src="https://img.shields.io/badge/Express.js-4.x-blue?logo=express" alt="Express.js" />
	<img src="https://img.shields.io/badge/Prisma-ORM-purple?logo=prisma" alt="Prisma ORM" />
	<img src="https://img.shields.io/badge/Redis-Cache-red?logo=redis" alt="Redis" />
	<img src="https://img.shields.io/badge/JWT-Auth-yellow?logo=jsonwebtokens" alt="JWT" />
</p>

## Overview

Info Tech Web API is a RESTful backend for a modern forum platform. It provides endpoints for user authentication, topics, news, replies, and private messages. Built with Node.js, Express, Prisma ORM, PostgreSQL, and Redis for caching.

---

## Technologies Used

- **Node.js** (18+)
- **Express.js**
- **Prisma ORM** (PostgreSQL)
- **Redis** (caching)
- **JWT** (authentication)
- **dotenv** (environment variables)
- **Custom middlewares** (auth, validation, error handling)

---

## Getting Started

1. Clone the repository:
	```bash
	git clone https://github.com/LucasLydio/infoTechWeb-api.git
	cd infoTechWeb-api
	```

2. Install dependencies:
	```bash
	npm install
	```

3. Copy `.env.example` to `.env` and configure environment variables.

4. Start the server:
	```bash
	npm start
	```

---

## Response Standard

All endpoints follow a single success envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": "optional"
}

Pagination always goes in meta.pagination: 
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 23,
      "totalPages": 3
    }
  }
}
For details that include replies, pagination for replies goes in meta.repliesPagination:
{
  "success": true,
  "data": { "topic": {}, "replies": [] },
  "meta": { "repliesPagination": { "page": 1, "pageSize": 10, "total": 2, "totalPages": 1 } }
}

Authentication & Users
Register

POST /api/users/register

Request body:

{
  "name": "Lucas Lydio",
  "email": "teste@teste.com",
  "password": "123456",
  "avatar_url": null
}


Response (201):

{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Lucas Lydio",
    "email": "teste@teste.com",
    "avatar_url": null,
    "created_at": "2026-02-03T21:29:06.113Z"
  },
  "meta": {},
  "message": "Usuário criado com sucesso"
}

Login

POST /api/users/login

Request body:

{
  "email": "teste@teste.com",
  "password": "123456"
}


Response:

{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "name": "Lucas Lydio",
      "email": "teste@teste.com",
      "avatar_url": null,
      "created_at": "2025-12-03T13:44:54.531Z"
    }
  },
  "meta": {}
}

Profile (Me)

GET /api/users/me (requires Authorization)

Response:

{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Lucas Lydio",
    "email": "teste@teste.com",
    "avatar_url": null,
    "created_at": "2025-12-03T13:44:54.531Z"
  },
  "meta": {}
}

List Users

GET /api/users?page=1&pageSize=10

Response:

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beatriz Ramos",
      "email": "beatriz.ramos@example.com",
      "avatar_url": "https://i.pravatar.cc/150?img=13",
      "created_at": "2025-12-03T00:49:08.418Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}


Authorization header example:

Authorization: Bearer <token>

Topics
List Topics

GET /api/topics?page=1&pageSize=10

Response:

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Git: melhores práticas para times grandes",
      "body": "Como evitar bagunça em branches e commits?",
      "created_at": "2025-12-03T00:50:19.103Z",
      "user": {
        "id": "uuid",
        "name": "Thiago Moreira",
        "avatar_url": "https://i.pravatar.cc/150?img=18"
      },
      "repliesCount": 4
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 23,
      "totalPages": 3
    }
  }
}

Create Topic

POST /api/topics (requires Authorization)

Request body:

{
  "title": "string",
  "body": "string"
}


Response (201):

{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "body": "string",
    "created_at": "2026-02-04T10:00:00.000Z"
  },
  "meta": {},
  "message": "Tópico criado com sucesso"
}

Topic Details + Replies

GET /api/topics/:id?page=1&pageSize=10

Response:

{
  "success": true,
  "data": {
    "topic": {
      "id": "uuid",
      "title": "Git: melhores práticas para times grandes",
      "body": "Como evitar bagunça em branches e commits?",
      "created_at": "2025-12-03T00:50:19.103Z",
      "user": {
        "id": "uuid",
        "name": "Thiago Moreira",
        "avatar_url": "https://i.pravatar.cc/150?img=18"
      }
    },
    "replies": [
      {
        "id": "uuid",
        "topic_id": "uuid",
        "body": "Commits pequenos e branches curtas.",
        "created_at": "2025-12-03T00:50:38.535Z",
        "user": {
          "id": "uuid",
          "name": "Thiago Moreira",
          "avatar_url": "https://i.pravatar.cc/150?img=18"
        }
      }
    ]
  },
  "meta": {
    "repliesPagination": {
      "page": 1,
      "pageSize": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}

Reply Topics
List Topic Replies

GET /api/reply-topics/:topicId (or your route equivalent)

Response:

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "topic_id": "uuid",
      "body": "string",
      "created_at": "2026-02-04T10:00:00.000Z",
      "user": { "id": "uuid", "name": "string", "avatar_url": null }
    }
  ],
  "meta": {}
}

Create Reply (Topic)

POST /api/reply-topics/:topicId (requires Authorization)

Request body:

{
  "body": "string"
}


Response (201):

{
  "success": true,
  "data": {
    "id": "uuid",
    "topic_id": "uuid",
    "user_id": "uuid",
    "body": "string",
    "created_at": "2026-02-04T10:00:00.000Z"
  },
  "meta": {},
  "message": "Resposta criada com sucesso"
}

Update Reply (Topic)

PUT /api/reply-topics/:id (requires Authorization)

Response:

{
  "success": true,
  "data": { "id": "uuid", "body": "updated", "created_at": "..." },
  "meta": {},
  "message": "Resposta atualizada com sucesso"
}

Delete Reply (Topic)

DELETE /api/reply-topics/:id (requires Authorization)

Response:

{
  "success": true,
  "data": { "deleted": true },
  "meta": {},
  "message": "Resposta removida com sucesso"
}

News
List News

GET /api/news?page=1&pageSize=10

Response:

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Chegou a seção de notícias!",
      "body": "Agora você pode acompanhar novidades diretamente pelo painel.",
      "view": 24,
      "like": 3,
      "created_at": "2025-12-03T19:23:19.000Z",
      "repliesCount": 2
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}

Create News

POST /api/news (requires Authorization)

Request body:

{
  "title": "string",
  "body": "string"
}


Response (201):

{
  "success": true,
  "data": { "id": "uuid", "title": "string", "body": "string", "created_at": "..." },
  "meta": {},
  "message": "Notícia criada com sucesso"
}

News Details + Replies

GET /api/news/:id?page=1&pageSize=10

Response:

{
  "success": true,
  "data": {
    "news": { "id": "uuid", "title": "string", "body": "string", "view": 0, "like": 0, "created_at": "..." },
    "replies": [ { "id": "uuid", "news_id": "uuid", "body": "string", "created_at": "...", "user": { "id": "uuid", "name": "string", "avatar_url": null } } ]
  },
  "meta": {
    "repliesPagination": { "page": 1, "pageSize": 10, "total": 2, "totalPages": 1 }
  }
}

Like News

POST /api/news/:id/like (requires Authorization if your route is protected)

Response:

{
  "success": true,
  "data": { "id": "uuid", "like": 4, "view": 24, "created_at": "..." },
  "meta": {},
  "message": "Like adicionado"
}

Reply News
Create Reply (News)

POST /api/reply-news/:newsId (requires Authorization)

Response (201):

{
  "success": true,
  "data": { "id": "uuid", "news_id": "uuid", "user_id": "uuid", "body": "string", "created_at": "..." },
  "meta": {},
  "message": "Resposta criada com sucesso"
}

Update Reply (News)

PUT /api/reply-news/:id (requires Authorization)

Response:

{
  "success": true,
  "data": { "id": "uuid", "body": "updated", "created_at": "..." },
  "meta": {},
  "message": "Resposta atualizada com sucesso"
}

Delete Reply (News)

DELETE /api/reply-news/:id (requires Authorization)

Response:

{
  "success": true,
  "data": { "deleted": true },
  "meta": {},
  "message": "Resposta removida com sucesso"
}

Redis Integration

This API uses Redis for caching list and detail endpoints (versioned keys).
Set these variables in .env:

REDIS_URL="redis://localhost:6379"

REDIS_DISABLED="true" to bypass cache

License

MIT License


If you paste your **routes for messages** (`message.routes.js`) or one example response, I’ll update that section too so the README matches 100% of your API.
::contentReference[oaicite:0]{index=0}
