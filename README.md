# super-chatting-robot
Mega bot! (Twitch IRC bot and corresponding files)

TODO:

* Convert commands into objects with chat, whisper, and help texts, as well as command triggers.
* Write function that scans chat and whispers for command triggers and references apprpropriate object.
* Create user objects
* Look into retrieving API tokens from twitch redirect automatically so I don't need to have users manually copy paste them to me
* Add in custom requested Division API.
* Look into adding in PSN api.
* !add/remove admins, and power users.
* !allow/disallow links (!linkmode?) Check for links/remove if not power user or above.
* Save chatter info (see below)
* Allow for more roboust followups (!retry is the start of this idea but is limited in current implementation)
* !exit (need a way for users to startup the bot if this is implemented and other users are given bots)
* !queue \[Gamertag\] (!queuenext, !queueremove #, !queueclear, !queueopen, !queueclose, !queueplay (log !addwin !addloss record as part of the users record as well))
* !songrequest (noooo idea how to do this yet)
* Add more user interaction (text faces, quotes, amusing automated responses, etc)
* Long shot: !poker ?
* Longer shot: custom currency ?
* 

Chatter Info Concept:

* Store times since you entered each command last (limit certain commands to prevent chat spam)
* Store chatter inputs to allow command chains (!gamelist "What console" 'pc' "Check whispers)
* Store time spent in chat? Currency idea?
* Store days visited? Time subbed? Time followed?
* Permissions level (super user, mod, etc)
* Record while playing with streamer (!addwin while you're playing = stream record tracked)

