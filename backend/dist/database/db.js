"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.checkDbConnection = checkDbConnection;
const pg_1 = require("pg");
const config_1 = require("../config");
exports.db = new pg_1.Pool({
    host: config_1.config.db.host,
    port: config_1.config.db.port,
    database: config_1.config.db.database,
    user: config_1.config.db.user,
    password: config_1.config.db.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.db.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
});
async function checkDbConnection() {
    try {
        const client = await exports.db.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    }
    catch {
        return false;
    }
}
