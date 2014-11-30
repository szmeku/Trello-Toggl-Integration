var http = require('https');
var _ = require('lodash');
var q = require('q');


var trelloConfig = {};

module.exports = {

    init: function(options){
        _.assign(trelloConfig, options)
    },

    getBoard: function(id){
        return trelloRequest('board/'+id);
    }

};


function trelloRequest(path, options) {

    var queryParams = {
            key: trelloConfig.app_key,
            token: trelloConfig.token
        },
        result = q.defer();

    if (options && options.queryParams) {
        _.assign(queryParams, options.queryParams)
    }

    var requestOptions = {
        port: 443,
        hostname: 'api.trello.com',
        path: ['/1/' + path, buildQueryParamsString(queryParams)].join('?')
    };


    var req = http.request(requestOptions, function (response) {


        var responseString = '';
        response.setEncoding('utf8');//
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));


        response.on('data', function (chunk) {
            responseString += chunk;
        });
        response.on('end', function () {
            result.resolve(JSON.parse(responseString));
        });
    });

    req.on('error', function (e) {
        console.log('problem with request:', e.message);
        result.reject('error');
    });
    req.end();
//
    return result.promise;

}

function buildQueryParamsString(queryParams) {
    var queryChunks = [];

    for (var key in queryParams) {
        queryChunks.push([key, queryParams[key]].join('='));
    }

    return queryChunks.join('&');
}