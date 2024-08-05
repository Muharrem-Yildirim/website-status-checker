# Website Status Checker

This is a simple script to check if the website is up and running. When it's not, it will send a notification to a Telegram bot.

## How to deploy?

1. Copy .env.example and rename it to .env and fill it with your credentials.

2. Run the following commands:

   ```bash
   npm install
   npm run build
   npm start
   ```

## TODO

- Add more notificators [ex: Discord, Slack, SMTP etc..]
- UI
- ~~Multiple domain check mechanism~~
