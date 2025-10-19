const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Project = require("./models/Project");
const User = require("./models/User");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB error:", err));

// --- Routes ---

// Save new project
app.post("/api/projects", async (req, res) => {
  try {
    const { projectId, name, files } = req.body;
    let existing = await Project.findOne({ projectId });
    if (existing) return res.status(400).json({ message: "ProjectId already exists" });

    const project = new Project({ projectId, name, files });
    await project.save();
    res.status(201).json({ message: "Project saved", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get project by projectId
app.get("/api/projects/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update project by projectId
app.put("/api/projects/:projectId", async (req, res) => {
  try {
    const { name, files } = req.body;
    const project = await Project.findOneAndUpdate(
      { projectId: req.params.projectId },
      { name, files },
      { new: true, upsert: true }
    );
    res.json({ message: "Project updated", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();
    const token = jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) return res.status(400).json({ message: "Missing credentials" });
    const user = await User.findOne(username ? { username } : { email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth: Me
app.get("/api/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select("username email");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("CipherStudio Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
