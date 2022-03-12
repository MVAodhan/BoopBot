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
    ws: 'wss://tau-usenameaodhan.up.railway.app:443/ws/twitch-events/',
  }
);

client.on('ready', (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

webhookClient.send('Webhook withou client');

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply({
      content: 'pong',
    });
  }
});

client.on('webhookUpdate', (webhook) => {
  console.log(webhook);
});

client.login(process.env.BOT_TOKEN);
