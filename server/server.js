import env from './config/env.js';
import connectDB from './config/db.js';
import bootstrap from './config/bootstrap.js';
import app from './app.js';

async function start() {
  bootstrap();

  await connectDB();

  app.listen(env.port, () => {
    console.log(`AzCuts server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
