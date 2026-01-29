require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Slack API functions
async function getSlackUsers() {
    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/users.list', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.ok) throw new Error(response.data.error);
        return response.data.members;
    } catch (error) {
        console.error('Error fetching Slack users:', error.message);
        return [];
    }
}

async function getUserProfile(userId) {
    try {
        const token = process.env.SLACK_BOT_TOKEN;
        const response = await axios.get('https://slack.com/api/users.profile.get', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user: userId }
        });
        if (!response.data.ok) throw new Error(response.data.error);
        return response.data.profile;
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
async function getAttendanceFromSlack() {
    try {
        const channelName = process.env.SLACK_ATTENDANCE_CHANNEL_ID;
        const channelId = await getChannelIdByName(channelName);
        if (!channelId) {
            console.error('Attendance channel not found');
            return {};
        }
        const messages = await getChannelMessages(channelId, 200); // Get more messages
        console.log('Messages fetched for attendance:', messages.length);
        const weeklyAttendance = {};
        // Name mapping for mismatches between Jibble and Slack names
        const nameMap = {
            "Nawid Sanginzai": "فدایی صاحب"
            // Add more mappings as needed
        };

        // Get start of week (Saturday)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() + 1) % 7);
        startOfWeek.setHours(0, 0, 0, 0);

        for (const msg of messages.reverse()) { // Process newest first
            const msgDate = new Date(msg.ts * 1000);
            if (msgDate < startOfWeek) continue; // Only this week's messages
            const text = msg.text;
            // Parse Jibble messages: "Name *jibbled in/out* via ..."
            const match = text.match(/^(.+?) \*jibbled (in|out)\*/i);
            if (match) {
                let name = match[1].trim();
                // Apply name mapping if exists
                if (nameMap[name]) name = nameMap[name];
                const action = match[2].toLowerCase();
                const status = action === 'in' ? 'Present' : 'Absent';
                const day = msgDate.toLocaleDateString('en-US', { weekday: 'long' });
                if (!weeklyAttendance[day]) weeklyAttendance[day] = {};
                // Update with latest status for the day
                weeklyAttendance[day][name] = status;
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
async function getEmployeesData() {
    const users = await getSlackUsers();
    const tasksChannelId = await getChannelIdByName(process.env.SLACK_CHANNEL_ID);
    if (!tasksChannelId) {
        console.error('Tasks channel not found');
        return [];
    }
    const messages = await getChannelMessages(tasksChannelId);
    const { current: currentAttendance, weekly: weeklyAttendance } = await getAttendanceFromSlack();
    // Get news from general channel
    const newsChannelId = await getChannelIdByName(process.env.SLACK_NEWS_CHANNEL_ID);
    let news = [];
    if (newsChannelId) {
        const newsMessages = await getChannelMessages(newsChannelId, 10);
        news = newsMessages.slice(0, 5).map(msg => {
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
        const { employees, news, weeklyAttendance } = await getEmployeesData();
        res.json({ employees, news, weeklyAttendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));