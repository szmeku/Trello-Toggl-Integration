### Requirements

Server with nodejs and npm.

### Quick start

1. Create Trello Webhook https://trello.com/docs/gettingstarted/webhooks.html with `callbackURL: "http://yourserver.com:3030/trelloCallback"`
2. `git clone https://github.com/szmeku/Trello-Toggl-Integration`
2. Fill  config.json.example using your data, remove comments and rename to config.json
3. `npm install`
3. `node main/server.js`
