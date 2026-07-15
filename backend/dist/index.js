"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const employees_routes_1 = __importDefault(require("./modules/employees/employees.routes"));
const assets_routes_1 = __importDefault(require("./modules/assets/assets.routes"));
const asset_assignments_routes_1 = __importDefault(require("./modules/asset-assignments/asset-assignments.routes"));
const asset_requests_routes_1 = __importDefault(require("./modules/asset-requests/asset-requests.routes"));
const maintenance_routes_1 = __importDefault(require("./modules/maintenance/maintenance.routes"));
const activities_routes_1 = __importDefault(require("./modules/activities/activities.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const returns_routes_1 = __importDefault(require("./modules/returns/returns.routes"));
const app = (0, express_1.default)();
// ── Middleware ──────────────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(middleware_1.requestLogger);
// ── Routes ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/employees', employees_routes_1.default);
app.use('/api/assets', assets_routes_1.default);
app.use('/api/assignments', asset_assignments_routes_1.default);
app.use('/api/requests', asset_requests_routes_1.default);
app.use('/api/maintenance', maintenance_routes_1.default);
app.use('/api/activities', activities_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/returns', returns_routes_1.default);
// ── Error handlers ──────────────────────────────────────
app.use(middleware_1.notFoundHandler);
app.use(middleware_1.errorHandler);
// ── Start server ────────────────────────────────────────
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${config_1.config.nodeEnv}`);
});
