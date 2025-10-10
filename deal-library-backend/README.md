# Sovrn Marketing Co-Pilot Backend API

A Node.js backend API for the Marketing Co-Pilot, providing Google Sheets integration and RESTful endpoints.

## 🚀 Features

- **Google Sheets Integration**: Real-time data synchronization with Google Sheets
- **RESTful API**: Complete CRUD operations for deals
- **Custom Deal Requests**: Handle custom deal submissions
- **Search & Filtering**: Advanced search capabilities
- **Rate Limiting**: API protection and throttling
- **Error Handling**: Comprehensive error management
- **TypeScript**: Full type safety and IntelliSense

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Google Sheets**: Google Sheets API v4
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi for request validation
- **Logging**: Morgan for HTTP request logging

## 📦 Installation

### Prerequisites

- Node.js 18+
- Google Sheets API credentials
- Google Sheets with deal data

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd deal-library-backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   ```

3. **Configure Google Sheets API**:
   - Get Google Sheets API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Sheets API
   - Create a service account and download credentials
   - Share your Google Sheet with the service account email

4. **Update Environment Variables**:
   ```env
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SHEETS_RANGE=Deals!A:Z
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 📋 Google Sheets Setup

### Required Columns (in order):
1. **ID** - Unique identifier
2. **Title** - Deal title
3. **Description** - Deal description
4. **Category** - Deal category
5. **Status** - active, pending, completed, expired
6. **Value** - Deal value (number)
7. **Currency** - Currency code (USD, EUR, etc.)
8. **Partner** - Partner company name
9. **StartDate** - Start date (YYYY-MM-DD)
10. **EndDate** - End date (optional)
11. **Tags** - Comma-separated tags
12. **Priority** - low, medium, high
13. **CreatedBy** - Creator name
14. **CreatedAt** - Creation timestamp
15. **UpdatedAt** - Last update timestamp

### Sample Data Format:
```
ID | Title | Description | Category | Status | Value | Currency | Partner | StartDate | EndDate | Tags | Priority | CreatedBy | CreatedAt | UpdatedAt
deal-001 | Apple Partnership | Strategic partnership with Apple | Technology | active | 2500000 | USD | Apple Inc. | 2024-01-15 | 2024-12-31 | mobile,ios,premium | high | John Smith | 2024-01-10T10:00:00Z | 2024-01-15T14:30:00Z
```

## 🔗 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Deals
- **GET** `/api/deals` - Get all deals (with filtering and pagination)
- **GET** `/api/deals/:id` - Get specific deal by ID
- **POST** `/api/deals` - Create new deal
- **PUT** `/api/deals/:id` - Update existing deal

### Custom Deal Requests
- **POST** `/api/custom-deal-request` - Submit custom deal request

## 🔍 Query Parameters

### GET /api/deals
- `search` - Search in title, description, partner, tags
- `category` - Filter by category
- `status` - Filter by status
- `priority` - Filter by priority
- `dateStart` - Filter by start date (YYYY-MM-DD)
- `dateEnd` - Filter by end date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Example Requests:
```bash
# Search for Apple deals
GET /api/deals?search=Apple

# Filter active deals in Technology category
GET /api/deals?status=active&category=Technology

# Paginated results
GET /api/deals?page=2&limit=5

# Date range filtering
GET /api/deals?dateStart=2024-01-01&dateEnd=2024-12-31
```

## 📊 Response Format

### Success Response:
```json
{
  "deals": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Error Response:
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## 🚀 Development

### Available Scripts:
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

### Development Features:
- **Hot Reload**: Automatic server restart on file changes
- **TypeScript**: Full type checking and IntelliSense
- **Error Handling**: Detailed error messages in development
- **Logging**: Request/response logging with Morgan

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data validation
- **Error Handling**: Secure error responses

## 📈 Performance

- **Compression**: Gzip compression for responses
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Efficient Queries**: Optimized Google Sheets API calls
- **Caching**: Ready for Redis integration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Environment Variables:
```env
NODE_ENV=production
PORT=3001
GOOGLE_SHEETS_API_KEY=your_production_api_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_production_spreadsheet_id
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues:

1. **Google Sheets API Error**:
   - Verify API key is correct
   - Check spreadsheet ID
   - Ensure service account has access

2. **CORS Issues**:
   - Update CORS_ORIGIN in environment variables
   - Check frontend URL matches CORS configuration

3. **Rate Limiting**:
   - Adjust RATE_LIMIT_MAX_REQUESTS if needed
   - Implement client-side request throttling

## 📝 Next Steps

- [ ] Add authentication middleware
- [ ] Implement Redis caching
- [ ] Add comprehensive logging
- [ ] Set up monitoring and alerts
- [ ] Add API documentation with Swagger
- [ ] Implement AI-powered search
- [ ] Add email notifications for custom deal requests
