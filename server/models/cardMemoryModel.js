const mongoose = require("mongoose");
require("dotenv").config();

const cardMemoryModel = mongoose.Schema({
  content: String,
  scoreCriteria: String,
  priority: Number,
  tradeOffBoost: Number,
  type: {
    type: String,
    enum: ["TECHNICAL_SKILLS","SOFT_SKILLS","BEHAVIOR","EXPERIENCE","INDUSTRY_KNOWLEDGE","DOMAIN_EXPERTISE","INTERESTS","CORE_VALUES","GOALS","EDUCATION","OTHER"], // ScoreCard = Checks and Balances
  },
  authorCard: {
    companyID: String,
    positionID: String,
    userID: String,
    category: {
      type: String,
      enum: ["COMPANY","POSITION","CANDIDATE"],
    },
  },
  score: {
    overall: Number,
    reason: String,
    agent: [{
      category: {
        type: String,
        enum: ["CREDIBILITY","CONSISTENCY","ALIGNMENT","EXPERT","GENERAL"], 
      },
      score: Number,
      reason: String,
    }]
  },
  connectedCards: [{
    cardID: mongoose.Schema.ObjectId,
    score: Number,
    reason: String,
    agent: [{
      category: {
        type: String,
        enum: ["CREDIBILITY","CONSISTENCY","ALIGNMENT","EXPERT","GENERAL"], 
      },
      score: Number,
      reason: String,
    }]
  }],
  keyPriority: Boolean,
  futurePotential: Boolean,
  pineconeDB: {
    pineconeID: String,
    text: String,
    metadata: {
      label: String,
      database: String,
      positionID: String,
      userID: String,
    }
  }


});

const CardMemory = mongoose.model("CardMemory", cardMemoryModel);
module.exports = { CardMemory };
