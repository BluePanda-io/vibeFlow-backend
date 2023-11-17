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
  findStateChartOptimalInfo: async (parent, args, context, info) => {
    const { userID,type } = args.fields;
    console.log("Query > findStateChartOptimalInfo > args.fields = ", args.fields);


    if (!userID || !type) {
      throw new ApolloError(
        "userID and type must be provided",
        "USERID_NOT_PROVIDED",
        { component: "stateTrackerQuery > findStateChartOptimalInfo" }
      );
    }

    let chartMinDate, chartMaxDate, chartStartDate, chartEndDate, chartPoints


    try {

      let filter = {
        userID: userID,
        type: type,
      };

      const stateTrackerDataAll = await StateTracker.find({
        ...filter,
      });

      if (stateTrackerDataAll.length === 0) {
        return {
          chartPoints: -1,
          chartMinDate: new Date(),
          chartMaxDate: new Date(),
          chartStartDate: new Date(),
          chartEndDate: new Date(),
        }
      }

      // find min and max date
      

      for (let i = 0; i < stateTrackerDataAll.length; i++) {
        if (!chartMinDate || stateTrackerDataAll[i].timeStamp.getTime() < chartMinDate.getTime()) {
          chartMinDate = stateTrackerDataAll[i].timeStamp
          // chartMinDate = new Date(stateTrackerDataAll[i].timeStamp.getTime() - 24 * 60 * 60 * 1000);
        }
        if (!chartMaxDate || stateTrackerDataAll[i].timeStamp.getTime() > chartMaxDate.getTime()) {
          // chartMaxDate = stateTrackerDataAll[i].timeStamp
          chartMaxDate = new Date(stateTrackerDataAll[i].timeStamp.getTime() + 60 * 1000);
        }
      }

      chartEndDate = chartMaxDate

      // if chartMaxDate - chartMinDate is more than 30 days then chartStartDate is 30 days before chartMaxDate

      if (chartMaxDate.getTime() - chartMinDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
        chartStartDate = new Date(chartMaxDate.getTime() - 30 * 24 * 60 * 60 * 1000)

        chartPoints = 30
      } else {
        
        chartStartDate = chartMinDate

        // // chartPoints is equal to the number of days between chartMinDate and chartMaxDate
        // chartPoints = (chartMaxDate.getTime() - chartMinDate.getTime()) / (24 * 60 * 60 * 1000)

        // chartPoints = parseInt(chartPoints) + 1

        chartPoints = stateTrackerDataAll.length
      }

    

      return {
        chartPoints: chartPoints,
        chartMinDate: chartMinDate,
        chartMaxDate: chartMaxDate,
        chartStartDate: chartStartDate,
        chartEndDate: chartEndDate,
      }
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "stateTrackerQuery > findStateChartOptimalInfo" }
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
