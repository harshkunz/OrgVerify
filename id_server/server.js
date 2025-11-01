import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './config/orgIdDb.js';
import orgIdRouter from './routes/orgIdRoutes.js';
import Counter from './models/Counter.js';
dotenv.config()

const PORT =  process.env.PORT || 6000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://bonga-university-graduate-document.onrender.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/org-ids', orgIdRouter);


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



app.listen(PORT, () => {
  connectDB();
  initializeCounter(); // Initialize the counter when the server starts
  console.log(`Organization ID Server running on port http://localhost:${PORT}`);
});


