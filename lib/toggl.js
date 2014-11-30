var _ = require('lodash');
var q = require('q');
var request = require('./request');

var togglConfig = {};

module.exports = {

    init: function (options) {
        _.assign(togglConfig, options)
    },

    getEntriesFromLastNDays: function (n) {

        var now = new Date();
        var monthAgo = new Date();
        monthAgo.setDate(now.getDate() - n);

        return togglRequest('GET', 'time_entries', {
            queryParams: {
                start_date: monthAgo.toISOString(),
                end_date: now.toISOString()
            }
        });
    },
    startEntry: function (name) {

        return togglRequest('POST', 'time_entries/start', {

            data: {time_entry: {
                description: name,
                wid: '307640',
                created_with: 'automata'
            }}

        })
    },

    getCurrentEntry: function(){

        var entry = q.defer();

        togglRequest('GET', 'time_entries/current').then(function(response){
              entry.resolve(response.data);
        });

        return entry.promise;
    },

    stopEntry: function(entryId){
        return togglRequest('PUT', 'time_entries/'+entryId+'/stop');
    },

    stopEntryByName: function(name){

        var that = this;
        this.getCurrentEntry().then(function(entry){

            if(entry && entry.description === name){

                that.stopEntry(entry.id);
            }
        });
    }
//    todo
//    get entries by name, zliczanie entries dla danej nazwy z ostatnich 30 dni i wrzucanie na karte trellową
};



var togglRequest = function (method, path, options) {

    var requestOptions = {
        method: method,
        port: 443,
        hostname: 'www.toggl.com',
        path: '/api/v8/' + path,
        queryParams: (options && options.queryParams) || {},
        auth: togglConfig.token + ':api_token',
        data: options && options.data
    };

    return request(requestOptions);
}