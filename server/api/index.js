import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

//a wrapper so this same Express app can run on Vercel (serverless)