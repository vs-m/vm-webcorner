import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
const port = 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'"
  );
  next();
});

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/favicon.ico", express.static(path.join("public", "favicon.ico")));

const messages = [];

app.get("/", (req, res) => {
  res.send("servidor rodando.");
});

app.post("/messages", upload.single("image"), (req, res) => {
  const { name, message, textColor, bgColor } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !message) {
    return res.status(400).json({ error: "assine corretamente." });
  }

  const newMessage = {
    name,
    message,
    textColor: textColor || "#fff",
    bgColor: bgColor || "#333",
    imageUrl,
    timestamp: new Date(),
  };

  messages.unshift(newMessage);

  console.log("nova mensagem:", newMessage);
  res.status(201).json({ success: true, data: newMessage });
});

app.get("/messages", (req, res) => {
  res.json({ success: true, messages });
});

app.listen(port, () => {
  console.log(`servidor rodando em http://localhost:${port}`);
});
