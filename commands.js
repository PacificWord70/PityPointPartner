import 'dotenv/config';
import { InstallGlobalCommands, pitypointOptions, eventOptions } from './utils.js';


// Roll command
const ROLL_COMMAND = {
  name: 'roll',
  type: 1,
  description: 'Roll for loot!',
};

const START_COMMAND = {
  name: 'start-loot',
  type: 1,
  description: 'Start the rolls!',
  options: [
    {
      type: 3,
      name: 'pitypoints',
      description: 'Which phase of rolling is this?',
      choices: pitypointOptions,
      required: true,
    },
  ],
};

const END_COMMAND = {
  name: 'end-loot',
  type: 1,
  description: 'Ending this loot round.',
};

const ADD_PLAYER_COMMAND = {
  name: 'add-player',
  type: 1,
  description: 'Add a new player to the pity point sysetm.',
  "options": [
    {
      "name": "user-discord-id",
      "description": "Please enter the new user's Discord ID.",
      "type": 3,
      "required": true
    },
    {
      "name": "user-tal-username",
      "description": "Please enter the new user's Throne and Liberty username.",
      "type": 3,
      "required": true
    },
    {
      "name": "pity-points",
      "description": "Please enter how many pity points the user has earned. (Default is zero)",
      "type": 4
    },
    {
      "name": "events-attended",
      "description": "Please enter how many events the user has attended. (Default is zero)",
      "type": 4
    },
    {
      "name": "times-won",
      "description": "Please enter how many times the user has won a loot roll. (Default is zero)",
      "type": 4
    },
  ],
};
const REMOVE_PLAYER_COMMAND = {
  name: 'remove-player',
  type: 1,
  description: 'Remove an existing player from the pity point sysetm.',
  "options": [
    {
      "name": "user_discord_id",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": true
    },
  ],
};

const INCREASE_PITY_COMMAND = {
  name: 'increase-pity',
  type: 1,
  description: `Increase an existing player's pity poins based on event attendance.`,
  options: [
    {
      type: 3,
      name: 'event',
      description: 'Which event are you adding attendance for?',
      choices: eventOptions,
      required: true,
    },
    {
      "name": "user-discord-id-1",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": true
    },
    {
      "name": "user-discord-id-2",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": false
    },
    {
      "name": "user-discord-id-3",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": false
    },
    {
      "name": "user-discord-id-4",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": false
    },
    {
      "name": "user-discord-id-5",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": false
    },
    {
      "name": "user-discord-id-6",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": false
    },
  ],
};

const RESET_PITY_COMMAND = {
  name: 'reset-pity',
  type: 1,
  description: `Reset an existing player's pity points. Do this after they won! Yay!`,
  "options": [
      {
      "name": "user_discord_id",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": true
    },
  ],
};

const VIEW_PLAYER_COMMAND = {
  name: 'view-player',
  type: 1,
  description: `View a player's pity points and info.`,
  "options": [
      {
      "name": "user_discord_id",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": true
    },
  ],
};

const VIEW_ME_COMMAND = {
  name: 'view-me',
  type: 1,
  description: `View your own pity points and info.`,
};

const VIEW_HIGHSCORE_COMMAND = {
  name: 'view-highscore',
  type: 1,
  description: `View the UnLucky Highscore!`,
};

const EDIT_PLAYER_COMMAND = {
  name: 'edit-player',
  type: 1,
  description: `Edit a player's pity points and info.`,
  "options": [
      {
      "name": "user_discord_id",
      "description": "Please enter the user's Discord ID.",
      "type": 3,
      "required": true
    },
    {
      "name": "user-tal-username",
      "description": "Put -1 if not editing. Please enter the user's Throne and Liberty username.",
      "type": 3,
      "required": true
    },
    {
      "name": "pity-points",
      "description": "Put -1 if not editing. Please enter how many pity points the user has earned.",
      "type": 4,
      "required": true
    },
    {
      "name": "events-attended",
      "description": "Put -1 if not editing. Please enter how many events the user has attended.",
      "type": 4,
      "required": true
    },
    {
      "name": "times-won",
      "description": "Put -1 if not editing. Please enter how many times the user has won a loot roll.",
      "type": 4,
      "required": true
    },
  ],
};

const ALL_COMMANDS = [
  ROLL_COMMAND,
  START_COMMAND,
  END_COMMAND,
  ADD_PLAYER_COMMAND,
  REMOVE_PLAYER_COMMAND,
  INCREASE_PITY_COMMAND,
  RESET_PITY_COMMAND,
  VIEW_PLAYER_COMMAND,
  VIEW_ME_COMMAND,
  EDIT_PLAYER_COMMAND,
  VIEW_HIGHSCORE_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
