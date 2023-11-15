const mongoose = require("mongoose");
require("dotenv").config();

const stateTrackerSchema = mongoose.Schema({
  userID: String,
  name: String,
  type: {
    type: String,
    enum: ["ENERGY", "HAPPINESS", "PRODUCTIVITY", "STRESS"],
  },
  value: Number,
  timeStamp: Date,
  
});

const StateTracker = mongoose.model("StateTracker", stateTrackerSchema);
module.exports = { StateTracker };
