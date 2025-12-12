import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB Connection Error: Missing connection string");
    process.exit(1);
  }

  try {
    const { connection } = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${connection.host}`);
    return connection;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;