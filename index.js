const { Client, Intents, WebhookClient } = require('discord.js');
require('dotenv').config();

const WebSocket = require('ws');

const ws = new WebSocket(
  'wss://tau-usenameaodhan.up.railway.app:443/ws/twitch-events/',
  {
    perMessageDeflate: false,
  }
);

ws.on('open', () => {
  console.log('Connected to websocket');
  ws.send(JSON.stringify({ token: process.env.TAU_TOKEN }));
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
});

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// webhookClient.send('Webhook without client');

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply({
      content: 'pong',
    });
  }
});

client.login(process.env.BOT_TOKEN);
