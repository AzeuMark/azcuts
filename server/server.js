import { createServer } from 'http';
import env from './config/env.js';
import connectDB from './config/db.js';
import bootstrap from './config/bootstrap.js';
import { initSocket } from './socket/index.js';
import app from './app.js';

async function start() {
  await connectDB();
  await bootstrap();

  const server = createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`AzCuts server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
