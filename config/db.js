import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connectDB.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
