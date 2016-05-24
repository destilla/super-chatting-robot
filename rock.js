var irc = require("tmi.js"); //For chatting
var needle = require('needle');//For doing API calls
var moment = require('moment');//For handling time and time conversions
var fs = require('fs'); //For letting us save info to files
var humanize = require('humanize-duration') //Yo fuck time conversions I am so over this bullshit
var streamStart;
var hypeMode = false;
var retry = false;

var options = {
  options: {
    debug: true //I like to see what's going on in the console
  },
  connection: {
    cluster: "aws", // Twitch server address for group chat server (group necessary for whispers)
    reconnect: true // Reconnect if disconnected
  },
  identity: {
    username: " ", //Meet George Jetson....
    password: "oauth:" //Generate new if this one is compromised or we lose it
  },
  channels: ["#_STREAMOWNER_"] //Where are we sitting today?
};

var settings;
fs.readFile("rosieSets.json", "utf-8",function(err, data){
        if(err){
        console.log('Error reading settings; reverting to hardcoded settings');
        settings = {
          channels : ["#_STREAMOWNER_"], //Channels to post in
          nick: " ",
          whispers: [" "], //Hard coded list of people the bot might need to whisper
          port: 6667, //DO NOT TOUCH
          masters : [" "],
          admins : [" "], 
          moderators : [" "], //Mods
          powerUsers : [" "] //Maybe something like people allowed to post links? Idk, I can see this sort of thing being useful.
        }
        bot.say(channel, mes);
        readSuccess = false;
      }
      else{
        settings = JSON.parse(data);
        console.log('Settings loaded successfully!');
      }
    });

var bot = new irc.client(options); // Connect the bot to IRC using options provided

bot.connect();


var ps4Games = "Bloodborne, Destiny, Lego: Marvel Super Heroes, Uncharted: The Nathan Drake Collection, Uncharted 4, Until Dawn".split(", ");
var wiiuGames = "Dokey Kong Country: Tropical Freeze, Mario Kart 8, Pikmin 3, Super Mario 3D World, Super Mario Maker, Yoshi's Wooly World".split(", ");
var xboneGames = "Alien: Isolation, Assassins Creed: Syndicate, Batman: Arkham Knight, Call of Duty: Advanced Warfare, Star Wars: Battlefront, Elder Scrolls Online, Far Cry: Primal, GTA V, Lego: Jurassic World, NHL 16, Madden 16, Rainbow Six: Siege, Rare Replay, Shadows of Mordor, Tomb Raider, Rise of the Tomb Raider, Watch Dogs, Witcher III, Wolfenstein".split(", ");

var recordWin = 0;
var recordLoss = 0;
var recordPercent = 0 + "%";
var recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

var curConsole = "Xbox One";

//This is not working for some reason  :|   I think it's because of how twitch does join/part messages
//Expected functionality is that the bot welcomes anyone who joins the chat except for itself
bot.on("join", function (channel, who) {
if(who === settings.nick){
console.log(who + " recognized as joined.");
}
else {
console.log(who + " joined the chat!");
var mes = "Welcome to the channel, " + who + "!";
//bot.say(options.channels[0], mes);
}
});

bot.on("part", function (channel, who) { //Like join, this isn't working like it should
console.log(who + " left.");
//bot.say(options.channels[0], "Bye, " + who + "!");
});


bot.on("connecting", function (address, port){
  console.log("Connecting to " + address + ' on port ' + port);
});

//Handle on connect event
bot.on("connect", function (address, port) { //This works, send a message to the channel to announce the Bot is alive
  console.log("*** Bot Connected ***");
  //bot.say(options.channels[0], "Rosie here, at your service!");
})

//The bulk of the purpose of this bot -- Listen to all chat and respond based on the criteria we feed it here

/*                       / 
/                        / 
/     CHAT  HANDLING     /////////////////////////////////////////////////
/                        / 
/                       */

bot.on("chat", function (channel, user, text, self) { 

  if(text === text.toUpperCase() && text.length > 30 && !hypeMode){ // ALL CAPS = STFU BRUH
    bot.say(channel, user.username + ", bro, chill, we can hear you.");
  }

  if(text === "!hypemode" && permissionCheck(user.username) >= 2) {
    hypeMode = !hypeMode;

    if(hypeMode) bot.say(channel, "HYPE MODE ENGAGED, CAPS LOCK IS CRUISE CONTROL FOR COOL KevinTurtle");
    else bot.say(channel, "Order has been restored to chat. Calm down everyone.");
  }

  if(text === "!robbingstoreshype") bot.say(channel, "Get the money, dollar dollar billz y'all");

  if(text === "!orion") bot.say(channel, "OhMyDog");

  if(text === "@Rosie, you alive?" && user.username == "destillat_") bot.say(channel, "More or less.");

  if(text === "!psn") bot.say(channel, "Add me on PSN: _GAMERTAG_ https://my.playstation.com/_GAMERTAG_");

  if(text === "!snap" || text === "!snapchat") bot.say(channel, "Snapchat = streamowner");

  if(text.slice(0,7) === "!addmod" && (permissionCheck(user.username) >= 4 || user.username == "_STREAMOWNER_")){
    if(text === "!addmod") bot.say(channel, "Usage: !addmod NewModName");
    else {
      var backedUp = true;
      var wroteNew = true;
      var reportSets;
      var newMod = text.slice(8)
      fs.writeFile("rosieSets.json.bak", JSON.stringify(settings),"utf-8", function(err) {
        if(err) {
          console.log('Error saving settings backup: ' + err);
          bot.say(channel, "Error saving backup of current mod list BibleThump . Resubmit !addmod command.");
          backedUp = false;
          return;
        }
        else backedUp = true;
      });
      if(settings.masters.indexOf(newMod) > -1) bot.say(channel, newMod + " is already listed as a channel master.")
      else if(settings.admins.indexOf(newMod) > -1) bot.say(channel, newMod + " is already listed as a channel admin.")
      else if(settings.moderators.indexOf(newMod) > -1) bot.say(channel, newMod + " is already listed as a channel (bot) moderator.")
      else{
      if(backedUp){
      
      settings.moderators.push(newMod.toLowerCase());
      var mes = newMod + " added to moderator list. Current moderator list: ";
      for(var i = 0; i < settings.moderators.length; i++)
      {
        if(i < settings.moderators.length - 1) mes += settings.moderators[i] + ", ";
        else if(settings.moderators.length == 1) mes += settings.moderators[i];
        else mes += settings.moderators[i];
      }
      fs.writeFile("rosieSets.json", JSON.stringify(settings), function(err){
        if(err){
          console.log("Failed to save new moderator settings, err is " + err);
          bot.say(channel, "Saving moderator to settings file failed. Enter !retry to attempt to save moderator again. " + newMod + " will have moderator powers until I am shut down (or permanently if !retry is successful)." );
          wroteNew = false;
          retry = true;
        }
        else{
          fs.readFile("rosieSets.json", function(err,data){
            if(err){
              console.log("Failed to read file to verify settings were updated, err is: " + err);
              retry = true;
              bot.say(channel, "Failed to verify new moderator settings were saved (reading the new settings file failed). Enter !retry to attempt to verify moderator save again. " + newMod + " will have moderator powers until I am shut down (and will have them permanently if the file managed to save or if !retry is successful).");
            }
            else{
              var jData = JSON.parse(data);
              console.log(JSON.stringify(jData.moderators));
              console.log(JSON.stringify(settings.moderators));
              if(JSON.stringify(jData.moderators) == JSON.stringify(settings.moderators)) bot.say(channel, mes);
            }
          });
        }
      });
      }
    }
  }
  }

  if(text.slice(0,10) === "!removemod" && (permissionCheck(user.username) >= 4 || user.username == "_STREAMOWNER_")){
    if(text === "!removemod") bot.say(channel, "Usage: !removemod FormerModName");
      else{
        var backedUp = true;
        var oldMod = text.slice(11).toLowerCase();
        var oldModIndex = settings.moderators.indexOf(oldMod);

        if(oldModIndex == -1) bot.say(channel, oldMod + " not found in moderator list.");
        else{
        fs.writeFile("rosieSets.json.bak", JSON.stringify(settings),"utf-8", function(err) {
        if(err) {
          console.log('Error saving settings backup: ' + err);
          bot.say(channel, "Error saving backup of current mod list BibleThump . Resubmit !removemod command.");
          backedUp = false;
          return;
        }
      });
        while(oldModIndex > -1){
        settings.moderators.splice(oldModIndex, 1);
        oldModIndex = settings.moderators.indexOf(oldMod);
      }

      var mes = oldMod + " removed from moderator list. Updated moderator list: ";

      for(var i = 0; i < settings.moderators.length; i++)
      {
        if(i < settings.moderators.length - 1) mes += settings.moderators[i] + ", ";
        else if(settings.moderators.length == 1) mes += settings.moderators[i];
        else if(settings.moderators.length == 0) mes += "NO. BODY. NO MODS. AT ALL.";
        else mes += settings.moderators[i];
        }
        if(backedUp){
        fs.writeFile("rosieSets.json", JSON.stringify(settings), function(err){
        if(err){
          console.log("Failed to save new moderator settings, err is " + err);
          bot.say(channel, "Saving moderator to settings file failed. Enter !retry to attempt to save removal of moderator again. " + oldMod + " has lost mod powers until I am shut down (or permanently if !retry is successful)" );
          wroteNew = false;
          retry = true;
        }
        else{
          fs.readFile("rosieSets.json", function(err,data){
            if(err){
              console.log("Failed to read file to verify settings were updated, err is: " + err);
              retry = true;
              bot.say(channel, "Failed to verify new moderator settings were saved (reading the new settings file failed). Enter !retry to attempt to verify moderator save again. " + oldMod + " has lost mod powers until I am shut down (or permanently if the file saved or if !retry is successful)");
            }
            else{
              var jData = JSON.parse(data);
              console.log(JSON.stringify(jData.moderators));
              console.log(JSON.stringify(settings.moderators));
              if(JSON.stringify(jData.moderators) == JSON.stringify(settings.moderators)) bot.say(channel, mes);
            }
          });
        }
      });
        }
        
      }
     }  
  }

/* Activate this after vacation
  if(text.slice(0,9) === "!addadmin"){
    if(text === "!addadmin") bot.say(channel, "Usage: !addadmin NewAdminName");
    else {
      var newAdmin = text.slice(10);
      settings.admins.push(newAdmin.toLowerCase());
      var mes = newMod + " added to moderator list. Current moderator list: ";
      for(var i = 0; i < settings.admins.length; i++)
      {
        if(i < settings.admins.length - 1 || settings.admins.length == 1) mes += settings.admins[i] + ", ";
        else mes += settings.admins[i];
      }
      bot.say(channel, mes);
      }
    }
*/

  if(text === "!retry" && (permissionCheck(user.username) >= 4 || user.username == "_STREAMOWNER_")){

    fs.writeFile("rosieSets.json", JSON.stringify(settings), function(err){
        if(err){
          console.log("Failed to save new moderator settings, err is " + err);
          bot.say(channel, "Saving moderator to settings file failed. Enter !retry to attempt to save moderator list again.");
          wroteNew = false;
          retry = true;
        }
        else{
          fs.readFile("rosieSets.json", function(err,data){
            if(err){
              console.log("Failed to read file to verify settings were updated, err is: " + err);
              retry = true;
              bot.say(channel, "Failed to verify new moderator settings were saved (reading the new settings file failed). Enter !retry to attempt to verify moderator save again.");
            }
            else{
              var jData = JSON.parse(data);
              console.log(JSON.stringify(jData.moderators));
              console.log(JSON.stringify(settings.moderators));
              if(JSON.stringify(jData.moderators) == JSON.stringify(settings.moderators)){
                bot.say(channel, "Retry successful! Settings file reports current moderators should be: " + jData.moderators);
                retry = false;
              }
            }
          });
        }
      });
  }

  if(text === "!commands" || text === "!help") {
    bot.say(channel, "@" + user.username + ", check your whispers for a list of commands you have access to.");
    generateCommandList(permissionCheck(user.username), user.username);
  }
  
  if(text === "!robcornerstores"){
    bot.say(channel, "Get $$$$");
  }

  if((text.toLowerCase() === ("ps4?") || text.toLowerCase() === ("xbone?") || text.toLowerCase() === ("xbox?") ) || text.toLowerCase().indexOf("what") > -1 && text.indexOf("console") > -1 && (text.indexOf("on") > -1 || text.indexOf("this") > -1 || text.indexOf("playing") > -1)) bot.say(channel, "_STREAMOWNER_ is currently playing on " + curConsole + ".");

  if(text === "!battle.net") bot.say(channel, "_STREAMOWNER_ is _BNETID_ on Battle.net");

  if(text === "!dhype" || text === "!donationhype") bot.say(channel, user.username + ' gets HYPED for the donation!');

  if(text === "!followers"){

  needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err, resp) {
      var twitchJSON = resp.body;
      bot.say(channel, "_STREAMOWNER_ has " + twitchJSON.followers + " followers. (total updates every 30 to 60 seconds)");
    });

  } 

  if(text === "!gt" || text == "!gamertag"){

    needle.get('https://api.twitch.tv/kraken/users/' + user.username + '/follows/channels/_STREAMOWNER_', function(err, resp){
      var twitchJSON = resp.body;
      var length = getFollowTime(twitchJSON.created_at);

      bot.say(channel, user.username + " has followed _STREAMOWNER_ for " + length + ".");
    });
  }

  if(text === "!library"){
    bot.say(channel, user.username + ": Enter one of the following commands to discover what games _STREAMOWNER_ owns: !xbonegames / !ps4games / !wiiugames (check your whispers after using the command)");
  }

  if(text === "!location" || text === "!localtime" || text === "!thetime" || text === "!timezone" || text === "!whereuat"){
    var now = moment();
    var humanNow = now.format("MM/DD h:mm A");
    bot.say(channel, "_STREAMOWNER_ is located in the Bay Area, CA, USA. The date and time there is: " + humanNow);
  }

  if(text === "!ps4games"){
    bot.say(channel, "@" + user.username +", check your whispers!");
    bot.whisper(user.username, "_STREAMOWNER_ owns (PS4): Bloodborne, Destiny, Lego: Marvel Super Heroes, Uncharted: The Nathan Drake Collection, Uncharted 4, and Until Dawn.");
  }

  if(text === "!xbonegames"){
    bot.say(channel, "@" + user.username +", check your whispers!");
    bot.whisper(user.username, "_STREAMOWNER_ owns (XBOne): Alien: Isolation, Assassins Creed: Syndicate, Batman: Arkham Knight, Call of Duty: Advanced Warfare, Star Wars: Battlefront, Elder Scrolls Online, Far Cry: Primal, GTA V, Lego: Jurassic World, NHL 16, Madden 16, Rainbow Six: Siege, Rare Replay, Shadows of Mordor, Tomb Raider, Rise of the Tomb Raider, Watch Dogs, Witcher III, and Wolfenstein.");
  }

  if(text === "!wiiugames"){
    bot.say(channel, "@" + user.username +", check your whispers!");
    bot.whisper(user.username, "_STREAMOWNER_ owns (WiiU): Dokey Kong Country: Tropical Freeze, Mario Kart 8, Pikmin 3, Super Mario 3D World, Super Mario Maker, and Yoshi's Wooly World.");
  }

  if(text.slice(0,7) === "!random"){
    if(text === "!random") bot.say(channel, "@" + user.username + ", pick a console to randomly select a game for (e.g. !randomps4)");
    else{
      if(text.slice(7,11) === "wiiu"){
        var game = wiiuGames[Math.floor(Math.random() * (wiiuGames.length))];
        bot.say(channel, "@"+user.username+" has selected " + game + " to play next.");
      }
      if(text.slice(7,10) === "ps4"){
        var game = ps4Games[Math.floor(Math.random() * (ps4Games.length))];
        bot.say(channel, "@"+user.username+" has selected " + game + " to play next.");
      }
      if(text.slice(7,12) === "xbone"){
        var game = xboneGames[Math.floor(Math.random() * (xboneGames.length))];
        bot.say(channel, "@"+user.username+" has selected " + game + " to play next.");
      }            
    }
  }

  if(text === "!record") bot.say(channel, "Current Record: " + recordString);
  if(text === "!addwin" && permissionCheck(user.username) >= 2) {
    recordWin += 1;
    if(recordLoss == 0){
      if(recordWin == 0) recordPercent = 0 + "%";
      else if(recordWin > 0) recordPercent = 100 + "%";
      else if(recordWin < 0) recordPercent = "-"+100+"%";
    }
    else if(recordWin < 0) recordPercent = "I'm not calculating that crap % Kappa ";
    else if(recordWin + recordLoss < 0) recordPercent = "I'm not calculating that crap % Kappa ";

    else recordPercent = ((recordWin / (recordLoss + recordWin) * 100)).toFixed(1) + "%";

    recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

    bot.say(channel, "_STREAMOWNER_ won! Current Record: " + recordString);

  };

  if(text === "!addloss" && permissionCheck(user.username) >= 2) {
    recordLoss += 1;
    if(recordLoss + recordWin == 0) recordPercent = 0+"%";
    else if(recordWin < 0) recordPercent = "I'm not calculating that crap % Kappa ";
    else if(recordWin + recordLoss < 0) recordPercent = "I'm not calculating that crap % Kappa ";
    else if(recordLoss < 0) recordPercent = "Impossible% Kappa ";

    else recordPercent = ((recordWin / (recordLoss + recordWin) * 100)).toFixed(1) + "%";

    recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

    bot.say(channel, "_STREAMOWNER_ lost :( Current Record: " + recordString);
  }

  if(text.slice(0,10) === "!setrecord" && permissionCheck(user.username) >= 2){
    console.log("10,11: " + text.slice(0,11));
    if(text === "!setrecord" || text === "!setrecord " || text === "!setrecord  ") bot.say(channel, "Example !setrecord usage: !setrecord 3 - 2")
    else{
      if(text.slice(10,11) === " " && !isNaN(text.slice(12).split(" ")[0]) && !isNaN(text.slice(11).split(" ")[2])){
        recordWin =  Number(text.slice(11).split(" ")[0]);
        recordLoss = Number(text.slice(11).split(" ")[2]);
        if(recordLoss + recordWin == 0) recordPercent = 0+"%";
        else if(recordWin + recordLoss < 0) recordPercent = "I'm not calculating that crap % Kappa";
        else if(recordLoss < 0) recordPercent = "Impossible% Kappa";
        else recordPercent = ((recordWin / (recordLoss + recordWin) * 100)).toFixed(1) + "%";

        recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

        bot.say(channel, "New record set to: " + recordString);
      }
      else if(text.slice(10,11) === " " && !isNaN(text.slice(11).split("-")[0]) && !isNaN(text.slice(11).split("-")[1])){
        recordWin = Number(text.slice(11).split("-")[0]);
        recordLoss = Number(text.slice(11).split("-")[1]);
        if(recordLoss + recordWin == 0) recordPercent = 0+"%";
        else if(recordWin + recordLoss < 0) recordPercent = "I'm not calculating that crap % Kappa";
        else if(recordLoss < 0) recordPercent = "Impossible% Kappa";
        else recordPercent = ((recordWin / (recordLoss + recordWin) * 100)).toFixed(1) + "%";

        recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

        bot.say(channel, "New record set to: " + recordString);
      }
      else bot.say(channel, "Invalid record format, please resubmit.");
    }
  }

  if(text === "!resetrecord" && permissionCheck(user.username) >= 2){
    recordWin = 0;
    recordLoss = 0;
    recordPercent = 0 + "%";
    recordString = recordWin + " - " + recordLoss + " (" + recordPercent + ")";

    bot.say(channel, "Record reset back to: " + recordString);
  }

  if(text === "!social") bot.say(channel, "@" + user.username + ": Thanks for asking! I'm on Twitter, Instagram (@_STREAMOWNER_) and Snapchat (streamowner). Type !twitter or !instagram for links!");

  if(text === "!socialtwitter" || text === "!twitter") bot.say(channel, "My Twitter handle is @_STREAMOWNER_: https://twitter.com/_STREAMOWNER_/");

  if(text === "!socialinstagram" || text === "!instagram") bot.say(channel, "My Instagram handle is @_STREAMOWNER_: https://www.instagram.com/_STREAMOWNER_/");

  if(text === "!subhype") bot.say(channel, user.username + " gets HYPED for the sub");

  if(text === "!subscribe") bot.say(channel, "Ever wish you could subscribe to my channel and get awesome benefits? Now you can! Check it out here: https://gamewisp.com/_STREAMOWNER_");

  if(text === "!wow") bot.say(channel, "Hermíøne is a level 100 Warlock on Stormrage (US) - Alliance http://us.battle.net/wow/en/character/stormrage/Hermíøne/simple");

  if((text.slice(0,7) === "!status" || text.slice(0,6) === "!title")){
    if(text === "!status" || text === "!title"){
      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err,resp){

        console.log(user);

        var twitchJSON = resp.body;
        var status = twitchJSON.status;

        bot.say(channel, user["display-name"] + " -> Current Stream Title: " + status);

      });
    }
    else if(permissionCheck(user.username) >= 2){

      var whichWord = 8;
      if(text.slice(1,2) === "t") whichWord = 7;

      var myTitle = text.slice(whichWord);

      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_?channel[status]='+myTitle+'&oauth_token=xowhhbpw8hhlqipxw2ti9sji9eyscv&_method=put', function(err,resp){

        var respBody = resp.body;
        var newStatus = respBody.status;

        bot.say(channel, 'Stream title updated to: ' + newStatus);

      });

    }
  }

  if(text === "!xbl"){
    var needleOpts = {
      headers : {'X-Auth': " d5704609b7b79b3bc5bd8a8003fa17d47f6d0345"}
    }

    needle.get('https://xboxapi.com/v2/2533275009800794/presence/',needleOpts, function(err,resp){
      if(err){
        bot.say(channel, "Error retrieving XBL stats. _STREAMOWNER_'s gamertag is: _GAMERTAG_ (no As and no E)");
      }
      else{
  var presenceJSON = resp.body;

        if(presenceJSON.state === "Offline"){

        var lastSeenJSON = presenceJSON.lastSeen.timestamp;
        var lastMoment = moment(lastSeenJSON);
        var lastSeen = moment(lastMoment).fromNow();
          bot.say(channel, "_GAMERTAG_ (no As and no E) is currently offline. She was last online " + lastSeen + ".");
        }
        else if(presenceJSON.state === "Online"){
          var heyAsh = JSON.parse(JSON.stringify(presenceJSON.devices[0].titles[1].name));
          var heyAct = JSON.parse(JSON.stringify(presenceJSON.devices[0].titles[1].activity.richPresence));
          if (heyAsh.indexOf("dashboard") > -1) bot.say(channel, "_GAMERTAG_ (no As and no E) is currently online and chilling in the dashboard. Stay tuned to see what she plays!");
          else bot.say(channel, "_GAMERTAG_ (no As and no E) is currently doing " + heyAct + " in the game " + heyAsh);

        }
      }
    });
  }

  if(text.slice(0,8) === "!console" || text.slice(0,7) === "!system"){
    if(text === "!console" || text === "!system") bot.say(channel, "_STREAMOWNER_ is currently playing on " + curConsole + ".");
    else{
      var whichWord = 9;
      if(text.slice(1,2) === "s") whichWord = 8;

      curConsole = text.slice(whichWord);

      bot.say(channel, "Current console updated to: " + curConsole);
    }
  }

  if(text.slice(0,5) === "!game"){
    if(text === "!game"){
      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err, resp){

        var twitchJSON = resp.body;
        var game = twitchJSON.game;

        bot.say(channel, user["display-name"] + " -> Current Game: " + game);

      });
    }

    else if(permissionCheck(user.username)){
      var myGame = text.slice(6);

      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_?channel[game]='+myGame+'&oauth_token=xowhhbpw8hhlqipxw2ti9sji9eyscv&_method=put', function(err,resp){

        var respBody = resp.body;
        var newGame = respBody.game;

        bot.say(channel, "Stream game updated to: " + newGame);

      });
    }
  }

  if(text === "!song"){
    needle.get('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=_GAMERTAG_&api_key=a96aa71dd3405190934ff7a35ce37256&format=json', function(err,resp){

      if(err){
        bot.say(channel, "Error getting current song BibleThump");
      }

      else{
      lastJSON = resp.body;
      nowPlaying = lastJSON.recenttracks.track[0]["@attr"].nowplaying;
      curTrack = lastJSON.recenttracks.track[0]["name"];
      curArtist = lastJSON.recenttracks.track[0].artist["#text"];

      if(nowPlaying) bot.say(channel, "Current Song: " +curTrack+" by " + curArtist);
      else bot.say(channel, "No song currently reported as playing");
    }
    })
  }

  if(text === "!uptime"){ //report time stream has been live

    needle.get('https://api.twitch.tv/kraken/streams/_STREAMOWNER_', function(err,resp) { 
      //console.log(resp.statusCode);
      var twitchJSON = resp.body; //Save the responsein a variable so we can manipulate it
      //console.log(twitchJSON);

      if(twitchJSON.stream != null){      
      streamStart = twitchJSON.stream.created_at; //The time that twitch is reporting the stream started
      var now = moment(); //The current time (automatically adjusted for timezone)
      var startTime = moment(streamStart); //Make the start time manipulatable (and adjust for timezone)
      var differ = now.diff(startTime); // Get difference in milliseconds
      var diffDuration = moment.duration(differ); //Convert miliseconds into a human readable duration
      
      function timeString(){ //Account for the fact that sometimes the number will be "1" and the noun shouldn't be plural (e.g "1 hours" would look shitty and "1 hour(s)" is messy)
      var hours;
      var mins;
      var secs;

      if(diffDuration.hours() == 1) hours = diffDuration.hours() + ' hour, ';
      else hours = diffDuration.hours() + ' hours, ';

      if(diffDuration.minutes() == 1) mins = diffDuration.minutes() + ' minute, ';
      else mins = diffDuration.minutes() + ' minutes, ';

      if(diffDuration.seconds() == 1) secs = 'and ' + diffDuration.seconds() + ' second. ';
      else secs = 'and ' + diffDuration.seconds() + ' seconds. ';
      
      return hours + mins + secs;
      }

      function paraString() { //Format the (HH:MM:SS) to look as it should
        var paraHour;
        var paraMin;
        var parasec;
        if(diffDuration.hours() < 10){
          paraHour = '0'+diffDuration.hours();
        } else paraHour = diffDuration.hours();

        if(diffDuration.minutes() < 10){
          paraMin = '0'+diffDuration.minutes();
        } else paraMin = diffDuration.minutes();

        if(diffDuration.seconds() < 10){
          paraSec = '0'+diffDuration.seconds();
        } else paraSec = diffDuration.seconds();

        return '(' + paraHour + ':' + paraMin + ':' + paraSec + ')';
      } 
      var mes = 'Stream has been running for ' + timeString() + paraString();

      /*
      Logging I used when I was first building the uptime/highlight function
      Keeping it around in case I need it later, but really it's not necessary unless something breaks

      console.log('Now: ' + now.format('M D H m s'));
      console.log('startTime: ' + startTime.format('M D H m s'));
      console.log('Differ: ' + differ);
      console.log('TIME TEST: ' + diffDuration);
      console.log(timeString());
      */

      bot.say(channel, mes);
    }

else bot.say(channel,"Oops! Twitch reported the stream as offline!");
    });


  } //end of !uptime

 //report time stream has been live and save it to an accessible file
 //very similar to !uptime except this one saves the time and has a slightly different chat message

  if(text.slice(0,10) == "!highlight" && permissionCheck(user.username) >= 2){

    needle.get('https://api.twitch.tv/kraken/streams/_STREAMOWNER_', function(err,resp) { 
      //console.log(resp.statusCode);
      var twitchJSON = resp.body; //Save the responsein a variable so we can manipulate it
      //console.log(twitchJSON);

      if(twitchJSON.stream != null){
      streamStart = twitchJSON.stream.created_at; //The time that twitch is reporting the stream started
      var now = moment(); //The current time (automatically adjusted for timezone)
      var startTime = moment(streamStart); //Make the start time manipulatable (and adjust for timezone)
      var differ = now.diff(startTime); // Get difference in milliseconds
      var diffDuration = moment.duration(differ); //Convert miliseconds into a human readable duration
      
      function timeString(){ //Account for the fact that sometimes the number will be "1" and the noun shouldn't be plural (e.g "1 hours" would look shitty and "1 hour(s)" is messy)
      var hours;
      var mins;
      var secs;

      if(diffDuration.hours() == 1) hours = diffDuration.hours() + ' hour, ';
      else hours = diffDuration.hours() + ' hours, ';

      if(diffDuration.minutes() == 1) mins = diffDuration.minutes() + ' minute, ';
      else mins = diffDuration.minutes() + ' minutes, ';

      if(diffDuration.seconds() == 1) secs = 'and ' + diffDuration.seconds() + ' second. ';
      else secs = 'and ' + diffDuration.seconds() + ' seconds ';
      
      return hours + mins + secs;
      }

      function paraString() { //Format the (HH:MM:SS) to look as it should
        var paraHour;
        var paraMin;
        var parasec;
        if(diffDuration.hours() < 10){
          paraHour = '0'+diffDuration.hours();
        } else paraHour = diffDuration.hours();

        if(diffDuration.minutes() < 10){
          paraMin = '0'+diffDuration.minutes();
        } else paraMin = diffDuration.minutes();

        if(diffDuration.seconds() < 10){
          paraSec = '0'+diffDuration.seconds();
        } else paraSec = diffDuration.seconds();

        return '(' + paraHour + ':' + paraMin + ':' + paraSec + ')';
      } 
      if(text.length == 10){
        var mes = 'Logging highlight at ' + timeString() + paraString() + ' of the stream VOD...';
        var highlightLog = 'Highlight at ' + paraString() + ' of the replay. No description provided.'
      }
      if(text.length > 10){
        var mes = 'Logging highlight at ' + timeString() + paraString() + ' with description: \"' + text.substr(11,text.length) + '\"...';
        var highlightLog = 'Highlight at ' + paraString() + ' of the replay. Description: \"' + text.substr(11,text.length) + '\"';
      }
      var readSuccess = true;
      var oldLog;

      fs.readFile("../../web/twitch/streamowner/index.html", "utf-8",function(err, data){
        if(err){
        console.log('Error reading highlight log: ' + err);
        mes = 'error reading the existing highlight log! BibleThump';
        bot.say(channel, mes);
        readSuccess = false;
      }
      oldLog = data;
      console.log("ReadFile oldLog = " + oldLog);
      console.log("ReadFile data = " + data);

      var newLog = oldLog + highlightLog;

      if(readSuccess){
      fs.writeFile("../../web/twitch/streamowner/index.html", newLog + '<br>',"utf-8", function(err) {
        if(err) {
          console.log('Error saving highlight: ' + err);
          mes += 'error writing to highlight log! BibleThump';
          bot.say(channel, mes);
        }

        else{
          console.log('Highlight logged successfully!');
          mes += 'highlight logged successfully! VoHiYo';
          bot.say(channel, mes);
        }
      });
    }

    });
}

else bot.say(channel,"Oops! Twitch reported the stream as offline!");
  });


  } //end of !highlight

if(text === "!viewers"){
  needle.get('https://api.twitch.tv/kraken/streams/_STREAMOWNER_', function(err,resp) { 
      //console.log(resp.statusCode);
      var twitchJSON = resp.body; //Save the responsein a variable so we can manipulate it
      //console.log(twitchJSON);

      if(twitchJSON.stream != null){
        var viewers = twitchJSON.stream.viewers;
        bot.say(channel, twitchJSON.stream.channel.display_name + " has " + viewers + " viewers (total updates every 30 to 60 seconds)");
      }
      else{
        needle.get('http://tmi.twitch.tv/group/user/_STREAMOWNER_/chatters',function(err,resp){
          var chatJSON = resp.body;
          var chatters = chatJSON.chatter_count;
          bot.say(channel, "_STREAMOWNER_ is reported as offline, but has " + chatters + " chatters in chat (total updates every 30 to 60 seconds)");

        });
      }
  });
}

  if(text === "!master" && permissionCheck(user.username) >= 4){
    bot.say(channel, user.username + ' has master permissions!')
  }
  if(text === "!admin" && permissionCheck(user.username) >= 3){
  bot.say(channel, user.username + ' has admin permissions!')
  }
  if(text === "!mod" && permissionCheck(user.username) >= 2){
  bot.say(channel, user.username + ' has mod (bot commands) permissions!')
  }
  if(text === "!poweruser" && permissionCheck(user.username) >= 1){
    bot.say(channel, user.username + ' has poweruser permissions')
  }
});


/*                       / 
/                        / 
/    WHISPER HANDLING    /////////////////////////////////////////////////
/                        / 
/                       */


bot.on("whisper", function (user,text) {
    console.log(user.username +': ' + text);
  if(text === text.toUpperCase() && text.length > 30){ // ALL CAPS = STFU BRUH
    bot.whisper(user.username, user.username + ", bro, chill, we can hear you.");
  }

  else if(text === "!robcornerstores"){
    bot.whisper(user.username, "Get $$$$");
  }

  else if(text === "!commands" || text === "!help") generateCommandList(permissionCheck(user.username), user.username);

  else if(text === "!psn"){
    bot.whisper(user.username, "Add me on PSN: _GAMERTAG_ https://my.playstation.com/_GAMERTAG_");
  }

  else if(text === "!battle.net") bot.whisper(user.username, "_STREAMOWNER_ is _BNETID_ on Battle.net");

  else if(text === "!snap" || text === "!snapchat") bot.whisper(user.username, "Snapchat = streamowner");

  else if(text === "!dhype" || text === "!donationhype") bot.whisper(user.username, user.username + ' gets HYPED for the donation!');

  else if(text === "!followers"){

  needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err, resp) {
      var twitchJSON = resp.body;
      bot.whisper(user.username, "_STREAMOWNER_ has " + twitchJSON.followers + " followers (total updates every 30 to 60 seconds)");
    });

  } 

  else if(text === "!gt" || text === "!gamertag") bot.whisper(user.username, "Gamertag commands: !xbl, !steam, !psn, !WoW, !battle.net");

  else if(text === "!howlong"){

    needle.get('https://api.twitch.tv/kraken/users/' + user.username + '/follows/channels/_STREAMOWNER_', function(err, resp){
      var twitchJSON = resp.body;
      var length = getFollowTime(twitchJSON.created_at);

      bot.whisper(user.username, "You have followed _STREAMOWNER_ for " + length + ".");
    });
  }

  else if(text === "!library"){
    bot.whisper(user.username, user.username + ": Enter one of the following commands to discover what games _STREAMOWNER_ owns: !xbonegames / !ps4games / !wiiugames (check your whispers after using the command)");
  }

  else if(text === "!location" || text === "!localtime" || text === "!thetime" || text === "!timezone" || text === "!whereuat"){
    var now = moment();
    var humanNow = moment(now, "MM/DD hh:mm A");
    bot.whisper(user.username, "_STREAMOWNER_ is located in the Bay Area, CA, USA. The date and time there is: " + humanNow);
  }

  else if(text === "!ps4games"){
    bot.whisper(user.username, "_STREAMOWNER_ owns (PS4): Bloodborne, Destiny, Lego: Marvel Super Heroes, Uncharted: The Nathan Drake Collection, Uncharted 4, and Until Dawn");
  }

  else if(text === "!xbonegames"){
    bot.whisper(user.username, "_STREAMOWNER_ owns (XBOne): Alien: Isolation, Assassins Creed: Syndicate, Batman: Arkham Knight, Call of Duty: Advanced Warfare, Star Wars: Battlefront, Elder Scrolls Online, Far Cry: Primal, GTA V, Lego: Jurassic World, NHL 16, Madden 16, Rainbow Six: Siege, Rare Replay, Shadows of Mordor, Tomb Raider, Rise of the Tomb Raider, Watch Dogs, Witcher III, and Wolfenstein.");
  }

  else if(text === "!wiiugames"){
    bot.whisper(user.username, "_STREAMOWNER_ owns (WiiU): Dokey Kong Country: Tropical Freeze, Mario Kart 8, Pikmin 3, Super Mario 3D World, Super Mario Maker, and Yoshi's Wooly World.");
  }

  else if(text === "!social") bot.whisper(user.username, "@" + user.username + ": Thanks for asking! I'm on Twitter, Instagram (@_STREAMOWNER_) and Snapchat (streamowner). Type !twitter or !instagram for links!");

  else if(text === "!socialtwitter" || text === "!twitter") bot.whisper(user.username, "My Twitter handle is @_STREAMOWNER_: https://twitter.com/_STREAMOWNER_/");

  else if(text === "!socialinstagram" || text === "!instagram") bot.whisper(user.username, "My Instagram handle is @_STREAMOWNER_: https://www.instagram.com/_STREAMOWNER_/");

  else if(text === "!subscribe") bot.whisper(user.username, "Ever wish you could subscribe to my channel and get awesome benefits? Now you can! Check it out here: https://gamewisp.com/_STREAMOWNER_");

  else if(text === "!wow") bot.whisper(user.username, "Hermíøne is a level 100 Warlock on Stormrage (US) - Alliance http://us.battle.net/wow/en/character/stormrage/Hermíøne/simple");

  else if((text.slice(0,7) === "!status" || text.slice(0,6) === "!title")){
    if(text === "!status" || text === "!title"){
      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err,resp){

        console.log(user);

        var twitchJSON = resp.body;
        var status = twitchJSON.status;

        bot.whisper(user.username,  "Current Stream Title: " + status);

      });
    }
    else{

      var permString;
      if(permissionCheck(user.username) >= 2) permString = " ";
      else permString = " (and you don't have permission to set stream title anyway)";
      bot.whisper(user.username, "Sorry, for ease of tracking, stream title and game can only be updated from chat." + permString);

    }
  }

  else if(text === "!xbl") bot.whiser(user.username, "Xbox Live Gamertag: _GAMERTAG_ (no As no E)");

  else if(text === "!song"){
    needle.get('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=_GAMERTAG_&api_key=a96aa71dd3405190934ff7a35ce37256&format=json', function(err,resp){

      if(err){
        bot.whisper(user.username, "Error getting current song BibleThump");
      }

      else{
      lastJSON = resp.body;
      nowPlaying = lastJSON.recenttracks.track[0]["@attr"].nowplaying;
      curTrack = lastJSON.recenttracks.track[0]["name"];
      curArtist = lastJSON.recenttracks.track[0].artist["#text"];

      if(nowPlaying) bot.whisper(user.username, "Current Song: " +curTrack+" by " + curArtist);
      else bot.whisper(user.username, "No song currently reported as playing");
    }
    })
  }

  else if(text.slice(0,5) === "!game"){
    if(text === "!game"){
      needle.get('https://api.twitch.tv/kraken/channels/_STREAMOWNER_', function(err, resp){

        var twitchJSON = resp.body;
        var game = twitchJSON.game;

        bot.say(channel, "Current Game: " + game);

      });
    }

    else{
      var permString;
      if(permissionCheck(user.username) >= 2) permString = " ";
      else permString = " (and you don't have permission to set stream game anyway)";
      bot.whisper(user.username, "Sorry, for ease of tracking, stream game and game can only be updated from chat." + permString);
    }
  }

  else if(text === "!uptime"){ //report time stream has been live

    needle.get('https://api.twitch.tv/kraken/streams/_STREAMOWNER_', function(err,resp) { 
      //console.log(resp.statusCode);
      var twitchJSON = resp.body; //Save the responsein a variable so we can manipulate it
      //console.log(twitchJSON);

      if(twitchJSON.stream != null){      
      streamStart = twitchJSON.stream.created_at; //The time that twitch is reporting the stream started
      var now = moment(); //The current time (automatically adjusted for timezone)
      var startTime = moment(streamStart); //Make the start time manipulatable (and adjust for timezone)
      var differ = now.diff(startTime); // Get difference in milliseconds
      var diffDuration = moment.duration(differ); //Convert miliseconds into a human readable duration
      
      function timeString(){ //Account for the fact that sometimes the number will be "1" and the noun shouldn't be plural (e.g "1 hours" would look shitty and "1 hour(s)" is messy)
      var hours;
      var mins;
      var secs;

      if(diffDuration.hours() == 1) hours = diffDuration.hours() + ' hour, ';
      else hours = diffDuration.hours() + ' hours, ';

      if(diffDuration.minutes() == 1) mins = diffDuration.minutes() + ' minute, ';
      else mins = diffDuration.minutes() + ' minutes, ';

      if(diffDuration.seconds() == 1) secs = 'and ' + diffDuration.seconds() + ' second. ';
      else secs = 'and ' + diffDuration.seconds() + ' seconds. ';
      
      return hours + mins + secs;
      }

      function paraString() { //Format the (HH:MM:SS) to look as it should
        var paraHour;
        var paraMin;
        var parasec;
        if(diffDuration.hours() < 10){
          paraHour = '0'+diffDuration.hours();
        } else paraHour = diffDuration.hours();

        if(diffDuration.minutes() < 10){
          paraMin = '0'+diffDuration.minutes();
        } else paraMin = diffDuration.minutes();

        if(diffDuration.seconds() < 10){
          paraSec = '0'+diffDuration.seconds();
        } else paraSec = diffDuration.seconds();

        return '(' + paraHour + ':' + paraMin + ':' + paraSec + ')';
      } 
      var mes = 'Stream has been running for ' + timeString() + paraString();

      /*
      Logging I used when I was first building the uptime/highlight function
      Keeping it around in case I need it later, but really it's not necessary unless something breaks

      console.log('Now: ' + now.format('M D H m s'));
      console.log('startTime: ' + startTime.format('M D H m s'));
      console.log('Differ: ' + differ);
      console.log('TIME TEST: ' + diffDuration);
      console.log(timeString());
      */

      bot.whisper(user.username, mes);
    }

else bot.whisper(user.username,"Oops! Twitch reported the stream as offline!");
    });


  } //end of !uptime

else if(text === "!viewers"){
  needle.get('https://api.twitch.tv/kraken/streams/_STREAMOWNER_', function(err,resp) { 
      //console.log(resp.statusCode);
      var twitchJSON = resp.body; //Save the responsein a variable so we can manipulate it
      //console.log(twitchJSON);

      if(twitchJSON.stream != null){
        var viewers = twitch.JSON.viewers;
        bot.whisper(user.username, "_STREAMOWNER_ has " + viewers + " viewers (total updates every 30 to 60 seconds)");
      }
      else{
        needle.get('http://tmi.twitch.tv/group/user/_STREAMOWNER_/chatters',function(err2,resp2){
          var chatJSON = resp2.body;
          var chatters = chatJSON.chatter_count;
          bot.whisper(user.username, "_STREAMOWNER_ is reported as offline, but has " + chatters + " chatters in chat (total updates every 30 to 60 seconds)");

        });
      }
  });
}

// Disabling Highlights in Whispers -- Will re-enable if we decide it's the right move

else if(text.slice(0,10) == "!highlight"){

    if(permissionCheck(user.username) >= 2) bot.whisper(user.username, "Highlight command disabled in whispers; Try again in chat.");
    else bot.whisper(user.username, "Ah Ah Ahh! You didn't say the magic word KappaRoss");


  } 

/*
  if(text === '!dickvanhype' || text === '!rapevanhype'){
    bot.whisper(user.username, 'Like clowns to a VW bug, ' + nick + ' piles into the rape van!');
  }

  if(text === '!opponentskill' || text === '!theotherteam'){
    bot.whisper(user.username, 'Probably better than ' + nick + '\'s mom. Still sucks tho.');
  }

  if(text === "!liamneeson"){
    bot.whisper(user.username, 'Liam Neeson. Liam Neeson\'s knee son. Liam Neeson\'s niece on his knees on Es on a Nissan.');
  }
  if(text === "!whisper"){
    bot.whisper(nick, ".w " + nick + " A. S. M. R.");
  }
  */

  else if(text === "!master" && permissionCheck(user.username) >= 4){
    bot.whisper(user.username, 'You have master permissions!')
  }
  else if(text === "!admin" && permissionCheck(user.username) >= 3){
  bot.whisper(user.username, 'You have admin permissions!')
  }
  else if(text === "!mod" && permissionCheck(user.username) >= 2){
  bot.whisper(user.username, 'You have mod permissions!')
  }
  else if(text === "!poweruser" && permissionCheck(user.username) >= 1){
    bot.whisper(user.username, 'You have super user permissions!')
  }

  else bot.whisper(user.username, 'I don\'t recognize that command. ;_;')
});

function permissionCheck(nick){
  for(var i=0; i< settings.masters.length; i++){
    if(settings.masters[i] === nick){
      return 4;
    }
  }
  for(var i=0; i< settings.admins.length; i++){
    if(settings.admins[i] === nick){
      return 3;
    }
  }
  for(var i=0; i< settings.moderators.length; i++){
    if(settings.moderators[i] === nick){
      return 2;
    }
  }
  for(var i=0; i< settings.powerUsers.length; i++){
    if(settings.powerUsers[i] === nick){
      return 1;
    }
  } 
  return 0;
}

function generateCommandList(permission, user){
  var commandList;
  switch(permission){
    case 4:
    commandList += "";

    case 3:
    commandList += "";

    case 2:
    commandList = "Bot Moderator Commands: "
    commandList += "!highlight [Description], ";
    commandList += "!record (!setrecord [Win - Loss], !addwin, !addloss, !resetrecord), ";
    commandList += "!console (or !system, current console is updated to any text added after command), ";
    commandList += "!status (or !title, stream title is updated to any text added after command), ";
    commandList += "!game (game is updated to any text added after command)";
    bot.whisper(user, commandList);


    case 1:

    case 0:
    commandList = "Global Commands: ";
    commandList += "!uptime, ";
    commandList += "!psn, ";
    commandList += "!xbl, ";
    commandList += "!battle.net, ";
    commandList += "!dhype (or !donationhype), ";
    commandList += "!followers, ";
    commandList += "!gt, !gamertag, ";
    commandList += "!howlong, ";
    commandList += "!library, ";
    commandList += "!location (or !localtime, !thetime, !timezone, !whereuat), ";
    commandList += "!ps4games, !xbonegames, !wiiugames, ";
    commandList += "!randomps4, !randomxbone, !randomwiiu, ";
    commandList += "!social, !socialinstagram, !socialtwitter, !snapchat, ";
    commandList += "!subscribe, ";
    commandList += "!subhype, ";
    commandList += "!viewers, ";
    commandList += "!wow"
    bot.whisper(user, commandList);
    break;

  }

}

function getFollowTime(followStart){

      var now = moment(); //The current time (automatically adjusted for timezone)
      var startTime = moment(followStart); //Make the start time manipulatable (and adjust for timezone)
      var differ = now.diff(startTime); // Get difference in milliseconds
      var diffDuration = moment.duration(differ); //Convert miliseconds into a human readable duration

      return humanize(diffDuration, { units: ['y', 'mo', 'w', 'd', 'h'], largest: 4, conjunction: ' and ', round: true});
}
