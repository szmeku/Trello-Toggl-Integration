var nconf = require('nconf');
var trello = require('../lib/trello');

nconf.file({ file: '../config.json' });

trello.init({
    app_key: nconf.get('trello:app_key'),
    token: nconf.get('trello:token')
});


trello.getBoard('od4NxwzO').then(function(board){
    console.log(board);
});

