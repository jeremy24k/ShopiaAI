import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.listen(PORT, () => {
  console.log(`🚀 Bible API Backend v1.0.0 running on port ${PORT}`);
  console.log(`🔒 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});
