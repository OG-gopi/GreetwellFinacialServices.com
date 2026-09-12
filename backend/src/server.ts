import app from './app';
import { CONFIG } from './config';

const server = app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Financial Portal Backend Server running on port ${CONFIG.PORT} in ${CONFIG.NODE_ENV} mode.`);
  console.log(`📡 API Base URL: ${CONFIG.API_URL}/api`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
