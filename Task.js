const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED"], 
    default: "PENDING" 
  },
  priority: { 
    type: String, 
    enum: ["LOW", "MEDIUM", "HIGH"], 
    default: "LOW" 
  },
  dueDate: Date
});

module.exports = mongoose.model("Task", taskSchema);
