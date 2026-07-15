import express from 'express';
import cors from 'cors';
import { config } from './config';
import { requestLogger, errorHandler, notFoundHandler } from './middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import employeesRoutes from './modules/employees/employees.routes';
import assetsRoutes from './modules/assets/assets.routes';
import assetAssignmentsRoutes from './modules/asset-assignments/asset-assignments.routes';
import assetRequestsRoutes from './modules/asset-requests/asset-requests.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import reportsRoutes from './modules/reports/reports.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Routes ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/assignments', assetAssignmentsRoutes);
app.use('/api/requests', assetRequestsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// ── Error handlers ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start server ────────────────────────────────────────
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
});
