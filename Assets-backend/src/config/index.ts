import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'asset_management_db',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '424211',
  },
};
