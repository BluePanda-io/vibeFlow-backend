

const { Node } = require("../../../models/nodeModal");
const { Members } = require("../../../models/membersModel");

const axios = require("axios");



function chooseAPIkey() {
    // openAI_keys = [
    //   "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",
    //   // "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",
    //   "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",
    //   "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",
    // ];
    openAI_keys = ["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"];
  
    // randomly choose one of the keys
    let randomIndex = Math.floor(Math.random() * openAI_keys.length);
    let key = openAI_keys[randomIndex];
  
    return key;
  }
  
  async function useGPTchatSimple(prompt,temperature=0.7) {
    
    discussion = [{
      "role": "user",
      "content": prompt
    }]
  
  
    
    let OPENAI_API_KEY = chooseAPIkey();
    response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: discussion,
        model: "gpt-3.5-turbo",
        temperature: temperature,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
  
    return response.data.choices[0].message.content;
  }

const nodes_aiModule = async (nodesID,weightModulesObj,memberObj,filter) => {

    

    
    let nodeData = await Node.find({ _id: nodesID }).select(
        "_id node match_v2"
    );

    if (!nodeData) throw new ApolloError("Node Don't exist");


    memberObj = await nodesFindMembers(nodeData,memberObj)

    // console.log("memberObj = " , memberObj)
    for (const [memberID, member] of Object.entries(memberObj)) {
        console.log("member.nodes = " , memberID,member.nodes)
    }
    // sdf00

    memberObj = await findMemberAndFilter(memberObj)


    memberObj = await distanceFromFilter(memberObj,filter)

    memberObj = await membersScoreMap(memberObj,weightModulesObj)

    // console.log("change = " , change)
    await showObject(memberObj,"memberObj")

    // asdf5


    return memberObj
}

const totalScore_aiModule = async (memberObj,weightModulesObj,numberNodes) => {



    max_S = -1
    min_S = 100000000

    newMin_total = 20
    newMax_total = parseInt(nodeToMaxScore(numberNodes))

    

    
    for (const [memberID, member] of Object.entries(memberObj)) {
        let scoreOriginalTotal = 0;
        let scoreOriginalBeforeMap = 0;

        console.log("member = " , member)

        if (member.nodesTotal) {
            if (weightModulesObj["node_total"]) {
                scoreOriginalTotal += member.nodesTotal.score * (weightModulesObj["node_total"].weight*0.01);
                scoreOriginalBeforeMap += member.nodesTotal.scoreOriginal * (weightModulesObj["node_total"].weight*0.01);

            } 
            // else {
            //     scoreOriginalTotal += member.nodesTotal.score;
            //     scoreOriginalBeforeMap += member.nodesTotal.scoreOriginal;
            // }
        }

        if (member.distanceHoursPerWeekMap) {
            if (weightModulesObj["availability_total"]) {
                scoreOriginalTotal += member.distanceHoursPerWeekMap * (weightModulesObj["availability_total"].weight*0.01);
            } 
            // else {
            //     scoreOriginalTotal += member.distanceHoursPerWeekMap;
            // }
        }

        if (member.distanceBudgetPerHourMap) {
            if (weightModulesObj["budget_total"]) {
                scoreOriginalTotal += member.distanceBudgetPerHourMap * (weightModulesObj["budget_total"].weight*0.01);
            } 
            // else {
            //     scoreOriginalTotal += member.distanceBudgetPerHourMap;
            // }
        }

        if (member.expirience_total) {
            if (weightModulesObj["expirience_total"]) {
                scoreOriginalTotal += member.expirience_total * (weightModulesObj["expirience_total"].weight*0.01);
            } 
            // else {
            //     scoreOriginalTotal += member.expirience_total;
            // }
        }

        if (max_S < scoreOriginalTotal) max_S = scoreOriginalTotal;
        if (min_S > scoreOriginalTotal) min_S = scoreOriginalTotal;
        
        if (!memberObj[memberID].total) {
            memberObj[memberID].total = {
                scoreOriginal: scoreOriginalTotal,
                scoreOriginalBeforeMap: scoreOriginalBeforeMap,
            }
        }
    }
    // sdf12

    // console.log("max_S,min_S = " , max_S,min_S)

    for (const [memberID, member] of Object.entries(memberObj)) {
        let scoreOriginalTotal = member.total.scoreOriginal;
        let scoreOriginalBeforeMap = member.total.scoreOriginalBeforeMap;

        let scoreMap = mapValue(scoreOriginalTotal, min_S, max_S, newMin_total, newMax_total);

        memberObj[memberID].total.score = parseInt(scoreMap);
        memberObj[memberID].total.realTotalPercentage = scoreOriginalTotal;
        memberObj[memberID].total.scoreOriginalBeforeMap = scoreOriginalBeforeMap;

    }

    return memberObj
}

const sortArray_aiModule = async (memberObj) => {

    memberArray = []

    for (const [memberID, member] of Object.entries(memberObj)) {
        let score = member.total.score;

        // console.log("member = " , member)

        // -------------- Add Nodes --------------
        nodesPercentage = []
        for (const [nodeID, node] of Object.entries(member.nodes)) {
            // console.log("node = " , node)
            nodesPercentage.push({
                nodeID: nodeID,
                totalPercentage: parseInt(node.score*100),
                conn_nodeIDs: node.conn_nodeIDs,
            })

            // console.log("node.conn_nodeObj = " , member._id,node.conn_nodeObj)

            let mostRelevantMemberNodes = []

            for (const [conn_nodeID, conn_nodeObj] of Object.entries(node.conn_nodeObj)) {
                // console.log("conn_nodeObj = " , conn_nodeObj)
                mostRelevantMemberNodes.push({
                    nodeID: conn_nodeID,
                    totalPercentage: conn_nodeObj.scoreOriginal*100,
                })
            }

            mostRelevantMemberNodes.sort((a, b) => (a.totalPercentage > b.totalPercentage) ? -1 : 1)

            nodesPercentage[nodesPercentage.length-1].mostRelevantMemberNodes = mostRelevantMemberNodes

        }

        nodesPercentage.sort((a, b) => (a.totalPercentage > b.totalPercentage) ? -1 : 1)
        // -------------- Add Nodes --------------

        memberArray.push({
            memberID: memberID,
            matchPercentage: {
                totalPercentage: score,
                realTotalPercentage: member.total.scoreOriginalBeforeMap,
            },
            nodesPercentage: nodesPercentage,
        })
    }

    // console.log("memberArray = " , memberArray)
    for (let i = 0; i < memberArray.length; i++) {
        let member = memberArray[i];
        // console.log("member._id = " , member._id)
        let nodesPercentage = member.nodesPercentage;
        // console.log("nodesPercentage = " , nodesPercentage)
        for (let j = 0; j < nodesPercentage.length; j++) {
            let node = nodesPercentage[j];
            let mostRelevantMemberNodes = node.mostRelevantMemberNodes;
            // console.log("mostRelevantMemberNodes = " , mostRelevantMemberNodes)
        }
    }

    // sdf

    // console.log("memberArray = " , memberArray)

    memberArray.sort((a, b) => (a.matchPercentage.totalPercentage > b.matchPercentage.totalPercentage) ? -1 : 1)

    return memberArray
}

const membersScoreMap = async (memberObj,weightModulesObj) => {

    let max_S = -1
    let min_S = 100000000

    let newMin_members = 0.2
    let newMax_members = 1
   
    // ----------- Find original Scores every Member -----------
    for (const [memberID, member] of Object.entries(memberObj)) {
        let score = 0;
        let nodes = member.nodes;
        for (const [nodeID, node] of Object.entries(nodes)) {
            // score += node.score;

            if (weightModulesObj[`node_${node.type}`]) {
                // score += node.score * (weightModulesObj[`node_${node.type}`].weight*0.01);
                score += node.scoreOriginal * (weightModulesObj[`node_${node.type}`].weight*0.01);
                console.log("change = 1" , `node_${node.type}`,weightModulesObj[`node_${node.type}`].weight,node.scoreOriginal, node.scoreOriginal * (weightModulesObj[`node_${node.type}`].weight*0.01),score,memberID)
            } else {
                if (weightModulesObj["node_else"]) {
                    // console.log("change = 2" , `node_else`)

                    // score += node.score * (weightModulesObj["node_else"].weight*0.01);
                    score += node.scoreOriginal * (weightModulesObj["node_else"].weight*0.01);
                } else {
                    // console.log("change = 3" , `node nothing`)
                    // score += node.score;
                    score += node.scoreOriginal;
                }
            }
            

            // if (node.type == "sub_expertise") {
                // if (weightModulesObj["node_subExpertise"]) {
                //     score += node.score * (weightModulesObj["node_subExpertise"].weight*0.01);
                // } else {
                //     score += node.score;
                // }
            // } else if (node.type == "sub_typeProject") {
            //     if (weightModulesObj["node_subTypeProject"]) {
            //         score += node.score * (weightModulesObj["node_subTypeProject"].weight*0.01);
            //     } else {
            //         score += node.score;
            //     }
            // } else {
                // if (weightModulesObj["node_else"]) {
                //     score += node.score * (weightModulesObj["node_else"].weight*0.01);
                // } else {
                //     score += node.score;
                // }
            // }
        }
        
        if (score > max_S) max_S = score;
        if (score < min_S) min_S = score;

        if (!memberObj[memberID].nodesTotal) {
            memberObj[memberID].nodesTotal = {
                scoreOriginal: score
            }
        }
    }
    // ----------- Find original Scores every Member -----------

    // console.log("max_S,min_S = " , max_S,min_S)
    // asdf12


    // ----------- Map Scores every Member -----------
    for (const [memberID, member] of Object.entries(memberObj)) {
        let score = member.nodesTotal.scoreOriginal;
        let scoreMap = mapValue(score, min_S, max_S, newMin_members, newMax_members);

        // console.log("scoreMap = " , scoreMap, min_S, max_S, newMin_members, newMax_members)

        memberObj[memberID].nodesTotal.score = scoreMap;
    }
    // ----------- Map Scores every Member -----------

    return memberObj
    
}

const passFilterTestMember = async (memberData) => {


    if (!memberData?.hoursPerWeek) return false;

    if (!memberData?.budget?.perHour) return false;



    if (!memberData?.expirienceLevel?.total) return false;

    return true

}

const findMemberAndFilter = async (memberObj) => {

    
    // from memberObj take only the keys and make a new array
    memberIDs = Object.keys(memberObj);

    // search on the mongo for all the members
    let membersData = await Members.find({ _id: memberIDs }).select('_id hoursPerWeek totalNodeTrust expirienceLevel budget');

    // console.log("membersData = " , membersData)


    // add the members data to the memberObj
    for (let i = 0; i < membersData.length; i++) {
        let memberID = membersData[i]._id;

        if (memberObj[memberID]) {

            passFilter = await passFilterTestMember(membersData[i])

            if (passFilter== true){
                memberObj[memberID] = {
                    ...memberObj[memberID],
                    ...membersData[i]._doc
                }

            } else  delete memberObj[memberID]

        }
    }

    return memberObj
}

const distanceFromFilter = async (memberObj,filter) => {

    minDisBudgetPerHour = 100000000
    maxDisBudgetPerHour = -1

    minDisHoursPerWeek = 100000000
    maxDisHoursPerWeek = -1

    minDisExpirienceLevel = 100000000
    maxDisExpirienceLevel = -1

    for (const [memberID, member] of Object.entries(memberObj)) {
        let distance = 0;

        // ---------------------- hoursPerWeek
        if (filter?.availability?.minHourPerWeek && filter?.availability?.maxHourPerWeek){
            averageFilterHourPerWeek = (filter.availability.minHourPerWeek + filter.availability.maxHourPerWeek) / 2;
            distance = Math.abs(member.hoursPerWeek - averageFilterHourPerWeek);
            memberObj[memberID].distanceHoursPerWeek = distance;

            if (distance < minDisHoursPerWeek) minDisHoursPerWeek = distance;
            if (distance > maxDisHoursPerWeek) maxDisHoursPerWeek = distance;
        }


        // ---------------------- budget
        if (filter?.budget?.minPerHour && filter?.budget?.maxPerHour){
            averageFilterBudgetPerHour = (filter.budget.minPerHour + filter.budget.maxPerHour) / 2;
            distance = Math.abs(member.budget.perHour - averageFilterBudgetPerHour);
            memberObj[memberID].distanceBudgetPerHour = distance;

            if (distance < minDisBudgetPerHour) minDisBudgetPerHour = distance;
            if (distance > maxDisBudgetPerHour) maxDisBudgetPerHour = distance;
        }

        // ---------------------- expirienceLevel
        if (filter?.expirienceLevel){
            distance = Math.abs(member.expirienceLevel.total - filter.expirienceLevel);
            memberObj[memberID].distanceExpirienceLevel = distance;

            if (distance < minDisExpirienceLevel) minDisExpirienceLevel = distance;
            if (distance > maxDisExpirienceLevel) maxDisExpirienceLevel = distance;
        }
    }


    // Map the distance to 0-1
    for (const [memberID, member] of Object.entries(memberObj)) {

        memberObj[memberID].distanceHoursPerWeekMap = 0
        memberObj[memberID].distanceBudgetPerHourMap = 0
        memberObj[memberID].distanceExpirienceLevelMap = 0

        if (member.distanceHoursPerWeek){
            let distanceHoursPerWeek = mapValue(member.distanceHoursPerWeek, minDisHoursPerWeek, maxDisHoursPerWeek, 0, 1);
            memberObj[memberID].distanceHoursPerWeekMap = distanceHoursPerWeek;
        }

        if (member.distanceBudgetPerHour){
            let distanceBudgetPerHour = mapValue(member.distanceBudgetPerHour, minDisBudgetPerHour, maxDisBudgetPerHour, 0, 1);
            memberObj[memberID].distanceBudgetPerHourMap = distanceBudgetPerHour;
        }


        if (member.distanceExpirienceLevel){
            let distanceExpirienceLevel = mapValue(member.distanceExpirienceLevel, minDisExpirienceLevel, maxDisExpirienceLevel, 0.3, 1);
            memberObj[memberID].distanceExpirienceLevelMap = distanceExpirienceLevel;
        }


    }

    // console.log("memberObj = " , memberObj)


    // sdf99
    
    return memberObj
}

const nodesFindMembers = async (nodeData,memberObj) => {

    memberIDs = [];

    // console.log(" = --->> tora -1" )

    for (let i = 0; i < nodeData.length; i++) {
        // loop on the nodes
        let match_v2 = nodeData[i].match_v2;
        let node = nodeData[i];

        console.log(" = --->> tora tt0", node._id, match_v2.length)

        memberObj = await nodeScoreMembersMap(match_v2,node,memberObj)

    }

    // console.log(" = --->> tora 3" )
    


    return memberObj
}

const nodeScoreMembersMap = async (match_v2,node,memberObj) => {

    let nodeID = node._id;

    max_S = -1
    min_S = 100000000

    newMin_nodeMember = 0.2
    newMax_nodeMember = 1
    // ---------- Find nodes and Max Min -----------
    for (let j = 0; j < match_v2.length; j++) {

        if (! (match_v2[j].type == "Member")) continue;

        let memberID = match_v2[j].nodeResID;
        let scoreUser = match_v2[j].wh_sum;

        // ------------- Find all connected nodes -------------
        let conn_node = match_v2[j].conn_node_wh;
        let conn_nodeIDs = conn_node.map((item) => item.nodeConnID);

        // console.log("scoreUser = " , scoreUser)
        // console.log("conn_node = " , conn_node)
        // asdf2
        // ------------- Find all connected nodes -------------

        if (scoreUser > max_S) max_S = scoreUser;
        if (scoreUser < min_S) min_S = scoreUser;

        // console.log(" = --->> tora ttk",node._id )


        if (!memberObj[memberID]) {
            
            memberObj[memberID] = {
                nodes: {}
            }
            memberObj[memberID].nodes[nodeID] = {
                scoreOriginal: scoreUser,
                type: node.node,
                conn_nodeIDs: conn_nodeIDs,
                conn_nodeObj: {},
            }
        } else {
            if (!memberObj[memberID].nodes[nodeID]){
                memberObj[memberID].nodes[nodeID] = {
                    scoreOriginal: scoreUser,
                    type: node.node,
                    conn_nodeIDs: conn_nodeIDs,
                    conn_nodeObj: {},
                };
            } else {
                memberObj[memberID].nodes[nodeID].scoreOriginal = scoreUser;
                memberObj[memberID].nodes[nodeID].type = node.node;
                memberObj[memberID].nodes[nodeID].conn_nodeIDs = conn_nodeIDs;
            }
        }

        // console.log(" = --->> tora ttk 2",node._id )


        // ----------- Add nodes to conn_nodeObj ----------
        let conn_nodeObj = memberObj[memberID].nodes[nodeID].conn_nodeObj;
        for (let k = 0; k < conn_nodeIDs.length; k++) {
            let conn_nodeID = conn_nodeIDs[k];
            if (!conn_nodeObj[conn_nodeID]){
                conn_nodeObj[conn_nodeID] = {
                    nodeID: conn_nodeID,
                    scoreOriginal: conn_node[k].wh_sum,
                }
            } else {
                conn_nodeObj[conn_nodeID].scoreOriginal += conn_node[k].wh_sum;
            }
        }
        memberObj[memberID].nodes[nodeID].conn_nodeObj = conn_nodeObj;
        // ----------- Add nodes to conn_nodeObj ----------

        // console.log(" = --->> tora ttk 3",node._id )


        // console.log("memberObj[memberID].nodes[nodeID] = " , memberObj[memberID].nodes[nodeID])
    }
    // ---------- Find nodes and Max Min -----------
    // sdf99

    // console.log(" = --->> tora 1" )
    // ---------- Map Score [0,1]-----------
    for (let j = 0; j < match_v2.length; j++) {

        if (! (match_v2[j].type == "Member")) continue;

        let memberID = match_v2[j].nodeResID;
        let scoreUser = match_v2[j].wh_sum;

        let scoreUserMap = mapValue(scoreUser, min_S, max_S, newMin_nodeMember, newMax_nodeMember);

        // console.log("memberObj[memberID] = " , memberObj[memberID]) // TODO: delete
        // console.log("memberObj[memberID].nodes[nodeID] = " , memberObj[memberID].nodes[nodeID]) // TODO: delete

        if (Number.isNaN(scoreUserMap)) {
            memberObj[memberID].nodes[nodeID].score = 0.6
        } else {
            memberObj[memberID].nodes[nodeID].score = scoreUserMap;
        }

        // console.log("change = " , scoreUserMap)

        // console.log("scoreUserMap = -------------" , scoreUserMap,scoreUser, min_S, max_S, newMin_nodeMember, newMax_nodeMember)

        
    }
    console.log(" = --->> tora 2",memberObj )

    // ---------- Map Score [0,1]-----------
    // sfaf6

    return memberObj

}

function mapValue(value, oldMin, oldMax, newMin, newMax) {
    var oldRange = oldMax - oldMin;
    if (oldRange == 0){
        // return newMax*0.9;
        return 0.1;
    } else {
        var newRange = newMax - newMin;
        var newValue = ((value - oldMin) * newRange / oldRange) + newMin;
        return newValue;
    }
}

async function showArray(arr,name="arr") {
    console.log(" ------------------ " + name + " ------------------")
    for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
    }
    console.log(" ------------------ " + name + " ------------------")

}

async function showObject(objectT,name="objectT") {
    console.log(" ------------------ " + name + " ------------------")
    for (const [key, value] of Object.entries(objectT)) {
        console.log("key = " , key)
        console.log("value = " , value)
    }
    console.log(" ------------------ " + name + " ------------------")
}

async function arrayToObject(arrayT) {
    let objectT = {};
    for (let i = 0; i < arrayT.length; i++) {
        objectT[arrayT[i].type] = arrayT[i];
    }
    return objectT;
}

function nodeToMaxScore(x) {
    const a = -0.056;
    const b = 3.972;
    const c = 66.084;
    const y = a * Math.pow(x, 2) + b * x + c;



    return y;
}





module.exports = {
    nodes_aiModule,
    totalScore_aiModule,
    showObject,
    sortArray_aiModule,
    chooseAPIkey,
    useGPTchatSimple,
    arrayToObject,
  };