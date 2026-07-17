import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import routes from './routes/index.js';
import errorHandler from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// 1. FIXED CORS: Allow all origins in production, or fallback to clientOrigin
const allowedOrigin = env.nodeEnv === 'production' ? true : env.clientOrigin;

app.use(helmet({
  contentSecurityPolicy: false, // Prevents Helmet from blocking Vite asset scripts
}));
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
app.use(generalLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', routes);

// 2. ADDED: Serve Vite production assets (Place right AFTER API routes, but BEFORE error handler)
if (env.nodeEnv === 'production') {
  app.use(express.static(path.resolve(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

export default app;
