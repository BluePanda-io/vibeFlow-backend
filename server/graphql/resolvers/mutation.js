const {addNewMember,updateMember,addFavoriteProject,addSkillToMember,endorseAttribute, subscribe} = require("./mutation/memberMutation");
const {updateProject,newTweetProject,approveTweet,changeTeamMember_Phase_Project,createNewTeam,createNewRole} = require("./mutation/projectsMutation");
const {createSkill,createSkills,relatedSkills,createApprovedSkill,approveOrRejectSkill} = require("./mutation/skillMutation")
const {updateRoleTemplate} = require("./mutation/roleTemplateMutation")
const {updateServer} = require("./mutation/serverMutation")
const {updateSkillCategory} = require("./mutation/skillCategoryMutation")
const {updateSkillSubCategory} = require("./mutation/skillSubCategoryMutation")
const {createProjectUpdate} = require("./mutation/projectUpdateMutation")



module.exports = {
  Mutation: {
    // ------------- MEMBER MUTATION -----------------
    addNewMember,
    updateMember,
    addSkillToMember,
    endorseAttribute,
    addFavoriteProject,

    // ------------- PROJECT MUTATION -----------------
    updateProject,
    newTweetProject,
    approveTweet,changeTeamMember_Phase_Project,createNewTeam,createNewRole,

    // ------------- SKILL MUTATION -----------------
    createSkill,createSkills,relatedSkills,createApprovedSkill,approveOrRejectSkill,

    // ------------- ROLE MUTATION -----------------
    updateRoleTemplate,

    // ------------- SERVER MUTATION -----------------
    updateServer,

    // ------------- SKILL CATEGORY MUTATION -----------------
    updateSkillCategory,

    // ------------- SKILL SUB CATEGORY MUTATION -----------------
    updateSkillSubCategory,

    // ------------- PROJECT UPDATE MUTATION -----------------
    createProjectUpdate,

    
  },
  Subscription: {
    memberUpdated: {
      subscribe
    }
  }
};