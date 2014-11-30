var http = require("http");
var nconf = require("nconf");
var trello = require("../lib/trello");
var toggl = require("../lib/toggl");
var express = require('express');
var bodyParser = require('body-parser')

nconf.file({ file: '../config.json' });

var app = express();
var port = 3030;
app.use(bodyParser.json());

var myUserId = nconf.get('trello:myUserId');
var doingListId = nconf.get('trello:doingListId');

trello.init({
    app_key: nconf.get('trello:app_key'),
    token: nconf.get('trello:token')
});

toggl.init({
    token: nconf.get('toggl:token')
});

app.head('/trelloCallback', function(req,res){
    res.send('ok');
});

app.post('/trelloCallback', function(req, res) {

    try{

        var action = req.body.action,
            model = req.body.model,
            card = action.data.card;

        function isMyAction(action){
            return myUserId === action.idMemberCreator;
        }

        function isActionOnDoingList(action){
            return doingListId === model.id;
        }

        function isCardEnter(card){
            return card.idList && card.idList === doingListId;
        }

        function isCardLeave(card){
            return card.idList && card.idList !== doingListId
        }


        if(isCardEnter(card) && isMyAction(action) && isActionOnDoingList(action)){

            res.send('start entry: ' + card.name);
            toggl.startEntry(card.name);

        }else if(isCardLeave(card) && isMyAction(action) && isActionOnDoingList(action)){

            res.send('stop entry: ' + card.name);
            toggl.stopEntryByName(card.name);

        }else{
            console.log('myUserId', myUserId, 'action.create', action.idMemberCreator);
            res.send('nie moja nie na tej liscie albo inna akcja');
        }

    }catch(ex){
        console.log('wystapil error: ' + ex);
        res.send('wystapil error: ' + ex);
    }

});

app.listen(3030);
console.log('Magic happens on port ' + port);
