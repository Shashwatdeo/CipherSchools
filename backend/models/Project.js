const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  content: String,
});

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  name: String,
  files: [fileSchema],
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
