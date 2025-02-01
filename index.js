require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Create a bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Function to get risk assessment message
function getRiskAssessment(fraudScore) {
    if (fraudScore >= 90) {
        return '⛔ Frequent Abusive Behavior - Has demonstrated frequent abusive behavior over the past 24-72 hours.';
    } else if (fraudScore >= 85) {
        return '🚨 High Risk - Has suspicious behavior signals.';
    } else if (fraudScore >= 75) {
        return '⚠️ Suspicious - Has had previous reputation issues or is using a low risk proxy/VPN.';
    } else {
        return '✅ Low Risk - This IP appears to be safe.';
    }
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to IP Quality Checker Bot! 🔍\n\nSend me an IP address to check its quality, or use /check to analyze your current IP address.');
});

// Handle /check command
bot.onText(/\/check/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Get user's IP address with cache-busting
        const timestamp = new Date().getTime();
        const ipResponse = await axios.get(`http://api.ipify.org?format=json&_=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const userIP = ipResponse.data.ip;

        // Send a loading message
        const loadingMessage = await bot.sendMessage(chatId, '🔍 Analyzing your IP address...');

        // Check IP quality
        const apiKey = process.env.IPQUALITYSCORE_API_KEY;
        const qualityResponse = await axios.get(`https://ipqualityscore.com/api/json/ip/${apiKey}/${userIP}`);
        const data = qualityResponse.data;

        // Prepare the response message
        const riskAssessment = getRiskAssessment(data.fraud_score);
        const message = `📊 <b>IP Quality Report for ${userIP}</b>\n\n` +
            `<blockquote>🌍 Country: ${data.country_code}</blockquote>\n` +
            `<blockquote>🏢 ISP: ${data.ISP}</blockquote>\n` +
            `<blockquote>${riskAssessment}</blockquote>\n` +
            `<b>Additional Details:</b>\n` +
            `<blockquote>🔒 Proxy/VPN/Tor: ${data.proxy ? 'Yes' : 'No'}</blockquote>\n` +
            `<blockquote>📱 Mobile: ${data.mobile ? 'Yes' : 'No'}</blockquote>`;

        // Edit the loading message with the results
        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: loadingMessage.message_id,
            parse_mode: 'HTML'
        });

    } catch (error) {
        bot.sendMessage(chatId, '❌ Error occurred while checking IP quality. Please try again later.');
        console.error('Error:', error.message);
    }
});

// Handle IP address messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Skip commands and non-text messages
    if (!text || typeof text !== 'string') return;
    if (text.startsWith('/')) return;

    // Simple IP address validation regex
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(text)) {
        return bot.sendMessage(chatId, '❌ Please send a valid IP address or use /check to analyze your current IP.');
    }

    try {
        // Send a loading message
        const loadingMessage = await bot.sendMessage(chatId, '🔍 Analyzing the IP address...');

        // Check IP quality
        const apiKey = process.env.IPQUALITYSCORE_API_KEY;
        const response = await axios.get(`https://ipqualityscore.com/api/json/ip/${apiKey}/${text}`);
        const data = response.data;

        // Prepare the response message
        const riskAssessment = getRiskAssessment(data.fraud_score);
        const message = `📊 <b>IP Quality Report for ${text}</b>\n\n` +
        `<blockquote>🌍 Country: ${data.country_code}</blockquote>\n` +
        `<blockquote>🏢 ISP: ${data.ISP}</blockquote>\n` +
        `<blockquote>${riskAssessment}</blockquote>\n` +
        `<b>Additional Details:</b>\n` +
        `<blockquote>🔒 Proxy/VPN/Tor: ${data.proxy ? 'Yes' : 'No'}</blockquote>\n` +
        `<blockquote>📱 Mobile: ${data.mobile ? 'Yes' : 'No'}</blockquote>`;

        // Edit the loading message with the results
        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: loadingMessage.message_id,
            parse_mode: 'HTML'
        });

    } catch (error) {
        bot.sendMessage(chatId, '❌ Error occurred while checking IP quality. Please try again later.');
        console.error('Error:', error.message);
    }
});

console.log('Bot is running...');
