const { Client, Intents, WebhookClient } = require('discord.js');
require('dotenv').config();

const axios = require('axios').default;

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

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

ws.on('message', async (data) => {
  const parsed = JSON.parse(data);
  console.log(parsed.event_data.broadcaster_user_login);

  const res = await axios({
    method: 'get',
    url: `https://tau-usenameaodhan.up.railway.app/api/twitch/helix/users?login=${parsed.event_data.broadcaster_user_login}`,
    headers: { Authorization: `Token ${process.env.TAU_TOKEN}` },
  });

  const event = res.data;
  console.log(event);
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
