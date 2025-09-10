import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './Config/db.js';
import authRoute from './Routes/auth.route.js';
import subjectRoute from './Routes/user.route.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); 
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use('/auth',authRoute);
app.use('/subject', subjectRoute);

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB connection error.');
    process.exit(1);
  }
};

start();