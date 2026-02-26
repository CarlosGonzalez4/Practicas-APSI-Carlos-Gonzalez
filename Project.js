const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },           
  description: { type: String },                    
  startDate: { type: Date, required: true },       
  endDate: { type: Date, required: true },         
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },  
  members: [{ type: Schema.Types.ObjectId, ref: "User" }]               
});

module.exports = mongoose.model("Project", projectSchema);
