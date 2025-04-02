import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MessageSchema = new mongoose.Schema({
  name: String,
  message: String,
  textColor: String,
  bgColor: String,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/favicon.ico", express.static(path.join("public", "favicon.ico")));

app.get("/", (req, res) => {
  res.send("servidor rodando.");
});

app.post("/messages", upload.single("image"), async (req, res) => {
  const { name, message, textColor, bgColor } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !message) {
    return res.status(400).json({ error: "assine corretamente." });
  }

  const newMessage = new Message({
    name,
    message,
    textColor: textColor || "#fff",
    bgColor: bgColor || "#333",
    imageUrl,
  });

  await newMessage.save();
  res.status(201).json({ success: true, data: newMessage });
});

app.get("/messages", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 });
  res.json({ success: true, messages });
});

app.delete("/messages/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`servidor rodando em http://localhost:${port}`);
});
