
const { Projects } = require("../../../models/projectsModel");
const { Team } = require("../../../models/teamModal");
const { Members } = require("../../../models/membersModel");
const {ApolloError} = require("apollo-server-express");
const { TeamMember } = require("discord.js");
const { driver } = require("../../../../server/neo4j_config");

const {createNode_neo4j,makeConnection_neo4j} = require("../../../neo4j/func_neo4j");


module.exports = {
  updateProject: async (parent, args, context, info) => {
   

    // console.log("check 1 = ",findSkillQuery);

    // createNode_neo4j({
    //   node:"Project",
    //   id:"laksdfj9029jfslkdjf",
    //   name:"Super Project",
    // })

    // makeConnection_neo4j({
    //   node:["Member","Project"],
    //   id:["971147333414842408","laksdfj9029jfslkdjf"],
    //   connection:"Dona",
    // })



    // throw new ApolloError("Project not found");

    
    const {_id,title,description,champion,team,role,collaborationLinks,budget,dates} = JSON.parse(JSON.stringify(args.fields))
 
 
    
    let fields = {
      _id,
      registeredAt: new Date(),
    }

    if (title) fields =  {...fields,title}
    if (description) fields =  {...fields,description}
    if (champion) fields =  {...fields,champion}
    if (team) fields =  {...fields,team}
    if (role) fields =  {...fields,role}
    if (collaborationLinks) fields =  {...fields,collaborationLinks}
    if (budget) fields =  {...fields,budget}
    if (dates) fields =  {...fields,dates}

    // console.log("fields = " , fields)

    try {

      let projectData

      if (_id){
        projectData = await Projects.findOne({ _id: fields._id })

        // console.log("projectData 1 = ", projectData);
      
        if (!projectData){
          projectData = await new Projects(fields);
          
          projectData.save()

          await createNode_neo4j({
            node:"Project",
            id:projectData._id,
            name:projectData.title,
          })
            
          // console.log("projectData 2 = ")

          // // identify champion by id
          // let championInfo = await Members.findOne({ _id: champion });

          // // identify champion's name
          // let championName
        
          // if(championInfo) {
          //   console.log("Wise Ty is pleayin with my nerves" )
          //   championName = championInfo.discordName;
            
          //   // Add new project node to Neo4j with champion name
          //   createNode_neo4j({
          //     node:"Project",
          //     id:projectData._id,
          //     name:fields.title,
          //   })
          //   // const session = driver.session({database:"neo4j"});
          //   // await session.writeTransaction(tx => 
          //   //   tx.run(
          //   //   `   
          //   //   MERGE (:Project {_id: '${projectData._id}', name: '${fields.title}', description: '${fields.description}', champion: '${championName}'})
          //   //   `
          //   //   )
          //   // )

          //   // session.close()
              

          //   // add champion relationship between project node and member
          //   makeConnection_neo4j({
          //     node:["Project","Member"],
          //     id:[projectData._id,championInfo._id],
          //     connection:"CHAMPION",
          //   })
          //   // const session2 = driver.session({database:"neo4j"});
          //   // await session2.writeTransaction(tx => 
          //   //   tx.run(
          //   //   `   
          //   //   MATCH (champion2:Member {_id: ${championInfo._id}})
          //   //   MATCH (project2:Project {_id: '${projectData._id}'})
          //   //   MERGE (project2)-[:CHAMPION]->(champion2)
          //   //   `
          //   //   )
          //   // )
          //   // session2.close();
 
          // }
          //   else {

          //     championName = 'none'; 
          //     // Add new project node to Neo4j w/o champion 
          //     createNode_neo4j({
          //       node:"Project",
          //       id:fields._id,
          //       name:fields.title,
          //     })
          //     // const session3 = driver.session({database:"neo4j"});
          //     // await session3.writeTransaction(tx => 
          //     // tx.run(
          //     // `   
          //     // MERGE (:Project {_id: '${fields._id}', name: '${fields.title}', description: '${fields.description}', champion: '${championName}'})
            
          //     // `
          //     //   )
          //     // )
          //     // session3.close();
          //   }
          
       
            
          
        } else {

          projectData= await Projects.findOneAndUpdate(
              {_id: projectData._id},
              {
                  $set: fields
              },
              {new: true}
          )

        }
      } else {
        projectData = await new Projects(fields);
        projectData.save()

        await createNode_neo4j({
          node:"Project",
          id:projectData._id,
          name:projectData.title,
        })
      }
      
      

      // console.log("projectData 2 = " , projectData)


      if (champion) {

        // console.log("champion 232 = " , champion)
        let memberDataChampion = await Members.findOne({ _id: champion })
        

        // console.log("memberDataChampion 232 = " , memberDataChampion)


        if (memberDataChampion) {

            let currentProjects = [...memberDataChampion.projects]

            currentProjects.push({
              projectID: projectData._id,
              champion: true,
            })

            memberDataUpdate = await Members.findOneAndUpdate(
                {_id: champion},
                {
                    $set: {projects: currentProjects}
                },
                {new: true}
            )

            // Add new project node to Neo4j with champion name
            // createNode_neo4j({
            //   node:"Project",
            //   id:projectData._id,
            //   name:fields.title,
            // })
            // const session = driver.session({database:"neo4j"});
            // await session.writeTransaction(tx => 
            //   tx.run(
            //   `   
            //   MERGE (:Project {_id: '${projectData._id}', name: '${fields.title}', description: '${fields.description}', champion: '${memberDataChampion.discordName}'})
            //   `
            //   )
            // )

            // session.close()
              

            // add champion relationship between project node and member
            await makeConnection_neo4j({
              node:["Project","Member"],
              id:[projectData._id,memberDataChampion._id],
              connection:"CHAMPION",
            })
            // const session2 = driver.session({database:"neo4j"});
            // await session2.writeTransaction(tx => 
            //   tx.run(
            //   `   
            //   MATCH (champion2:Member {_id: ${memberDataChampion._id}})
            //   MATCH (project2:Project {_id: '${projectData._id}'})
            //   MERGE (project2)-[:CHAMPION]->(champion2)
            //   `
            //   )
            // )
            // session2.close();
        }
  
      }

      
      if (fields.team && fields.team.length > 0) {
        console.log('team members!!!: ',fields.team); // prints out

        // const session4 = driver.session({database:"neo4j"});
        for (let i=0;i<fields.team.length;i++){
          

          await makeConnection_neo4j({
            node:["Project","Member"],
            id:[projectData._id,fields.team[i].memberID],
            connection:"TEAM_MEMBER",
          })
            // await session4.writeTransaction(tx => 
            //   tx.run(
            //   `   
            //   MATCH (member:Member {_id: ${fields.team[i].memberID}})
            //   MATCH (project:Project {_id: '${projectData._id}'})
            //   MERGE (project)-[:MEMBER]->(member)
            //   `
            //   )
            // )
          
          let memberData = await Members.findOne({ _id: fields.team[i].members })
          console.log('member data OBJECT 111: ',memberData); //null 

          if (memberData) {
            console.log('member data OBJECT 222: ',memberData); //doesn't print out

            let currentProjects = [...memberData.projects]
   
            currentProjects.push({
              projectID: projectData._id,
              champion: false,
              roleID: fields.team[i].roleID,
              phase: fields.team[i].phase,
            })
            console.log("Member's current projects = " , currentProjects)

            if (memberData){

              // console.log("currentProjects = " , currentProjects)
              memberDataUpdate = await Members.findOneAndUpdate(
                  {_id: fields.team[i].memberID},
                  {
                      $set: {projects: currentProjects}
                  },
                  {new: true}
              )
              // console.log("memberDataUpdate = " , memberDataUpdate)
              
            }
          }

        }
        
      }



      return (projectData)
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "tmemberQuery > findMember"}
      );
    }
  },

  newTweetProject: async (parent, args, context, info) => {
   

    let {projectID,title,content,author,approved} = JSON.parse(JSON.stringify(args.fields))

    
    if (!projectID) throw new ApolloError( "you need to specify a project ID");
    // if (!title) throw new ApolloError( "you need to specify title");
    // if (!content) throw new ApolloError( "you need to specify content");
    if (!author) throw new ApolloError( "you need to specify author ID");


    var ObjectId = require('mongoose').Types.ObjectId;

    if (ObjectId.isValid(projectID)==false) throw new ApolloError( "The project doesn't have a valid mongo ID");



    if (!approved) approved = false;

    
    let fields = {
      title,
      content,
      author,
      approved,
      registeredAt: new Date(),
    }


    try {


      let projectData = await Projects.findOne({ _id: projectID })


      let memberData = await Members.findOne({ _id: fields.author })

      if (!projectData) throw new ApolloError( "This project dont exist you need to choose antoher project");
      if (!memberData) throw new ApolloError( "The author dont exist on the database you need to choose antoher author ID");

      
      projectData.tweets.push(fields)

      projectDataUpdate = await Projects.findOneAndUpdate(
        {_id: projectData._id},
        {
            $set: {tweets: projectData.tweets }
        },
        {new: true}
      )


      let newTweetID = projectDataUpdate.tweets[projectDataUpdate.tweets.length-1]._id


      return { 
        newTweetID,
        numTweets: projectDataUpdate.tweets.length,
        tweets: projectDataUpdate.tweets
      }
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "tmemberQuery > findMember"}
      );
    }
  },

  approveTweet: async (parent, args, context, info) => {
   

    const {projectID,tweetID,approved} = JSON.parse(JSON.stringify(args.fields))

    
    if (!projectID) throw new ApolloError( "you need to specify a project ID");
    if (!tweetID) throw new ApolloError( "you need to specify a tweet ID");
    if (approved==null) throw new ApolloError( "you need to specify if the tweet is approved or not");

    


    try {


      let projectData = await Projects.findOne({ _id: projectID })

      if (!projectData) throw new ApolloError( "This project dont exist you need to choose antoher project");

      projectData.tweets.forEach(tweet => {
      //console.log("tweet = " , tweet)
        if (tweet._id == tweetID){
          tweet.approved = approved
        }
      })


        projectDataUpdate = await Projects.findOneAndUpdate(
          {_id: projectID},
          {
              $set: {tweets: projectData.tweets }
          },
          {new: true}
      )


      return projectDataUpdate

    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "tmemberQuery > findMember"}
      );
    }
  },


  changeTeamMember_Phase_Project: async (parent, args, context, info) => {
   

    const {projectID,memberID,phase} = JSON.parse(JSON.stringify(args.fields))

    
    if (!projectID) throw new ApolloError( "you need to specify a project ID");
    if (!memberID) throw new ApolloError( "you need to specify a tweet ID");
    if (phase==null) throw new ApolloError( "you need to specify if the tweet is approved or not");

    console.log("projectID,memberID,phase = " , projectID,memberID,phase)

    try {


      let projectData = await Projects.findOne({ _id: projectID })

      if (!projectData) throw new ApolloError( "This project dont exist you need to choose antoher project");

      let foundMember_flag = false
      projectData.team.forEach(member => {
      // console.log("member = " , member)
        if (member.memberID == memberID){
          member.phase = phase
          console.log("tuba = " )
          foundMember_flag = true
        }
      })

      if (foundMember_flag == false){
          projectData.team.push({
            memberID: memberID,
            phase: phase,
          })

          let memberData = await Members.findOne({ _id: memberID })

          if (memberData) {

            let currentProjects = [...memberData.projects]
          
            currentProjects.push({
              projectID: projectData._id,
              champion: false,
              phase: phase,
            })

            memberDataUpdate = await Members.findOneAndUpdate(
              {_id: memberID},
              {
                  $set: {projects: currentProjects}
              },
              {new: true}
            )
          }

      }


        projectDataUpdate = await Projects.findOneAndUpdate(
          {_id: projectID},
          {
              $set: {team: projectData.team }
          },
          {new: true}
      )


      return projectDataUpdate

      
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "tmemberQuery > findMember"}
      );
    }
  },


  createNewTeam: async (parent, args, context, info) => {
   

    
    const {_id,name,description,memberID,projectID,serverID,championID} = JSON.parse(JSON.stringify(args.fields))

    // _id is only if you want to update a team
    if (!name) throw new ApolloError( "you need to specify a name");
    if (!projectID) throw new ApolloError( "you need to specify a project ID");
    
    
    let fields = {
      projectID,
      name,
      registeredAt: new Date(),
    }

    if (_id) fields =  {...fields,_id}
    if (description) fields =  {...fields,description}
    if (memberID) fields =  {...fields,memberID}
    if (serverID) fields =  {...fields,serverID}
    if (championID) fields =  {...fields,championID}

    console.log("change = 1" )

    try {
      if (fields._id) {
      console.log("change = 2" )

        let membersData = await Team.findOne({ _id: fields._id })

        if (membersData){
          console.log("change = 3" )

          membersData = await Team.findOneAndUpdate(
            {_id: fields._id},fields,
            {new: true}
          )


          return (membersData)

        }
      }


      let membersData = await new Team(fields).save()
      


      return (membersData)
    } catch (err) {
      throw new ApolloError(
        err.message,
        err.extensions?.code || "DATABASE_FIND_TWEET_ERROR",
        { component: "tmemberQuery > findMember"}
      );
    }
  },

};
