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

    startEntry: function (name, project) {

        var timeEntry =  {
                description: name,
                wid: togglConfig.workspaceId,
                created_with: 'automata'
        };
        
        if(project){
            timeEntry.pid = project.id
        }

        return togglRequest('POST', 'time_entries/start', {data: {time_entry: timeEntry}});
    },


    getCurrentEntry: function () {

        var entry = q.defer();

        togglRequest('GET', 'time_entries/current').then(function (response) {
            entry.resolve(response.data);
        });

        return entry.promise;
    },


    stopEntry: function (entryId) {
        return togglRequest('PUT', 'time_entries/' + entryId + '/stop');
    },

    stopEntryByTrelloTaskName: function (trelloTaskName) {

        var entryName = this.projectAndEntryNameFromTrelloTaskName(trelloTaskName).entryName;
        var that = this;

        this.getCurrentEntry().then(function (entry) {

            if (entry && entry.description === entryName) {

                that.stopEntry(entry.id);
            }
        });
    },

    createProject: function (name) {

        var color = _.random(1, 14);

        return togglRequest('POST', 'projects', {

            data: {
                project: {
                    name: name,
                    wid: togglConfig.workspaceId,
                    is_private: true,
                    color: color
                }
            }

        }).then(function(resp){

            return resp.data;
        })

    },

    getProjects: function () {
        return togglRequest('GET', 'workspaces/' + togglConfig.workspaceId + '/projects');
    },

    findProjectByName: function (name) {
        return this.getProjects().then(function (projects) {
            return _.find(projects, { 'name': name })
        })
    },

    createEntryFromTrelloTaskName: function(trelloTaskName){

        var names = this.projectAndEntryNameFromTrelloTaskName(trelloTaskName);

        if(names.projectName){

            var that = this;
            return this.createProjectIfNotExists(names.projectName).then(function(project){

                return that.startEntry(names.entryName, project);
            });

        }else{
            return this.startEntry(names.entryName);
        }

    },

    createProjectIfNotExists: function (name) {

        var that = this;

        return this.findProjectByName(name).then(function (project) {

            if (!project) {
                return that.createProject(name);
            }

            return project;
        });
    },

    projectAndEntryNameFromTrelloTaskName: function (trelloTaskName) {

        if (trelloTaskName[0] !== "#") {
            return {
                projectName: null,
                entryName: trelloTaskName
            }
        }

        var trelloTaskNameChunks = trelloTaskName.split(" ");

        return{
            projectName: trelloTaskNameChunks.shift().slice(1),
            entryName: trelloTaskNameChunks.join(" ")
        }
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