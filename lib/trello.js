var _ = require('lodash');
var request = require('./request');

var trelloConfig = {};

module.exports = {

    init: function(options){
        _.assign(trelloConfig, options)
    },

    getBoard: function(id){
        return trelloRequest('GET', 'board/'+id);
    }

};

function trelloRequest(method, path, options) {

    var queryParams = {
            key: trelloConfig.app_key,
            token: trelloConfig.token
        };

    if (options && options.queryParams) {
        _.assign(queryParams, options.queryParams)
    }

    var requestOptions = {
        port: 443,
        hostname: 'api.trello.com',
        path: '/1/' + path,
        queryParams: queryParams,
        method: method
    };

    return request(requestOptions);
}
