#  BlogAI - Content Recommendation Engine

A full-stack blog platform that recommends articles to readers using AI (OpenAI API) based on their reading history and preferences.

##  Features

###  Authentication
- JWT-based user authentication
- Role-based access control (Reader/Creator)
- Secure password hashing with bcrypt

###  Blog Management
- Create, read, update, and delete blog posts
- Rich text content with tags
- Author-only CRUD operations
- Like/unlike functionality
- Read count tracking

###  AI-Powered Recommendations
- OpenAI embeddings for content analysis
- Personalized recommendations based on:
  - User preferences
  - Reading history
  - Content similarity
- Multi-factor scoring algorithm
- Trending content discovery

###  Modern UI/UX
- Responsive design with TailwindCSS
- Beautiful gradients and animations
- Mobile-first approach
- Intuitive navigation

##  Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS, Redux Toolkit |
| **Backend** | Node.js, Express, JWT, bcryptjs |
| **Database** | MongoDB Atlas, Mongoose |
| **AI** | OpenAI API (text-embedding-ada-002) |
| **Deployment** | AWS EC2 (backend), AWS S3 + CloudFront (frontend) |

##  Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- OpenAI API key

### 1. Clone the repository
```bash
git clone <repository-url>
cd adya
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Start Development Servers

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

##  Configuration

### OpenAI API Setup
1. Sign up at [OpenAI](https://openai.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

##  API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Blogs
- `GET /api/blogs` - List all blogs (public)
- `GET /api/blogs/:id` - Get blog by ID (public)
- `POST /api/blogs` - Create blog (creator only)
- `PUT /api/blogs/:id` - Update blog (creator only)
- `DELETE /api/blogs/:id` - Delete blog (creator only)
- `POST /api/blogs/:id/like` - Like/unlike blog (authenticated)

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations (reader only)
- `PUT /api/recommendations/preferences` - Update preferences (authenticated)
- `GET /api/recommendations/trending` - Get trending blogs (public)

##  Deployment

### Backend Deployment (AWS EC2)

1. **Launch EC2 Instance**
   ```bash
   # Connect to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Node.js and PM2**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   # Clone your repository
   git clone <your-repo>
   cd adya/server
   
   # Install dependencies
   npm install
   
   # Set environment variables
   nano .env
   
   # Start with PM2
   pm2 start src/index.js --name "blogai-backend"
   pm2 startup
   pm2 save
   ```

### Frontend Deployment (AWS S3 + CloudFront)

1. **Build the Application**
   ```bash
   cd client
   npm run build
   ```

2. **Upload to S3**
   - Create an S3 bucket
   - Enable static website hosting
   - Upload the `dist` folder contents

3. **Configure CloudFront**
   - Create a CloudFront distribution
   - Point to your S3 bucket
   - Configure custom domain (optional)

##  Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

##  AI Tools Used

- **OpenAI Embeddings**: text-embedding-ada-002
  - Generates 1536-dimensional vectors for content analysis
  - Used for similarity calculations and recommendations
  - Cost-effective and highly accurate

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


