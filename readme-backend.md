# Raboks Library Backend API

A comprehensive Node.js/Express backend API for the Raboks Library Research & Development Center academic platform, featuring manuscript submission, peer review workflow, user management, and publication repository.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Manuscript Submission System** - Complete workflow from submission to publication
- **Peer Review Management** - Automated reviewer assignment and review tracking
- **File Upload & Storage** - Secure file handling with validation and storage
- **Publication Repository** - Public browsing and search of published works
- **Email Notifications** - Automated emails for workflow events
- **Analytics & Reporting** - Comprehensive statistics and insights

### Security Features
- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **File Upload Security** with type and size restrictions
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Password Hashing** using bcryptjs

### Database Design
- **MongoDB** with Mongoose ODM
- **Comprehensive Models** for Users, Manuscripts, Reviews
- **Indexing Strategy** for optimal query performance
- **Data Validation** at schema level
- **Relationship Management** with population

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd raboks-library-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/raboks-library
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@rabokslibrary.org
   FROM_NAME=Raboks Library R&D Center
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "Password123!",
  "institution": "University of Excellence",
  "department": "computer-science",
  "position": "professor",
  "orcidId": "0000-0001-2345-6789"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "Password123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Manuscript Endpoints

#### Submit Manuscript
```http
POST /api/manuscripts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Research Paper Title",
  "abstract": "Paper abstract...",
  "keywords": ["keyword1", "keyword2"],
  "type": "research-article",
  "field": "computer-science",
  "authors": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "affiliation": "University of Excellence",
      "isCorresponding": true
    }
  ],
  "agreements": {
    "originality": true,
    "ethics": true,
    "copyright": true
  }
}
```

#### Get User's Manuscripts
```http
GET /api/manuscripts?page=1&limit=10&status=submitted
Authorization: Bearer <jwt-token>
```

#### Upload Files for Manuscript
```http
POST /api/manuscripts/:id/files
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
type: "manuscript" | "figures" | "supplementary"
```

### Review Endpoints

#### Get User's Reviews
```http
GET /api/reviews
Authorization: Bearer <jwt-token>
```

#### Accept Review Invitation
```http
POST /api/reviews/:id/accept
Authorization: Bearer <jwt-token>
```

#### Submit Review
```http
POST /api/reviews/:id/submit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "recommendation": "accept",
  "evaluation": {
    "overallRating": 4,
    "novelty": 4,
    "significance": 5,
    "methodology": 4,
    "clarity": 3,
    "presentation": 4,
    "summary": "Review summary...",
    "strengths": "Paper strengths...",
    "weaknesses": "Areas for improvement...",
    "detailedComments": "Detailed feedback..."
  },
  "reviewerExpertise": "expert",
  "timeSpent": 180
}
```

### Publication Endpoints

#### Get Published Papers (Public)
```http
GET /api/publications?page=1&limit=20&field=computer-science&search=machine learning
```

#### Get Publication Statistics
```http
GET /api/publications/stats
```

### File Upload Endpoints

#### Upload Single File
```http
POST /api/uploads/single
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <file>
```

#### Upload Multiple Files
```http
POST /api/uploads/multiple
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

## 🗄️ Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  institution: String,
  department: Enum,
  position: Enum,
  orcidId: String,
  isVerified: Boolean,
  role: Enum ['user', 'reviewer', 'editor', 'admin'],
  bio: String,
  researchInterests: [String],
  submissionsCount: Number,
  reviewsCompletedCount: Number,
  publicationsCount: Number,
  emailNotifications: Object,
  reviewPreferences: Object
}
```

### Manuscript Model
```javascript
{
  title: String,
  abstract: String,
  keywords: [String],
  type: Enum,
  field: Enum,
  authors: [AuthorSchema],
  submittedBy: ObjectId (User),
  submissionId: String (unique),
  files: [FileSchema],
  status: Enum,
  reviews: [ObjectId (Review)],
  isPublished: Boolean,
  publishedAt: Date,
  doi: String,
  views: Number,
  downloads: Number,
  citations: Number,
  timeline: [TimelineEntry]
}
```

### Review Model
```javascript
{
  manuscript: ObjectId (Manuscript),
  reviewer: ObjectId (User),
  assignedBy: ObjectId (User),
  reviewId: String (unique),
  status: Enum,
  dueDate: Date,
  recommendation: Enum,
  evaluation: {
    overallRating: Number,
    novelty: Number,
    significance: Number,
    methodology: Number,
    clarity: Number,
    presentation: Number,
    summary: String,
    strengths: String,
    weaknesses: String,
    detailedComments: String
  },
  comments: [CommentSchema],
  timeSpent: Number
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/raboks-library` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `SMTP_HOST` | Email server host | Required |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | Required |
| `SMTP_PASS` | Email password | Required |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `26214400` (25MB) |

### File Upload Configuration

- **Allowed file types**: PDF, DOC, DOCX, PNG, JPG, JPEG, TIFF, EPS, TXT, CSV, XLS, XLSX
- **Maximum file size**: 25MB per file
- **Maximum files per upload**: 10 files
- **Storage locations**:
  - Manuscripts: `uploads/manuscripts/`
  - Figures: `uploads/figures/`
  - Supplementary: `uploads/supplementary/`

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Process Management with PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "raboks-api"
   pm2 startup
   pm2 save
   ```

3. **Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name api.rabokslibrary.org;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/raboks-library
    depends_on:
      - mongo
    
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── unit/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── manuscripts.test.js
│   └── reviews.test.js
└── fixtures/
    └── sampleData.js
```

## 📊 Monitoring & Logging

### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Logging
- **Development**: Console logging with colors
- **Production**: File-based logging with rotation
- **Error tracking**: Structured error logging with stack traces

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with expiration
- Refresh token rotation
- Role-based access control
- Password strength requirements

### Data Protection
- Input validation and sanitization
- SQL injection prevention (NoSQL injection)
- XSS protection
- CSRF protection

### File Security
- File type validation
- Size limitations
- Secure file storage
- Virus scanning (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@rabokslibrary.org
- Documentation: [API Docs](https://api.rabokslibrary.org/docs)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core API functionality
- ✅ Authentication system
- ✅ Manuscript submission
- ✅ Basic peer review workflow

### Phase 2 (Next)
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] Integration with external services (ORCID, CrossRef)
- [ ] Advanced analytics dashboard

### Phase 3 (Future)
- [ ] Machine learning for reviewer matching
- [ ] Plagiarism detection integration
- [ ] Mobile API optimization
- [ ] GraphQL API layer

---

**Raboks Library Research & Development Center**  
*Advancing knowledge through systematic inquiry*