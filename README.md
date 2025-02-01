# IP Quality Checker Telegram Bot

A Telegram bot that checks IP addresses for potential security risks using the IPQualityScore API.

## Features

- Automatically detect user's IP address
- Check IP quality and fraud score
- Detailed risk assessment
- Additional IP information (country, ISP, proxy detection, etc.)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Create a `.env` file in the root directory
- Add your Telegram Bot Token (get it from @BotFather):
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
IPQUALITYSCORE_API_KEY=your_api_key_here
```

3. Start the bot:
```bash
npm start
```

## Usage

- `/start` - Start the bot and get welcome message
- `/check` - Check your current IP address
- Send any IP address to check its quality

## Risk Assessment

The bot uses the following risk thresholds:
- ≥90: Frequent Abusive Behavior
- ≥85: High Risk
- ≥75: Suspicious
- <75: Low Risk
