const { StateTracker } = require("../../../models/stateTrackerModel");

const { printC } = require("../../../printModule");
const { ApolloError } = require("apollo-server-express");

module.exports = {
  findStateValues: async (parent, args, context, info) => {
    const { userID,name,type,startDate,endDate } = args.fields;
    console.log("Query > findStateValues > args.fields = ", args.fields);

    try {

      let filter = {}

      if (userID) filter.userID = userID
      if (name) filter.name = name
      if (type) filter.type = type

      if (startDate && endDate) filter.timeStamp = { $gte: startDate, $lte: endDate }
      else if (startDate) filter.timeStamp = { $gte: startDate }
      else if (endDate) filter.timeStamp = { $lte: endDate }
      

      printC(filter, "1", "filter", "b")

      

      const stateValuesData = await StateTracker.find({
        ...filter,
        timeStamp: filter.timeStamp ? filter.timeStamp : undefined,
      });

      return stateValuesData;
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerQuery > findStateValues" }
      );
    }
  },
  showChartStateValues: async (parent, args, context, info) => {
    const {userID,name,type,startDate,endDate,numberChartPoints} = args.fields;
    console.log("Mutation > showChartStateValues > args.fields = ", args.fields);



    try {
      let filter = {}

      if (userID) filter.userID = userID
      if (name) filter.name = name
      if (type) filter.type = type

      if (startDate && endDate) filter.timeStamp = { $gte: startDate, $lte: endDate }
      else if (startDate) filter.timeStamp = { $gte: startDate }
      else if (endDate) filter.timeStamp = { $lte: endDate }

      const stateTrackerDataAll = await StateTracker.find({
        ...filter,
        timeStamp: filter.timeStamp ? filter.timeStamp : undefined,
      });

      // printC(stateTrackerDataAll, "1", "stateTrackerDataAll", "b")
      // f1

      
      // split the startDate - endDate into numberChartPoints
      let startDateObj = new Date(startDate)
      let endDateObj = new Date(endDate)
      let difference = endDateObj.getTime() - startDateObj.getTime()

      let interval = difference / numberChartPoints

      let stateTrackerArea = []

      for (let i = 0; i < numberChartPoints; i++) {
        let timeStamp = new Date(startDateObj.getTime() + interval * i)
        let stateTrackerData = stateTrackerDataAll.filter((stateTrackerData) => {
          return stateTrackerData.timeStamp.getTime() >= timeStamp.getTime() && stateTrackerData.timeStamp.getTime() < timeStamp.getTime() + interval
        })

        let stateTrackerDataValue = 0
        if (stateTrackerData.length > 0) {
          stateTrackerDataValue = stateTrackerData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) / stateTrackerData.length
        }

        stateTrackerArea.push({
          timeStamp: timeStamp,
          value: stateTrackerDataValue
        })
      }

      printC(stateTrackerArea, "1", "stateTrackerArea", "b")


     

      return stateTrackerArea
    } catch (err) {
      printC(err, "-1", "err", "r");
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerMutation > showChartStateValues" }
      );
    }
  },
};
