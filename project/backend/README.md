# Eusha Portfolio Backend

A comprehensive Node.js/Express.js backend for Eusha's portfolio website with chess functionality, visitor management, and email automation.

## 🚀 Features

### Core Features
- **Visitor Management**: Track and manage website visitors with email automation
- **Chess System**: Full multiplayer chess with Stockfish engine integration
- **User Authentication**: JWT-based auth system for chess players
- **Friend System**: Add friends, send requests, and manage relationships
- **Email Automation**: Automated thank you emails and contact form handling
- **Real-time Chess**: Socket.IO powered live chess games

### Chess Features
- **Bot Games**: Play against Stockfish engine (2000+ ELO)
- **Multiplayer**: Real-time games between registered users
- **Rating System**: ELO-based rating calculations
- **Game History**: Complete game tracking and replay
- **Friend Challenges**: Challenge friends to games
- **Leaderboard**: Global player rankings

## 📦 Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
- Install MongoDB locally or use MongoDB Atlas
- Update MONGODB_URI in .env

4. **Email Setup**
- Configure Gmail SMTP or your preferred email service
- Update email credentials in .env

5. **Stockfish Setup** (Optional)
- Install Stockfish locally for better performance
- Update STOCKFISH_PATH in .env
- Falls back to JavaScript engine if not available

## 🔧 Configuration

### Required Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eusha-portfolio
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Optional Variables
```env
STOCKFISH_PATH=/usr/local/bin/stockfish
```

## 🏃‍♂️ Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Visitors
- `POST /api/visitors` - Add new visitor
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/stats` - Get visitor statistics

### Chess
- `GET /api/chess/history` - Get user's game history
- `GET /api/chess/game/:gameId` - Get specific game
- `GET /api/chess/leaderboard` - Get player leaderboard

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `GET /api/friends/requests` - Get friend requests
- `GET /api/friends` - Get friends list
- `DELETE /api/friends/:friendId` - Remove friend
- `GET /api/friends/search/:query` - Search users

### Email
- `POST /api/email/contact` - Send contact form email

## 🎮 Chess System Architecture

### Game Flow
1. **Bot Games**: Instant start, no registration required
2. **Multiplayer**: Requires authentication, matchmaking system
3. **Friend Games**: Challenge friends directly

### Stockfish Integration
- Primary: Native Stockfish binary for optimal performance
- Fallback: JavaScript chess engine for compatibility
- Configurable difficulty levels
- Move validation and game state management

### Real-time Features
- Socket.IO for live game updates
- Move broadcasting
- Player disconnection handling
- Game state synchronization

## 📧 Email System

### Automated Emails
- **Visitor Thank You**: Sent when visitors provide email
- **Contact Form**: Auto-reply + notification to Eusha
- **HTML Templates**: Beautiful, responsive email designs

### Email Features
- Gmail SMTP integration
- Error handling and fallbacks
- Template customization
- Delivery tracking

## 🔒 Security Features

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for frontend domain
- **Helmet.js**: Security headers
- **Password Hashing**: bcrypt for secure passwords

## 📊 Database Schema

### Users
- Authentication and profile data
- Chess statistics and ratings
- Friend relationships
- Online status tracking

### Visitors
- Name, relation, email
- IP tracking and geolocation
- Email delivery status
- Timestamp tracking

### Chess Games
- Complete game state and history
- Player information
- Move notation and timing
- Game results and statistics

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- MongoDB database
- Email service (Gmail recommended)
- Optional: Stockfish binary

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up email service
4. Install Stockfish (optional)

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start src/server.js --name "eusha-backend"
pm2 startup
pm2 save
```

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   └── server.js       # Main server file
├── package.json
└── README.md
```

### Adding New Features
1. Create model in `models/`
2. Add routes in `routes/`
3. Implement business logic in `services/`
4. Add middleware if needed
5. Update server.js if required

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check MONGODB_URI and database status
2. **Email Not Sending**: Verify SMTP credentials and app passwords
3. **Stockfish Errors**: Install binary or rely on JavaScript fallback
4. **Socket.IO Issues**: Check CORS configuration and frontend URL

### Debugging
- Enable development logging with NODE_ENV=development
- Check server logs for detailed error messages
- Use MongoDB Compass for database inspection
- Test API endpoints with Postman or similar tools

## 📈 Performance

### Optimizations
- Database indexing for fast queries
- Connection pooling for MongoDB
- Compression middleware
- Rate limiting for API protection
- Efficient Stockfish integration

### Monitoring
- Health check endpoint: `GET /api/health`
- Error logging and tracking
- Performance metrics collection
- Database query optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code style guidelines

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Eusha Ibna Akbor**