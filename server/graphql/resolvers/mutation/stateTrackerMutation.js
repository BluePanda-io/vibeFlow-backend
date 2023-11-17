const { StateTracker } = require("../../../models/stateTrackerModel");

const { printC } = require("../../../printModule");

const { ApolloError } = require("apollo-server-express");

module.exports = {
  saveStateValue: async (parent, args, context, info) => {
    const {userID,name,type,value,timeStamp,} = args.fields;
    console.log("Mutation > saveStateValue > args.fields = ", args.fields);

    if (value > 10 || value < 0) {
      throw new ApolloError(
        "Value must be between 0 and 10",
        "VALUE_OUT_OF_RANGE",
        { component: "stateTrackerMutation > saveStateValue" }
      );
    }

    try {

      let filter = {
        userID: userID,
        name: name,
        type: type,
        value: value,
      };
      if (!timeStamp) {
        filter = { 
          timeStamp: new Date()
        }
      }

      // create StateTracker on Mongo based on filter
      const stateTrackerData = await StateTracker.create({
        userID: userID,
        name: name,
        type: type,
        value: value,
        timeStamp: filter.timeStamp,
      });

      stateTrackerData.save()

      printC(stateTrackerData, "1", "stateTrackerData", "b")



      return stateTrackerData
    } catch (err) {
      printC(err, "-1", "err", "r");
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerMutation > saveStateValue" }
      );
    }
  },
  deleteStateTrackData: async (parent, args, context, info) => {
    const {userID,type,} = args.fields;
    console.log("Mutation > deleteStateTrackData > args.fields = ", args.fields);

    
    try {

      let filter = {}

      if (userID) filter.userID = userID
      if (type) filter.type = type

      const stateTrackerData = await StateTracker.deleteMany(filter);

      printC(stateTrackerData, "1", "stateTrackerData", "b")

      return stateTrackerData


    } catch (err) {
      printC(err, "-1", "err", "r");
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerMutation > deleteStateTrackData" }
      );
    }
  },
  createFakeStateTrackerData: async (parent, args, context, info) => {
    const {userID,name,type,numberOfFakeData,valueMin,valueMax,startDate,endDate} = args.fields;
    console.log("Mutation > createFakeStateTrackerData > args.fields = ", args.fields);



    try {

      stateTrackerDataAll = []


      for (let i = 0; i < numberOfFakeData; i++) {
        let filter = {
          userID: userID,
          name: name,
          type: type,
          value: Math.floor(Math.random() * (valueMax - valueMin + 1) + valueMin),
        };
        
        // Convert the start and end dates from strings to Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (startDateObj == "Invalid Date" || endDateObj == "Invalid Date") {
          throw new ApolloError(
            "Invalid Date",
            "INVALID_DATE",
            { component: "stateTrackerMutation > createFakeStateTrackerData" }
          );
        }

        // Calculate the difference in milliseconds between the start and end dates
        const dateDifference = endDateObj.getTime() - startDateObj.getTime();


        // Generate a random date between the start and end dates
        const randomDate = new Date(startDateObj.getTime() + Math.random() * dateDifference);

        // Assign the random date to the timeStamp property of the filter object
        filter.timeStamp = randomDate;

        // create StateTracker on Mongo based on filter
        const stateTrackerData = await StateTracker.create({
          userID: userID,
          name: name,
          type: type,
          value: filter.value,
          timeStamp: filter.timeStamp,
        });

        stateTrackerDataAll.push(stateTrackerData)
    
        stateTrackerData.save()
    
        printC(stateTrackerData, "1", "stateTrackerData", "b")
      }

     

      return stateTrackerDataAll
    } catch (err) {
      printC(err, "-1", "err", "r");
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerMutation > createFakeStateTrackerData" }
      );
    }
  },
};
