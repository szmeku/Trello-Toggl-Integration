var http = require('https');
var _ = require('lodash');
var q = require('q');


function buildQueryParamsString(queryParams) {
    var queryChunks = [];

    for (var key in queryParams) {
        queryChunks.push([key, queryParams[key]].join('='));
    }

    return queryChunks.join('&');
}


module.exports = function(requestOptions){

    var result = q.defer();
    var options ={
        port: requestOptions.port || 80,
        hostname: requestOptions.hostname,
        path: [requestOptions.path, buildQueryParamsString(requestOptions.queryParams)].join('?'),
        auth: requestOptions.auth || ''
    };

    var req = http.request(options, function (response) {

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



    return result.promise;
};
