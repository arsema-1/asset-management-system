"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
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
    smtp: {
        host: process.env.SMTP_HOST ?? 'sandbox.smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT ?? '2525', 10),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        fromAddress: process.env.SMTP_FROM ?? 'noreply@assetflow.com',
        fromName: process.env.SMTP_FROM_NAME ?? 'AssetFlow Systems',
    },
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
};
