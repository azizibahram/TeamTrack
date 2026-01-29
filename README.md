# TeamTrack - Employee Dashboard

A modern, real-time employee dashboard that integrates Slack and Jibble to display employee information, tasks, and attendance data.

## Features

- **Employee Profiles**: Display employee photos, names, emails, and roles from Slack
- **Task Management**: Fetch and display latest tasks from Slack channels
- **Attendance Tracking**: Real-time attendance status from Jibble integration
- **Weekly Reports**: Comprehensive weekly attendance and task summaries
- **News Feed**: Software department news from Slack channels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Dark theme with animated backgrounds and smooth transitions

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Node.js, Express.js
- **APIs**: Slack API, Jibble API
- **Data Tables**: jQuery DataTables for interactive tables

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

1. Create a Slack app in your workspace
2. Add the following bot token scopes:
   - `users:read`
   - `users:read.email`
   - `channels:read`
   - `channels:history`
3. Install the app to your workspace
4. Get the bot token and channel IDs

### Jibble Setup

1. Obtain your Jibble API token
2. Ensure your account has access to attendance data

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