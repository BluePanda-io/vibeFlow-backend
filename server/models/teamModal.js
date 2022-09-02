const mongoose = require("mongoose");
require("dotenv").config();



const teamModalSchema = mongoose.Schema({

    name: String,
    description: String,

    serverID: [String],
    projectID: mongoose.Schema.ObjectId,
    memberID: [String],
    championID: [String],

    roles: [mongoose.Schema.ObjectId],
    initiatives: [mongoose.Schema.ObjectId],

    categoryDiscordlD: String,


});


const Team = mongoose.model("Team", teamModalSchema);
module.exports = { Team };
