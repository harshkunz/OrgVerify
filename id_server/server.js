import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './config/orgIdDb.js';
import orgIdRouter from './routes/orgIdRoutes.js';
import Counter from './models/Counter.js';

dotenv.config();

const PORT = process.env.PORT || 7000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Parse CORS origins from environment variable
const corsOriginStr = process.env.CORS_ORIGIN;
const corsOrigins = corsOriginStr 
  ? corsOriginStr.split(',').map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:5000"];

const app = express();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use('/id', orgIdRouter);


app.get("/", (req, res) => {
  res.send("Organization ID API running...")
})


// Initialize Counter
const initializeCounter = async () => {
  const existingCounter = await Counter.findOne({ id: 'orgId' });
  if (!existingCounter) {
    await Counter.create({ id: 'orgId', seq: 0 });
    console.log('Counter initialized for orgId');
  }
};



app.listen(PORT, async () => {
  try {
    await connectDB();
    await initializeCounter();
    console.log(`Organization ID Server running on port ${PORT} (${NODE_ENV})`);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
});


