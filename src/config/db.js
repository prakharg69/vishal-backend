import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://VishalKumar:4ia4mhkOG50fo8KC@qrso.jj36hx8.mongodb.net/");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
