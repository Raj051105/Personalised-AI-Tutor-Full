import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser and useUnifiedTopology are default in mongoose v6+
        });
        console.log("Database connected");
    } catch (error) {
        console.error('Database connection error:', error);
        // Re-throw so callers can handle startup failure
        throw error;
    }
};

export default connectDB;