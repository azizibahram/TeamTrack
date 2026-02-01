# TeamTrack - Employee Performance Dashboard

<p align="center">
  <img src="frontend/Logo2.png" alt="TeamTrack Logo" width="120" />
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"></a>
  <a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://api.slack.com/"><img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white" alt="Slack"></a>
</p>

<p align="center">
  <strong>A modern, gamified employee dashboard with real-time Slack integration</strong>
</p>

---

## ✨ Features

### 🎮 Gamification System
- **🏆 Employee Leaderboard** - Rankings based on weekly performance with Gold/Silver/Bronze podium
- **🎯 Achievement Badges** - Earn badges for Early Bird, Active Poster, Perfect Week, Consistency, and Streaks
- **📊 Team Goals** - Track department goals: Attendance Rate, Task Completion, On-Time Arrivals
- **🔥 Dual Streaks** - Separate streak tracking for Attendance and Task Posting
- **⭐ Top Performer Spotlight** - Highlight the #1 employee of the week

### 📋 Core Functionality
- **🚀 Real-time Updates** - WebSocket-powered live dashboard updates
- **👥 Employee Profiles** - Slack-synced photos, names, emails, and roles
- **📋 Task Management** - Daily and weekly task tracking from Slack channels
- **⏰ Attendance Tracking** - Jibble integration via Slack with Present/Late/Absent status
- **📊 Weekly Reports** - Comprehensive attendance and task summaries (Saturday-Thursday)
- **📰 News Feed** - Department announcements from Slack channels
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Frosted glass cards with backdrop blur effects
- **Animated Backgrounds** - Floating gradient orbs and dynamic grid patterns
- **Smooth Animations** - Staggered loading, hover effects, and transitions
- **Dark Theme** - Professional dark mode with cyan/purple/pink accents
- **Achievement Popups** - Confetti celebrations for earned badges

---

## 🏗️ Architecture

```
TeamTrack/
├── backend/
│   ├── index.js              # Express server with Socket.io
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment configuration
│   └── .gitignore
├── frontend/
│   ├── index.html            # Dashboard UI
│   ├── app.js                # Frontend logic & gamification
│   ├── style.css             # Glassmorphism styles & animations
│   └── Logo2.png             # Brand logo
├── screenshots/              # UI screenshots
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm or yarn
- Slack workspace with admin access
- Jibble account (for attendance tracking)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamTrack
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**

   Create `backend/.env`:
   ```env
   # Slack Configuration
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_CHANNEL_ID=your-tasks-channel-name
   SLACK_NEWS_CHANNEL_ID=your-news-channel-name
   SLACK_ATTENDANCE_CHANNEL_ID=your-jibble-channel-name
   
   # Server Configuration
   PORT=3000
   ```

4. **Start the Server**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

5. **Access Dashboard**
   
   Open `http://localhost:3000` in your browser

---

## ⚙️ Configuration

### Slack App Setup

1. Create a new app at [Slack API](https://api.slack.com/apps)
2. Add these **Bot Token Scopes**:
   - `users:read` - Access user profiles
   - `users:read.email` - Access email addresses
   - `channels:read` - View channel information
   - `channels:history` - Read channel messages
   - `groups:history` - Read private channel messages
3. Install the app to your workspace
4. Copy the **Bot User OAuth Token** to your `.env` file
5. Invite the bot to your tasks, news, and attendance channels

### Jibble Integration

1. Connect Jibble to your Slack workspace
2. Ensure Jibble posts check-in/out messages to a dedicated channel
3. Set `SLACK_ATTENDANCE_CHANNEL_ID` to this channel's name

---

## 🎯 Gamification Scoring

### Points System
| Action | Points |
|--------|--------|
| Present (on-time) | +20 pts |
| Late | +10 pts |
| Task posted | +3 pts |
| Daily activity bonus | +15 pts |
| Early bird bonus | +10 pts |

### Achievement Badges
- 🌅 **Early Bird** - Arrived before 9:00 AM
- 📋 **Active Poster** - Posted tasks today
- ✅ **Perfect Week** - 100% attendance this week
- ⭐ **Consistent** - Posted tasks all week
- 🔥 **On Fire!** - 5-day attendance streak

### Streak Calculation
- **Attendance Streak**: Consecutive days Present/Late (Saturday-Thursday)
- **Task Streak**: Consecutive days with posted tasks (Saturday-Thursday)
- Friday is excluded (vacation day)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js, Express.js, Socket.io |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Styling** | Tailwind CSS (CDN), Custom CSS |
| **Real-time** | Socket.io (WebSockets) |
| **APIs** | Slack Web API |
| **Icons** | Font Awesome 6 |
| **Animations** | CSS Keyframes, Canvas Confetti |

---

## 📸 Screenshots

<p align="center">
  <img src="screenshots/teamtrack_redesign.png" alt="TeamTrack Dashboard" width="800" />
</p>

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Slack API](https://api.slack.com/) for workspace integration
- [Jibble](https://www.jibble.io/) for attendance tracking
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Font Awesome](https://fontawesome.com/) for beautiful icons

---

<p align="center">
  <strong>Built with ❤️ for productive teams</strong>
</p>
