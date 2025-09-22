# Travel Safety & Weather Dashboard

A comprehensive web application that provides travelers with essential safety information,## 🔐 Authentication Setup

For detailed authentication setup and testing instructions, see the **[Authentication Guide](AUTHENTICATION_GUIDE.md)**.

The authentication system includes:
- User registration with email verification
- Secure Firebase authentication
- Protected routes and API endpoints
- Complete testing procedures

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Quick Deployment:
1. **Push to GitHub**: Commit your changes to the `main` branch
2. **Configure Secrets**: Add Firebase configuration as repository secrets
3. **Enable Pages**: Set GitHub Pages source to "GitHub Actions"
4. **Deploy**: Automatic deployment on every push

For detailed deployment instructions, see the **[Deployment Guide](DEPLOYMENT_GUIDE.md)**.

### Live Demo:
🌐 **[View Live Application](https://prabasajee.github.io/Travel-Safety-Weather-Dashboard/)**conditions, and country details for informed travel decisions.

## 📋 Project Overview

This dashboard integrates multiple APIs to deliver:
- **Travel Safety Advisories** - Current travel warnings and safety information
- **Weather Conditions** - Real-time weather data and forecasts
- **Country Information** - Demographics, currency, languages, and travel requirements

## 🚀 Features

- 🔍 **Smart Search** - Search by city or country name
- 🌤️ **Weather Integration** - Current conditions and 5-day forecasts
- ⚠️ **Safety Alerts** - Government travel advisories and warnings
- 🌍 **Country Profiles** - Detailed country information
- 🔐 **Secure Authentication** - Firebase authentication with email verification
- 📱 **Responsive Design** - Mobile-friendly interface
- 💾 **Data Storage** - MongoDB integration for user searches

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive UI/UX design
- AJAX for asynchronous API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- OAuth 2.0 authentication

### APIs
- **OpenWeatherMap API** - Weather data
- **Travel Advisory API** - Safety information
- **RestCountries API** - Country details

## 👥 Team Structure

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Member 1** | Frontend UI/UX Developer | Web interface design, user interactions, error handling |
| **Member 2** | API Integration Specialist | API connections, data normalization, rate limiting |
| **Member 3** | Backend Developer | Server setup, routing, request handling |
| **Member 4** | Database Manager | MongoDB setup, schemas, data validation |
| **Member 5** | Security & Testing Lead | Authentication, HTTPS, testing, debugging |

## 📁 Project Structure

```
Travel-Safety-Weather-Dashboard/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── api.js
│   └── assets/
│       └── images/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── api.js
│   │   └── auth.js
│   ├── models/
│   │   └── Search.js
│   ├── middleware/
│   │   └── auth.js
│   └── config/
│       └── database.js
├── tests/
│   ├── frontend.test.js
│   └── backend.test.js
├── docs/
│   └── api-documentation.md
├── .env.example
├── package.json
├── .gitignore
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- API keys for:
  - OpenWeatherMap
  - Travel Advisory API
  - RestCountries API

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/prabasajee/Travel-Safety-Weather-Dashboard.git
   cd Travel-Safety-Weather-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database connection
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   # Create database collections
   npm run setup-db
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## � Authentication Setup

For detailed authentication setup and testing instructions, see the **[Authentication Guide](AUTHENTICATION_GUIDE.md)**.

The authentication system includes:
- User registration with email verification
- Secure Firebase authentication
- Protected routes and API endpoints
- Complete testing procedures

## �🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/travel-dashboard
DB_NAME=travel_dashboard

# API Keys
OPENWEATHER_API_KEY=your_openweather_key
TRAVEL_ADVISORY_API_KEY=your_travel_advisory_key
RESTCOUNTRIES_API_KEY=your_restcountries_key

# OAuth
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## 📝 API Endpoints

### Public Endpoints
- `GET /` - Landing page
- `POST /api/search` - Search for location data
- `GET /api/weather/:location` - Get weather information
- `GET /api/safety/:country` - Get travel advisories
- `GET /api/country/:name` - Get country details

### Protected Endpoints
- `POST /api/records` - Save search record
- `GET /api/records` - Get user search history
- `DELETE /api/records/:id` - Delete search record

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t travel-dashboard .
docker run -p 3000:3000 travel-dashboard
```

## 📊 Usage Examples

### Search for a Location
```javascript
// Example API call
fetch('/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    location: 'Tokyo, Japan'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Response Format
```json
{
  "location": "Tokyo, Japan",
  "weather": {
    "temperature": 25,
    "condition": "Sunny",
    "forecast": [...]
  },
  "safety": {
    "advisory_level": "Exercise Normal Precautions",
    "details": "..."
  },
  "country": {
    "name": "Japan",
    "currency": "JPY",
    "language": "Japanese"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Development Team

- **Frontend Developer** - UI/UX Implementation
- **API Specialist** - External API Integration
- **Backend Developer** - Server & Routing Logic
- **Database Manager** - Data Management & Storage
- **Security Lead** - Authentication & Testing

## � Contributors
- **P. Sajeevan** – ITBNM-2211-0183  
- **S. Sanjeev** – ITBNM-2211-0185  
- **V. Muralitharan** – ITBNM-2211-0157  
- **V. Deshanth** – ITBNM-2211-0121  
- **S.A. Mahmood** – ITBNM-2211-0153  

## �📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the [documentation](docs/api-documentation.md)

## 🔄 Version History

- **v1.0.0** - Initial release
  - Basic search functionality
  - Weather integration
  - Travel advisory integration
  - User authentication

---

**Course**: IT41073 - Service Oriented Computing  
**Institution**: [Horizon campus ,malabe sri lanaka]  
**Academic Year**: 2024-2025
