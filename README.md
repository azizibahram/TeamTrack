# TeamTrack - Employee Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)](https://api.slack.com/)

A modern, real-time employee dashboard that integrates with Slack to display employee information, tasks, attendance data (via Jibble), and department news with automatic updates.

## Features

- 🚀 **Real-time Updates**: Automatic dashboard refresh when Slack data changes
- 👥 **Employee Profiles**: Display employee photos, names, emails, and roles from Slack
- 📋 **Task Management**: Fetch and display latest tasks from Slack channels
- ⏰ **Attendance Tracking**: Real-time attendance status from Jibble via Slack integration
- 📊 **Weekly Reports**: Comprehensive weekly attendance and task summaries
- 📰 **News Feed**: Software department news from Slack channels
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Dark theme with animated backgrounds and smooth transitions
- ⚡ **Performance Optimized**: Caching system for fast loading times

## Project Structure

```
TeamTrack/
├── backend/
│   ├── index.js          # Main server file
│   ├── package.json      # Backend dependencies
│   ├── .env              # Environment variables (configure with your API keys)
│   └── .gitignore        # Backend-specific ignores
├── frontend/
│   ├── index.html        # Main dashboard page
│   ├── app.js            # Frontend JavaScript logic
│   ├── style.css         # Custom CSS animations and styles
│   └── Logo2.png         # Company logo
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Slack workspace with appropriate permissions
- Jibble account with API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamTrack
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**

   Copy the `.env` file and update with your API credentials:

   ```env
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_CHANNEL_ID=C1234567890  # Tasks channel ID
   SLACK_NEWS_CHANNEL_ID=C0987654321  # News channel ID
   JIBBLE_API_TOKEN=your-jibble-api-token
   PORT=3000
   ```

4. **Start the Backend**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Frontend Setup**

   Open `frontend/index.html` in your browser, or serve it via a local server.

   The frontend will connect to the backend running on `http://localhost:3000`.

## API Configuration

### Slack Setup

1. Create a Slack app in your workspace at [Slack API](https://api.slack.com/apps)
2. Add the following bot token scopes:
   - `users:read` - Read user information
   - `users:read.email` - Read user email addresses
   - `channels:read` - Read channel information
   - `channels:history` - Read channel message history
3. Install the app to your workspace
4. Get the bot token and channel IDs for tasks and news channels

### Jibble Integration

Jibble attendance data is integrated through Slack channels. Ensure your Slack workspace has Jibble bot integration that posts attendance updates to a designated channel.

## Usage

1. Start the backend server
2. Open the frontend in a web browser
3. The dashboard will load employee data, tasks, and attendance
4. Use the interactive tables to filter and search employees
5. View weekly reports and department news

## Security Notes

- API tokens are stored securely in environment variables
- No sensitive data is exposed to the frontend
- All API calls are made server-side

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support or questions, please contact the development team.