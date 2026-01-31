require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const CACHE_FILE = path.join(__dirname, 'cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache functions
async function loadCache() {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

async function saveCache(data) {
    try {
        await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving cache:', error.message);
    }
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Slack API functions
async function getSlackUsers() {
    const cache = await loadCache();
    const now = Date.now();

    // Check if users are cached and recent
    if (cache && cache.users && (now - cache.lastUpdated) < CACHE_DURATION) {
        return cache.users;
    }

    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/users.list', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.ok) throw new Error(response.data.error);

        const users = response.data.members;

        // Cache the users
        if (!cache) {
            await saveCache({ users: users, lastUpdated: now });
        } else {
            cache.users = users;
            cache.lastUpdated = now;
            await saveCache(cache);
        }

        return users;
    } catch (error) {
        console.error('Error fetching Slack users:', error.message);
        return [];
    }
}

async function getUserProfile(userId) {
    const cache = await loadCache();
    const now = Date.now();

    // Check if profile is cached and recent
    if (cache && cache.profiles && cache.profiles[userId] &&
        (now - cache.profiles[userId].lastUpdated) < CACHE_DURATION) {
        return cache.profiles[userId].data;
    }

    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/users.profile.get', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user: userId }
        });
        if (!response.data.ok) throw new Error(response.data.error);

        const profile = response.data.profile;

        // Cache the profile
        if (!cache) {
            await saveCache({ profiles: { [userId]: { data: profile, lastUpdated: now } }, lastUpdated: now });
        } else {
            if (!cache.profiles) cache.profiles = {};
            cache.profiles[userId] = { data: profile, lastUpdated: now };
            cache.lastUpdated = now;
            await saveCache(cache);
        }

        return profile;
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        return {};
    }
}

async function getChannelIdByName(channelName) {
    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/conversations.list', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.ok) throw new Error(response.data.error);
        const channel = response.data.channels.find(ch => ch.name === channelName);
        return channel ? channel.id : null;
    } catch (error) {
        console.error('Error fetching channels:', error.message);
        return null;
    }
}

async function getChannelMessages(channelId, limit = 100) {
    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/conversations.history', {
            headers: { Authorization: `Bearer ${token}` },
            params: { channel: channelId, limit }
        });
        if (!response.data.ok) throw new Error(response.data.error);
        return response.data.messages;
    } catch (error) {
        console.error('Error fetching channel messages:', error.message);
        return [];
    }
}

// Attendance from Slack channel
async function getAttendanceFromSlack(weekOffset = 0) {
    try {
        const channelName = process.env.SLACK_ATTENDANCE_CHANNEL_ID;
        const channelId = await getChannelIdByName(channelName);
        if (!channelId) {
            console.error('Attendance channel not found');
            return {};
        }
        const messages = await getChannelMessages(channelId, 1000); // Get more messages for historical data
        console.log('Messages fetched for attendance:', messages.length);
        const weeklyAttendance = {};
        // Name mapping for mismatches between Jibble and Slack names
        const nameMap = {
            "Nawid Sanginzai": "فدایی صاحب",
            "Mahmood Sahil": "Sahil",
            "Muhsen Omari": "omari"
            // Add more mappings as needed
        };

        // Calculate the target week based on weekOffset
        // weekOffset = 0 means current week, 1 means last week, etc.
        const now = new Date();
        const targetWeekStart = new Date(now);
        targetWeekStart.setDate(now.getDate() - (now.getDay() + 1) % 7 - (weekOffset * 7));
        targetWeekStart.setHours(0, 0, 0, 0);
        
        const targetWeekEnd = new Date(targetWeekStart);
        targetWeekEnd.setDate(targetWeekStart.getDate() + 7);
        targetWeekEnd.setHours(0, 0, 0, 0);

        console.log(`Fetching attendance for week offset ${weekOffset}:`, targetWeekStart.toDateString(), 'to', targetWeekEnd.toDateString());

        for (const msg of messages.reverse()) { // Process newest first
            const msgDate = new Date(msg.ts * 1000);
            // Only include messages from the target week
            if (msgDate < targetWeekStart || msgDate >= targetWeekEnd) continue;
            const text = msg.text;
            // Parse Jibble messages: "Name *jibbled in/out* via ..."
            const match = text.match(/^(.+?) \*jibbled (in|out)\*/i);
            if (match) {
                let name = match[1].trim();
                // Apply name mapping if exists
                if (nameMap[name]) name = nameMap[name];
                const action = match[2].toLowerCase();
                // Only count 'jibbled in' for attendance, ignore 'jibbled out'
                if (action === 'in') {
                    // Check if check-in time is before or at 9:00 AM
                    const checkInHour = msgDate.getHours();
                    const checkInMinute = msgDate.getMinutes();
                    // If check-in is after 9:00 AM, mark as Absent
                    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
                    const status = isLate ? 'Absent' : 'Present';
                    const day = msgDate.toLocaleDateString('en-US', { weekday: 'long' });
                    if (!weeklyAttendance[day]) weeklyAttendance[day] = {};
                    // Update with latest status for the day
                    weeklyAttendance[day][name] = status;
                }
            }
        }
        // Also create current attendance map
        const currentAttendance = {};
        Object.keys(weeklyAttendance).forEach(day => {
            Object.keys(weeklyAttendance[day]).forEach(name => {
                currentAttendance[name] = weeklyAttendance[day][name];
            });
        });
        console.log('Current attendance:', currentAttendance);
        console.log('Weekly attendance:', weeklyAttendance);
        return { current: currentAttendance, weekly: weeklyAttendance };
    } catch (error) {
        console.error('Error fetching attendance from Slack:', error.message);
        return {};
    }
}

// Aggregate data
async function getEmployeesData(weekOffset = 0) {
    const users = await getSlackUsers();
    const tasksChannelId = await getChannelIdByName(process.env.SLACK_CHANNEL_ID);
    if (!tasksChannelId) {
        console.error('Tasks channel not found');
        return [];
    }
    const messages = await getChannelMessages(tasksChannelId);
    const { current: currentAttendance, weekly: weeklyAttendance } = await getAttendanceFromSlack(weekOffset);
    // Get news from general channel - only today's messages
    const newsChannelId = await getChannelIdByName(process.env.SLACK_NEWS_CHANNEL_ID);
    let news = [];
    if (newsChannelId) {
        const newsMessages = await getChannelMessages(newsChannelId, 50);
        const today = new Date().toDateString();
        news = newsMessages
            .filter(msg => new Date(msg.ts * 1000).toDateString() === today)
            .slice(0, 5)
            .map(msg => {
                const user = users.find(u => u.id === msg.user);
                const userName = user ? user.real_name || user.name : 'Unknown';
                return { text: msg.text, user: userName, timestamp: msg.ts };
            });
    }

    const employees = [];
    for (const user of users) {
        if (user.is_bot || user.deleted) continue;
        const profile = await getUserProfile(user.id);
        if (!profile || !profile.email) continue;
        const email = profile.email;

        // Tasks: filter messages by user or mentions
        const userMessages = messages.filter(msg => msg.user === user.id || msg.text.includes(`<@${user.id}>`));
        const today = new Date().toDateString();
        const todayTasks = userMessages.filter(msg => new Date(msg.ts * 1000).toDateString() === today).slice(0, 5).map(msg => ({
            text: msg.text,
            timestamp: msg.ts
        }));
        // This week: from Saturday to today
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() + 1) % 7); // Saturday
        startOfWeek.setHours(0, 0, 0, 0);
        const weekTasks = userMessages.filter(msg => new Date(msg.ts * 1000) >= startOfWeek).slice(0, 10).map(msg => ({
            text: msg.text,
            timestamp: msg.ts
        }));

        // Attendance: from Slack, default to Absent if no check-in this week
        const userAttendance = currentAttendance[user.real_name] || 'Absent';
        employees.push({
            id: user.id,
            name: user.real_name,
            email,
            photo: profile.image_192,
            role: profile.title || '',
            todayTasks,
            weekTasks,
            attendance: userAttendance
        });
    }
    return { employees, news, weeklyAttendance };
}

// API endpoint
app.get('/api/employees', async (req, res) => {
    try {
        const weekOffset = parseInt(req.query.weekOffset) || 0;
        const { employees, news, weeklyAttendance } = await getEmployeesData(weekOffset);
        res.json({ employees, news, weeklyAttendance, weekOffset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Real-time updates
let lastData = null;
setInterval(async () => {
    try {
        const data = await getEmployeesData(0); // Always update current week data
        if (!lastData || JSON.stringify(data) !== JSON.stringify(lastData)) {
            lastData = data;
            io.emit('update', data);
            console.log('Data updated, emitted to clients');
        }
    } catch (error) {
        console.error('Error in real-time update:', error);
    }
}, 30000); // Check for updates every 30 seconds