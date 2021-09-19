/* eslint consistent-return:0 import/order:0 */

const express = require('express');
const logger = require('./logger');

const argv = require('./argv');
const port = require('./port');
const WebSocket = require('ws');
const url = require('url');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;
const { resolve } = require('path');
const app = express();

const createEvent = (id, time) => ({
  event_id: id,
  user_id: 456,
  app_id: 789,
  time,
  data: {
    ip_address: '192.168.1.1',
    path: 'https://example.com',
    type: 'click',
  },
});

const shipEventBatch = (socket, batchSize) => {
  const event = createEvent(0, 0);
  socket.send('[', { fin: false });
  for (let i = 1; i <= batchSize; i += 1) {
    event.event_id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    event.time = +Date.now();
    event.data.path = `https://example.com/${Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER,
    )}`;
    socket.send(JSON.stringify(event) + (i !== batchSize ? ',' : ']'), {
      fin: i === batchSize,
    });
  }
};

const maxEventsPerSecondDefault = 5000;
const batchSizeDefault = 1000;

const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', socket => {
  console.log('websocket.connection');
  let interval;
  socket.on('message', message => {
    const messageJSON = JSON.parse(`${message}`);
    if (messageJSON.type === 'hello') {
      const maxEventsPerSecond =
        messageJSON.maxEventsPerSecond || maxEventsPerSecondDefault;
      const batchSize = messageJSON.batchSize || batchSizeDefault;

      console.log('websocket.connection.message: hello');
      interval = setInterval(() => {
        shipEventBatch(socket, batchSize);
      }, 1000 / (maxEventsPerSecond / batchSize));
    }
  });
  socket.on('close', () => {
    if (interval != null) {
      clearInterval(interval);
    }
    console.log('socket closed');
  });
});

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', websocketApi);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});

// Start your app.
const server = app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let ngrokUrl;
    try {
      ngrokUrl = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, ngrokUrl);
  } else {
    logger.appStarted(port, prettyHost);
  }
});

server.on('upgrade', (request, socket, head) => {
  const { path } = url.parse(request.url);
  console.log(`websocket upgrade request ${path}`);
  if (path === '/api/websocket') {
    wss.handleUpgrade(request, socket, head, (s, r) => {
      wss.emit('connection', s, r);
    });
  } else {
    socket.destroy();
  }
});
