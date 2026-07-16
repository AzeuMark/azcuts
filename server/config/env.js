import 'dotenv/config';

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTTL: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  defaultTz: process.env.DEFAULT_TZ || 'Asia/Manila',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;
