var nconf = require('nconf');
var trello = require('../lib/trello');
var toggl = require('../lib/toggl');

nconf.file({ file: '../config.json' });

trello.init({
    app_key: nconf.get('trello:app_key'),
    token: nconf.get('trello:token')
});

toggl.init({
    token: nconf.get('toggl:token')
});


//trello.getBoard('od4NxwzO').then(function(board){
//    console.log(board);
//});

toggl.togglRequest('me').then(function(resp){
    console.log(resp);
})

