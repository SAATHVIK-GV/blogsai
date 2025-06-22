# 🚀 Content Recommendation Engine - Full Development Guide (for Cursor AI)

---

## 🎯 Project Objective

Build a full-stack blog platform that recommends articles to readers using AI (OpenAI API) based on their reading history and preferences.

---

## 🛠 Tech Stack

| Layer | Tech |
| ----- | ---- |
|       |      |

|   |
| - |

|   |
| - |

|   |
| - |

| **Frontend**   | React (Vite), TailwindCSS, Redux                  |
| -------------- | ------------------------------------------------- |
| **Backend**    | Node.js, Express, JWT                             |
| **Database**   | MongoDB Atlas                                     |
| **AI**         | OpenAI API (text-embedding-ada-002)               |
| **Deployment** | AWS EC2 (backend), AWS S3 + CloudFront (frontend) |

---

## 📂 Folder Structure

```
/client                 # React app
/server
  /src
    /controllers         # Express controllers
    /models              # Mongoose models
    /routes              # API routes
    /middleware          # Auth / error handling
    /services            # OpenAI API logic
/docs
  BRD.md
  architecture-diagram.png
  flow-diagram.png
  test-report.md
.env.example
README.md
```

---

## 📝 Cursor AI Task Instructions

### ⚙ 1️⃣ Project Setup

Ask Cursor:

```
Create a Vite + React + Tailwind starter inside /client.
Add Redux and set up a simple global state.
Create a Node.js + Express starter in /server.
Connect server to MongoDB Atlas using Mongoose.
Set up dotenv and a .env.example file.
```

---

### ⚙ 2️⃣ Authentication

Ask Cursor:

```
Generate JWT-based auth:
- User model: name, email, passwordHash, role (reader/creator), preferences
- Signup, login routes
- Middleware for protected routes
```

---

### ⚙ 3️⃣ Blog Management

Ask Cursor:

```
Create BlogPost model: title, content, tags, authorId, embedding (array).
Set up API routes:
- POST /api/blogs (protected, creator only)
- GET /api/blogs (public, list all blogs)
- GET /api/blogs/:id (public, view blog)
- PUT /api/blogs/:id (protected, creator only)
- DELETE /api/blogs/:id (protected, creator only)
```

---

### ⚙ 4️⃣ OpenAI Integration

Ask Cursor:

```
Create server/src/services/aiService.js that calls OpenAI embedding API:
- Send blog text to text-embedding-ada-002
- Return embedding
On blog create/edit, store embedding in DB
```

Provide Cursor this code sample:

```js
const axios = require('axios');

async function analyzeContent(blogText) {
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-ada-002',
      input: blogText
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.data[0].embedding;
}

module.exports = { analyzeContent };
```

---

### ⚙ 5️⃣ Recommendation Engine

Ask Cursor:

```
Create /api/recommendations (protected, reader only)
Fetch reader’s preferences + history
Calculate similarity scores between stored blog embeddings and user interests
Return top N blogs sorted by score
```

---

### ⚙ 6️⃣ Frontend

Ask Cursor:

```
Create React pages:
- LoginPage
- RegisterPage
- BlogListPage (with recommendations section)
- BlogDetailPage
- CreateEditBlogPage (for creator)
- DashboardPage (reader stats, creator analytics)

Use Tailwind for styling
Use Redux to store user info + auth token
```

---

### ⚙ 7️⃣ Testing

Ask Cursor:

```
Write Jest unit tests for:
- Auth middleware
- Blog CRUD API
- Recommendation service

Create Postman collection for API tests
Generate test-report.md with summary and sample outputs
```

---

### ⚙ 8️⃣ Deployment

Ask Cursor:

```
Generate AWS EC2 deployment steps for Node.js backend:
- EC2 setup with Node, PM2
- Upload code, set env, start server

Generate AWS S3 + CloudFront steps for React frontend:
- Build React app
- Upload to S3 bucket
- Configure CloudFront
```

---

### ⚙ 9️⃣ Documentation

Ask Cursor:

```
Create README.md that includes:
- Setup instructions
- AI tools used (OpenAI API details)
- Deployment steps
- Features list

Create BRD.md with project objective, users, core features, tech stack
```

---

### ⚙ 10️⃣ Wireframes + Diagrams

✅ Use this Figma link for wireframes: 👉 [Figma Wireframe](https://www.figma.com/file/m6DhnVYAP7qvQ3QON6ZBoE/Content-Recommendation-Blog---Wireframe?type=design\&mode=design)

Ask Cursor:

```
Generate architecture diagram: React → Node → MongoDB → OpenAI API → AWS deployment
Generate flow diagram: login → read blog → update history → get recommendations
```

---

## 🧠 AI Tools

- OpenAI Embeddings: text-embedding-ada-002
-

---

## ✅ .env.example

```
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

---

```
t saves title, content, tags and calls aiService to store embedding
```

