const { Client, Intents, WebhookClient } = require('discord.js');
require('dotenv').config();

const axios = require('axios').default;

const WebSocket = require('ws');

const webhookClient = new WebhookClient({
  url: process.env.WEBHOOK_URL,
});

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
  const parsedData = JSON.parse(data);

  if (parsedData.event_type === 'stream-offline') return;

  const stream = await axios({
    method: 'get',
    url: `https://tau-usenameaodhan.up.railway.app/api/twitch/helix/streams?user_login=${parsedData.event_data.broadcaster_user_login}`,
    headers: { Authorization: `Token ${process.env.TAU_TOKEN}` },
  }).then((res) => {
    return res.data.data;
  });
  console.log(stream[0].user_name);
  webhookClient.send({
    content: `${stream[0].user_name} is now streaming!`,
    embeds: [
      {
        title: `${stream[0].title}`,
        thumbnail: {
          url: 'https://images.unsplash.com/photo-1647164925200-54d1939ada1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
        },
      },
    ],
  });
});

client.login(process.env.BOT_TOKEN);
