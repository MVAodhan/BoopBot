const { Client, Intents, WebhookClient } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const webhookClient = new WebhookClient(
  {
    id: process.env.WEBHOOK_ID,
    token: process.env.WEBHOOK_TOKEN,
  },
  {
    ws: 'ws://tau-usenameaodhan.up.railway.app/ws/twitch-events/',
  }
);

client.on('ready', () => {
  console.log('Ready!');
});

webhookClient.send('hello from the webhook');

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply({
      content: 'pong',
    });
  }
});

client.login(process.env.BOT_TOKEN);
