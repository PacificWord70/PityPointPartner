import 'dotenv/config';
import { verifyKey } from 'discord-interactions';
import fs from "fs";
import playerJSON from './players.json' with { type: 'json' };
import highScoreJSON from './highscore.json' with { type: 'json' };
import historyJSON from './player-history.json' with { type: 'json' };
//const playerlist = require('./players.json');

var playerlist=[];
var highscore=[];
var playerhistory=[];

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    console.log(signature, timestamp, clientKey);

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}
//--------------------------------------------------------------------------------------------------------

export function qPityPoints(value) {
  return pitypointOptions.find((el) => el.value === value);
}

export function qEvents(value) {
  return eventOptions.find((el) => el.value === value);
}

export var phase = [];

export var rollAllowed = [];

export var currentDistribution = [
  /**{
    discordID:'',
    pityPointsUsing:0,
    roll:0
  }*/
]

export function pruneRolls() {
  //var currentPlayer = [id,pityPoints,usersRoll];
  let mostPity = [0,0,0];
  let tempDist = [];
  let prunedCount = 0;
  //find highest pity
  for (let p of currentDistribution) {
    console.log("p:" + p);
    console.log("most pity:" + mostPity);
    console.log("p[1] > mostPity[1]:" + p[1] + ">" + mostPity[1]+":"+(p[1] > mostPity[1]));
    if ((p[1] > mostPity[1])) {
      mostPity = p;
      console.log("most pity:" + mostPity);
    }
    tempDist.push(p);
  }
  //prep array for readd
  currentDistribution.length=0;
  //only readd players within the pity threshold
  console.log("tempDist:" + tempDist[0]);
  for (let p of tempDist) {
    console.log("p:" + p);
    console.log("most pity:" + mostPity);
    if (((p[1] + 20) >= mostPity[1])) currentDistribution.push(p);
    else prunedCount++;
  }
  if(prunedCount == 1) return `${prunedCount} player does not meet the pity point minimum this roll (${mostPity[1]-20}) and has been pruned.\n`;
  else return `${prunedCount} players do not meet the pity point minimum this roll (${mostPity[1]-20}) and have been pruned.\n`;
}

export const pitypointOptions = [
  {
    name: 'Phase 1 roll',
    value: '1'
  },
  {
    name: 'Phase 2 roll',
    value: '2'
  }
];

// <------------- edit event weights here
export const eventOptions = [
  {
    name: 'Riftstone/Boonstone',
    value: 'riftsone',
    weight: 4
  },
  {
    name: 'Siege Event',
    value: 'world-event',
    weight: 4
  },
  {
    name: 'Dynamtic Guild Event',
    value: 'guild-event',
    weight: 1
  },
  {
    name: 'War Boss Event',
    value: 'war-boss-event',
    weight: 1
  },
  {
    name: 'Other Event',
    value: 'other-event',
    weight: 1
  }
];


export function getRandomInt(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getEvent(value){
  for (let e of eventOptions) {
    if (e.value == value) return e;
  }
}

export function getPlayer(id){
  for (let p of playerlist) {
    if (p.discordID == id) return p;
  }
  return getPlayer("0");
}

export function getHighscore(){
  return highscore;
}

export function getDistPlayer(id){
  for (let p of currentDistribution) {
    //console.log('currentDist '+currentDistribution[0]);
    //console.log(`${p}: ${p[0]}===${id}`);
    if (p[0] == id) return true;
  }
  return false;
}

/**export async function getDiscordUsername(guild_id,id){
  const endpoint = `/guilds/${guild_id}/members/${id}`;

  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const parsedRes = await res.json();
    return parsedRes.map((member) => member.user.id);
  } catch (err) {
    return console.error(err);
  }
}*/
///guilds/{guild.id}/roles

// <------------- edit roles permission ids here
export function checkPermissions(roles){
  //big rat
  //big bad rat
  console.log(`roles: ${roles}`);
  for (let i = 0; i < roles.length; i++) {
    //console.log(i+" "+roles[i]);
    if (roles[i] == 'ADD ROLE ID HERE') return true;
    else if (roles[i] == 'ADD ROLE ID HERE') return true;
    else if (roles[i] == 'ADD ROLE ID HERE') return true;
  }
  return false;
}
/**
function backupJSON(json, backupjson){
  // to do
  let jsonContent = require(json);
  fs.writeFile(backupjson, jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
}
*/

export function readJSONs() {
/*var playerlist;
var highscore;
var playerhistory;*/
  playerlist = playerJSON;
  highscore = highScoreJSON;
  playerhistory = historyJSON;
/*
  fetch('./players.json')
    .then(response => response.json())
    .then(data => {
      playerlist = data;
      console.log(data);
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
    });
  fetch('./highscore.json')
    .then(response => response.json())
    .then(data => {
      highscore = data;
      console.log(data);
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
    });
  fetch('./player-history.json')
    .then(response => response.json())
    .then(data => {
      playerhistory = data;
      console.log(data);
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
  });*/
  /*playerlist = require('./players.json');
  highscore = require('./highscore.json');
  playerhistory = require('./player-history.json');*/
}

export function writeToJSON(javascriptArray, tag){
  //const fs = require('fs');
  const jsonContent = JSON.stringify(javascriptArray,1);
  //console.log("tag" + tag);

  if(tag == 0) {
    //backupJSON('./player-history.json', 'b2.json');
    fs.writeFileSync('./player-history.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("\nerr:"+err);
        }
    });
        console.log("\nThe file was saved!");
  } else if(tag == 1) {
    //backupJSON('./players.json', 'b1.json');
    fs.writeFileSync('./players.json', jsonContent, 'utf8', function (err) {
        if (err) {
          console.log("\nerr:"+err);
        }
    });
        console.log("\nThe file was saved!");
  } else if(tag == 2) {
    //backupJSON('./players.json', 'b1.json');
    fs.writeFileSync('./highscore.json', jsonContent, 'utf8', function (err) {
        if (err) {
          console.log("\nerr:"+err);
        }
    });
    console.log("\nThe file was saved!");
  }
  
  console.log("\nsomething happened?");
}

export function addPlayer(username, player) {
  console.log("inside add");
  for (let i = 0; i < playerlist.length; i++) {
    console.log("checking list -add");
    if (player.discordID == playerlist[i].discordID) {
      console.log("already in system????");
      return `${player.talUsername} already exists in the system.`;
    }
  }
  console.log("didn't find player -add");
  console.log("\n\n addplayer:"+player);
  playerlist.push(player);
  //console.log(playerlist);
  writeToJSON(playerlist, 1);
  checkHighscore(player);
  return `${username} has added ${getPlayer(player.discordID).talUsername} to the pity points system.`;
}

export function removePlayer(username, id, tag) {
  console.log("inside remove");
  for (let i = 0; i < playerlist.length; i++) {
    //console.log(id+'=='+playerlist[i].discordID);
    console.log("checking list -remove: "+i+" -- "+id+" == "+playerlist[i].discordID);
    let oldUser = {};
    if (id == playerlist[i].discordID) {
      console.log("found user: "+playerlist[i]);
      oldUser = playerlist[i]
      console.log("B list:\n" + playerlist);
      playerlist.splice(i, 1);
      console.log("A list:\n" + playerlist);
      writeToJSON(playerlist,1);
      /*if(tag==0) {
        playerhistory.push(oldUser);
        writeToJSON(playerhistory,0);
      }*/
      return `${username} has removed ${oldUser.talUsername} from the pity points system.`;
    }
  }
  console.log("didn't find player -remove");
  return `This user was not in the system to begin with.`;
}

export function checkHighscore(player) {
  console.log(player);
    console.log("checking against points highscore!!!! "+player+" againsttttt "+highscore);
  if (highscore[0].discordID == player.discordID && highscore[0].timesWon == player.timesWon) {
    highscore[0].pityPoints = player.pityPoints;
    highscore[0].eventsAttended = player.eventsAttended;
    highscore[0].dateAdded = new Date().toLocaleDateString();
  } else if (highscore[1].discordID == player.discordID && highscore[1].timesWon == player.timesWon) {
    highscore[1].pityPoints = player.pityPoints;
    highscore[1].eventsAttended = player.eventsAttended;
    highscore[1].dateAdded = new Date().toLocaleDateString();
    if (highscore[1].pityPoints > highscore[0].pityPoints) {
      let temp = highscore[1];
      highscore[1] = highscore[0];
      highscore[0] = temp;
    }
  } else if (highscore[2].discordID == player.discordID && highscore[2].timesWon == player.timesWon) {
    highscore[2].pityPoints = player.pityPoints;
    highscore[2].eventsAttended = player.eventsAttended;
    highscore[2].dateAdded = new Date().toLocaleDateString();
    if (highscore[2].pityPoints > highscore[1].pityPoints) {
      let temp = highscore[2];
      highscore[2] = highscore[1];
      highscore[1] = temp;
    }
    if (highscore[1].pityPoints > highscore[0].pityPoints) {
      let temp = highscore[1];
      highscore[1] = highscore[0];
      highscore[0] = temp;
    }
  } else {
    if (highscore[0].pityPoints < player.pityPoints) {
      highscore[2] = highscore[1];
      highscore[1] = highscore[0];
      highscore[0] = {
        "discordID": player.discordID,
        "talUsername": player.talUsername,
        "pityPoints": player.pityPoints,
        "eventsAttended": player.eventsAttended,
        "dateAdded": new Date().toLocaleDateString(),
        "timesWon": player.timesWon
      }
    } else if (highscore[1].pityPoints < player.pityPoints) {
      highscore[2] = highscore[1];
      highscore[1] = {
        "discordID": player.discordID,
        "talUsername": player.talUsername,
        "pityPoints": player.pityPoints,
        "eventsAttended": player.eventsAttended,
        "dateAdded": new Date().toLocaleDateString(),
        "timesWon": player.timesWon
      }
    } else if (highscore[2].pityPoints < player.pityPoints) {
      highscore[2] = {
        "discordID": player.discordID,
        "talUsername": player.talUsername,
        "pityPoints": player.pityPoints,
        "eventsAttended": player.eventsAttended,
        "dateAdded": new Date().toLocaleDateString(),
        "timesWon": player.timesWon
      }
    }
  }
  writeToJSON(highscore,2);
    console.log("endinggggg "+highscore);
}

export function tempH() {
  for (let p of playerlist) {
    checkHighscore(p);
  }
}

export function increasePity(player, oldPoints, eventWeight) {
  
  //increasePity(player1, oldPoints);
  removePlayer(player.talUsername, player.discordID,1);
  player.pityPoints += eventWeight;
  player.eventsAttended ++;
  addPlayer("", player);

  let newPlayer =  getPlayer(player.discordID);
  console.log("removed then added then found: " + newPlayer.talUsername);

  return `\n\t${newPlayer.talUsername} from ${oldPoints} to ${newPlayer.pityPoints} over ${newPlayer.eventsAttended} events attended`;
}