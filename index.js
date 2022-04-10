const { Client, Intents, WebhookClient, MessageEmbed } = require('discord.js');
require('dotenv').config();
const axios = require('axios').default;

const express = require('express');
const app = express();
const port = 3000;
const tmi = require('tmi.js');

const tmiClient = new tmi.Client({
  channels: ['jlengstorf'],
});

const WebSocket = require('ws');

const webhookClient = new WebhookClient({
  url: process.env.WEBHOOK_URL_LWJ,
});

const ws = new WebSocket(
  'wss://tau-usenameaodhan.up.railway.app:443/ws/twitch-events/',
  {
    perMessageDeflate: false,
  }
);

(async function handleWS() {
  ws.on('open', () => {
    console.log('Connected to websocket');
    ws.send(JSON.stringify({ token: process.env.TAU_TOKEN }));
  });

  ws.on('message', async (data) => {
    const tauData = JSON.parse(data);

    if (tauData.event_type === 'stream-offline') return;

    const stream = await axios({
      method: 'get',
      url: `https://tau-usenameaodhan.up.railway.app/api/twitch/helix/streams?user_login=${tauData.event_data.broadcaster_user_login}`,
      headers: { Authorization: `Token ${process.env.TAU_TOKEN}` },
    }).then((res) => {
      return res.data.data;
    });

    const schedule = await axios({
      method: 'get',
      url: 'https://www.learnwithjason.dev/api/schedule',
    });

    const epData = schedule.data;

    const streamEmbed = new MessageEmbed()
      .setTitle(`${stream[0].title}`)
      .setDescription(`${epData[0].description}`)
      .setURL(`https://www.twitch.tv/${stream[0].user_name}`)
      .setImage(
        `https://www.learnwithjason.dev/${epData[0].slug.current}/schedule.jpg`
      );

    webhookClient.send({
      content: `${stream[0].user_name} is now streaming!`,
      embeds: [streamEmbed],
    });

    console.log(`${stream[0].user_name} is now streaming!`);
  });

  ws.on('close', () => {
    console.log('Websocket is disconected, attempting reconnection...');
    handleWS();
  });
})();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

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

client.on('ready', (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
