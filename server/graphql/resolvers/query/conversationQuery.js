const { Conversation } = require("../../../models/conversationModel");


const { ApolloError } = require("apollo-server-express");


module.exports = {
  findConversation: async (parent, args, context, info) => {
    const { _id } = args.fields;
    console.log("Query > findConversation > args.fields = ", args.fields);

    if (!_id) throw new ApolloError("ID is required")


    try {

      // find conversaiotn 
      let convData = await Conversation.findOne({ _id: _id });
      
      if (!convData) throw new ApolloError("Conversation not found")

      return convData;
      
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "findConversation",
        { component: "conversationQuery > findConversation" }
      );
    }
  },
  findConversations: async (parent, args, context, info) => {
    const { _id, userID, convKey, summaryReady} = args.fields;
    console.log("Query > findConversations > args.fields = ", args.fields);


    let searchQuery_and = [];
    let searchQuery = {};


    if (_id) {
      searchQuery_and.push({ _id: _id });
    }
    if (userID) {
      searchQuery_and.push({ userID: userID });
    } else if (convKey != undefined){
      searchQuery_and.push({ convKey: convKey });
    } else if (summaryReady != undefined) {
      searchQuery_and.push({ summaryReady: summaryReady });
    }

    if (searchQuery_and.length > 0) {
      searchQuery = {
        $and: searchQuery_and,
      };
    } else {
      searchQuery = {};
    }

    try {

      let convData = await Conversation.find(searchQuery);

      return convData;
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "findConversations",
        { component: "converstaionQuery > findConversations" }
      );
    }
  },
};