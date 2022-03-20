const { Client, Intents, WebhookClient } = require('discord.js');
require('dotenv').config();

const tmi = require('tmi.js');

const tmiClient = new tmi.Client({
  channels: ['jlengstorf'],
});

const axios = require('axios').default;

const WebSocket = require('ws');

const webhookClient = new WebhookClient({
  url: process.env.WEBHOOK_URL_ATS,
});

const ws = new WebSocket(
  'wss://tau-usenameaodhan.up.railway.app:443/ws/twitch-events/',
  {
    perMessageDeflate: false,
  }
);

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const express = require('express');
const app = express();
const port = 3000;

app.get('/health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };

  res.status(200).send(data);
});

tmiClient.connect();

tmiClient.on('message', (channel, tags, message, self) => {
  if (tags['display-name'] === 'jlengstorf' && message.startsWith('https')) {
    webhookClient.send({
      content: `${message}`,
    });
  }
});

ws.on('open', () => {
  console.log('Connected to websocket');
  ws.send(JSON.stringify({ token: process.env.TAU_TOKEN }));
});

client.on('ready', (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

ws.on('message', async (data) => {
  const parsedData = JSON.parse(data);

  if (parsedData.event_type === 'stream-offline') return;

  const stream = await axios({
    method: 'get',
    url: `https://tau-usenameaodhan.up.railway.app/api/twitch/helix/streams?user_login=${process.env.TEST_STREAMER}`,
    headers: { Authorization: `Token ${process.env.TAU_TOKEN}` },
  }).then((res) => {
    return res.data.data;
  });
  // ${parsedData.event_data.broadcaster_user_login}

  const schedule = await axios({
    method: 'get',
    url: 'https://www.learnwithjason.dev/api/schedule',
  });

  const epData = schedule.data;

  webhookClient.send({
    content: `${stream[0].user_name} is now streaming!`,
    embeds: [
      {
        title: `${stream[0].title}`,
        description: `${epData[0].description}`,
        url: `https://www.twitch.tv/${stream[0].user_name}`,
        image: {
          url: `https://www.learnwithjason.dev/${epData[0].slug.current}/schedule.jpg`,
        },
      },
    ],
  });

  console.log(`${stream[0].user_name} is now streaming!`);
});

client.login(process.env.BOT_TOKEN);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
