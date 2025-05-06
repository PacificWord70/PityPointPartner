import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import {
  VerifyDiscordRequest,
  DiscordRequest,
  getRandomInt,
  getEvent,
  getPlayer,
  getHighscore,
  getDistPlayer,
  pruneRolls,
  checkPermissions,
  qPityPoints, 
  qEvents,
  phase,
  rollAllowed,
  currentDistribution,
  addPlayer,
  removePlayer,
  tempH,
  increasePity,
  readJSONs
} from './utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 50001;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  
  // Interaction type and data
  const { type, data, guild_id } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Log request bodies
  console.log(req.body);

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    readJSONs();

    //roll command
      if (name === 'roll') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        
        let player = getPlayer(id);
        let pityPoints = 0;
        //console.log(`id:${id} -> ${getDistPlayer(id)}`);
        if (player.discordID == "0") {
          response = "You are not in the pity point system. Please contact a Rat Lead.";
        } else {
          if (rollAllowed[0] === true) {

            if (getDistPlayer(id) === false) {
              //console.log('in roll'+phase[0]);
              if (phase[0] === '1') pityPoints = player.pityPoints;
            
              // <------------- edit the max roll here
              const usersRoll = getRandomInt(0, 70);
            
              var currentPlayer = [id, pityPoints, usersRoll];
              currentDistribution.push(currentPlayer);

              response = `${getPlayer(id).talUsername} is rolling for loot with ${pityPoints} pity points!`;
            } else {
              response = `${getPlayer(id).talUsername} you cannot roll twice. >:(`;
            }
          } else {
            response = `You cannot roll before the start of the loot phase.`;
          }
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${response}`,
          },
        });
      }

      //start command
    if (name === 'start-loot') {
        let response = "fill"
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = []
        roles.push(req.body.member.roles);
        
        const option = data.options[0];
        const selected = qPityPoints(option.value);
        //console.log(selected.value);

        //const guildid = req.body.channel.guild_id;
      if (checkPermissions(roles[0]) === true) {
          readJSONs();
          rollAllowed.pop();
          rollAllowed.push(true);
          let count = currentDistribution.length;
          currentDistribution.length=0;
          phase.pop();
          phase.push(selected.value);
          console.log(phase);
          response =`-----------------------------------------------------------------------------------------------------------\n${username} has started the rolling for phase ${selected.value}! (${count} rolls reset)`;
        } else {
          response = `${username} does not have the correct permissions.`;
        }
        //console.log(response);
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${response}`,
          },
        });
      }
      
      //end command
      if (name === 'end-loot') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = []
        roles.push(req.body.member.roles);
        //const guildid = req.body.channel.guild_id;
        //[id,pityPoints,usersRoll]
        if(checkPermissions(roles[0])===true){
          if (phase[0] === '1') response += pruneRolls();
          rollAllowed.pop();
          rollAllowed.push(false);
          response += `------------------------------------------------\n`;
          if (currentDistribution.length == 1) response += `There is ${currentDistribution.length} person in the running:\n`;
          else if (currentDistribution.length > 1) response += `There are ${currentDistribution.length} people in the running:\n`;
          else response += `No one has rolled.\n`;
          let highestPityPoints = [0,0,0];
          let higherPityPoints = [0,0,0];
          let highestRoll = [0,0,0];
          let winner = [0,0,0];
          for (let i = 0; i < currentDistribution.length; i++) {
            response+= `${getPlayer(currentDistribution[i][0]).talUsername} rolled ${currentDistribution[i][2]} + ${currentDistribution[i][1]} = ${currentDistribution[i][2]+currentDistribution[i][1]}.\n`;
            console.log("ROOOLLLLSSS:" + i + ": " + currentDistribution[i]);
            let rollSum = currentDistribution[i][1]+currentDistribution[i][2];
            //console.log((highestRoll[1]+highestRoll[2])+"--"+rollSum);
            if(rollSum > highestRoll[1]+highestRoll[2]) {
              highestRoll=currentDistribution[i];
            }
          }
          response += `-----------------------------------------------------------------------------------------------------------\n---> `;
          console.log(highestPityPoints[1] +">="+ (higherPityPoints[1]+20));
          // <------------- edit pity point win threshold here
          if(highestPityPoints[1] >= (higherPityPoints[1]+20))
          {
            winner = highestPityPoints;
            response += `${getPlayer(winner[0]).talUsername} has won by pity points!\n`;
            response += `They had ${winner[1]-higherPityPoints[1]} more pity points than any other roller. The threshold for an automatic pity point win is 20.`;
          } else {
            winner = highestRoll;
            response += `${getPlayer(winner[0]).talUsername} has won with ${winner[2]} + ${winner[1]} = ${winner[1]+winner[2]}!\n`;
          }
          response += `\nThey attended ${getPlayer(winner[0]).eventsAttended} events before getting any loot!`;
          if(winner[0]===0)
            {
              response = `No winner was found.`;
            }
        } else {
          response = `${username} does not have the correct permissions.`
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
        
      }

      //add-player command
      if (name === 'add-player') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = [];
        roles.push(req.body.member.roles);
        
        const option = data.options;
        
        if(checkPermissions(roles[0])===true){
          let user = {
            "discordID":option[0].value,
            "talUsername":option[1].value,
            "pityPoints": option[2]=== undefined ? 0 : option[2].value,
            "eventsAttended": option[3]=== undefined ? 0 : option[3].value,
            "timesWon": option[4]=== undefined ? 0 : option[4].value
          }
          console.log(user.talUsername);
          response = addPlayer(username, user);
        } else {
          response = `${username} does not have the correct permissions.`
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
      }

      //remove-player command
      if (name === 'remove-player') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = [];
        roles.push(req.body.member.roles);
        
        const option = data.options;
        let userDiscordID = option[0].value;
        if (checkPermissions(roles[0]) === true) {
          console.log(userDiscordID+'!!!!!');
          response = removePlayer(username, userDiscordID, 0);
        } else {
          response = `${username} does not have the correct permissions.`;
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
      }

      //increase-pity command
      if (name === 'increase-pity') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = [];
        roles.push(req.body.member.roles);
        
        const option = data.options;
        
        if (checkPermissions(roles[0]) === true) {
          /*res.send({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
          });*/
          //let userDiscordID = option[0].value;
          let event = getEvent(option[0].value);
          console.log(event);
          console.log(event.weight);
          console.log(getPlayer(option[1].value));
          let player1 = getPlayer(option[1].value);
          let player2 = getPlayer(option[2] == undefined ? 0 : option[2].value);
          let player3 = getPlayer(option[3] == undefined ? 0 : option[3].value);
          let player4 = getPlayer(option[4] == undefined ? 0 : option[4].value);
          let player5 = getPlayer(option[5] == undefined ? 0 : option[5].value);
          let player6 = getPlayer(option[6] == undefined ? 0 : option[6].value);
          let oldPoints = 0;
          
          response += `${username} has altered the pity points of:`;
          if (player1.talUsername != "None") {
            oldPoints = player1.pityPoints;
            response += increasePity(player1, oldPoints, event.weight);
          }
          if(player2.talUsername !="None") {
            oldPoints = player2.pityPoints;
            response += increasePity(player2, oldPoints, event.weight);
          }
          if(player3.talUsername !="None") {
            oldPoints = player3.pityPoints;
            response += increasePity(player3, oldPoints, event.weight);
          }
          if(player4.talUsername !="None") {
            oldPoints = player4.pityPoints;
            response += increasePity(player4, oldPoints, event.weight);
          }
          if(player5.talUsername !="None") {
            oldPoints = player5.pityPoints;
            response += increasePity(player5, oldPoints, event.weight);
          }
          if(player6.talUsername !="None") {
            oldPoints = player6.pityPoints;
            response += increasePity(player6, oldPoints, event.weight);
          }
          response += `\n***Disclaimer: If you do not see any player(s) you just entered, they are not yet in the system; please add them then try again.***`;
        } else {
          response = `${username} does not have the correct permissions.`;
        }
        /*(async () => {
          try {
            console.log("awaiting patch");
            //const endpoint = `applications/${appId}/commands`;
              // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
            await DiscordRequest(`webhooks/${id}/${req.body.token}/messages/@original`, { method: 'PATCH', body: response });
            //await fetch(`https://discord.com/api/v10/webhooks/${id}/${req.body.token}/messages/@original`, { body: response, headers: { Authorization: process.env.DISCORD_TOKEN }, method: "PATCH" });
            //throw "??";
            console.log("awaited patch");
          } catch (err) {
            console.log("errrrrr:"+err);
          } finally {
            console.log("inside finally");  
          }
        })();
        //await res.write(response);
        /*return res.write({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: response,
          },
        });*/
        //return res.end();*/
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
      }

      //reset-pity command
      if (name === 'reset-pity') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = [];
        roles.push(req.body.member.roles);
        
        const option = data.options;
        //let userDiscordID = option[0].value;
        let player = getPlayer(option[0].value);
        if (player.discordID == "0") {
          response += "That player is not in the pity point system. Please double check that you have the correct Discord ID.";
        } else if(checkPermissions(roles[0])===true){
          let oldPoints = player.pityPoints;
          let oldEvents = player.eventsAttended;
          let oldWon = player.timesWon;
          player.pityPoints = 0;
          player.eventsAttended = 0;
          player.timesWon +=1;

          removePlayer(username, player.discordID, 1);
          console.log("adding: " + username + " , " + player);
          addPlayer(username, player);
          player = getPlayer(option[0].value);

          response = `${username} has changed\n-> \t ${player.talUsername} 's
          pity points from ${oldPoints} to ${player.pityPoints}
          event attendance from ${oldEvents} to ${player.eventsAttended}
          times won from ${oldWon} to ${player.timesWon}`;
            
        } else {
          response = `${username} does not have the correct permissions.`;
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
      }

      //view-player command
      if (name === 'view-player') {
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const option = data.options;
        let response = ``;
        let user = getPlayer(option[0].value);
        if (user.discordID == "0") {
          response += "That player is not in the pity point system. Please contact a Rat Lead if that is an issue.";
        } else {
          response += `->\tDiscordID: ${user.discordID}
          TaL Username: ${user.talUsername}
          Pity Points: ${user.pityPoints}
          Events Attended: ${user.eventsAttended}
          Loot Won: ${user.timesWon}`;
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        }); 
      }

      //view-me command
    if (name === 'view-me') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        let user = getPlayer(id);
        if (user.discordID == "0") {
          response = "You are not in the pity point system. Please contact a Rat Lead.";
        } else {
          response = `->\tDiscordID: ${user.discordID}
        TaL Username: ${user.talUsername}
        Pity Points: ${user.pityPoints}
        Events Attended: ${user.eventsAttended}
        Loot Won: ${user.timesWon}`; 
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        }); 
      }

      //edit-player command
      if (name === 'edit-player') {
        let response = "";
        const context = req.body.context;
        const id = context === 0 ? req.body.member.user.id : req.body.user.id;
        const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
        const roles = [];
        roles.push(req.body.member.roles);
        
        const option = data.options;
        response = ``;
        
        let user = {
          "discordID":option[0].value,
          "talUsername":option[1].value,
          "pityPoints": option[2].value,
          "eventsAttended": option[3].value,
          "timesWon": option[4].value
        }
        let editUser = getPlayer(user.discordID);

        if (editUser.discordID == "0") {
          response += `The player you are trying to edit has not been added to the system yet. Please add them first ty :) -> /addplayer`;
        } else if(checkPermissions(roles[0])===true){
          response += `${username} has edited ${editUser.talUsername}'s`;
          removePlayer(username, editUser.discordID,1);
          if(user.talUsername != "-1") {
            response += ` TaL username from ${editUser.talUsername} to ${user.talUsername},`;
            editUser.talUsername = user.talUsername;
          }
          if(user.pityPoints != "-1") {
            response += ` pity points from ${editUser.pityPoints} to ${user.pityPoints},`;
            editUser.pityPoints = user.pityPoints;
          }
          if(user.eventsAttended != "-1") {
            response += ` events attended from ${editUser.eventsAttended} to ${user.eventsAttended}`;
            editUser.eventsAttended = user.eventsAttended;
          }if(user.timesWon != "-1") {
            response += ` times won from ${editUser.timesWon} to ${user.timesWon}`;
            editUser.timesWon = user.timesWon;
          }
          addPlayer(username, editUser);

          console.log(user);
        } else {
          response = `${username} does not have the correct permissions.`;
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response,
          },
        });
        
    }
    
    //view-highscore
    if (name === 'view-highscore') {
      const context = req.body.context;
      const id = context === 0 ? req.body.member.user.id : req.body.user.id;
      const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
      //tempH();
      let highscore = getHighscore();
      let response = `Unlucky Highscores:
      1st Place   ->\t${highscore[0].talUsername} with ${highscore[0].pityPoints} over ${highscore[0].eventsAttended} events as of ${highscore[0].dateAdded}
      2nd Place ->\t${highscore[1].talUsername} with ${highscore[1].pityPoints} over ${highscore[1].eventsAttended} events as of ${highscore[1].dateAdded}
      3rd Place  ->\t${highscore[2].talUsername} with ${highscore[2].pityPoints} over ${highscore[2].eventsAttended} events as of ${highscore[2].dateAdded}
      `;
      //console.log(new Date().toLocaleDateString());
      //DiscordID: ${highscore[0].discordID}\nTaL Username: ${user.talUsername}\nPity Points: ${user.pityPoints}\nEvents Attended: ${user.eventsAttended}`;
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
        },
      }); 
    }

    
  //end of function
  }

  // handle button interaction
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const profile = getFakeProfile(0);
    const profileEmbed = createPlayerEmbed(profile);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [profileEmbed],
      },
    });
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

/**
 * edit person - bug
 * discord username - tal username - dropdown
 * create parties
 * shot caller move
 * roll related only - loot dist channel
 * top 7 pity (loser leaderboard)
 * database
 * hosting
 */