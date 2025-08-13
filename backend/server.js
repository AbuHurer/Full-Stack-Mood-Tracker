import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Mood Schema
const moodSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  mood: String,
  note: String
});
const Mood = mongoose.model("Mood", moodSchema);

// Routes
app.post("/mood", async (req, res) => {
  const { mood, note } = req.body;
  const newMood = new Mood({ mood, note });
  await newMood.save();
  res.json(newMood);
});

app.get("/mood", async (req, res) => {
  const moods = await Mood.find().sort({ date: 1 });
  res.json(moods);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
