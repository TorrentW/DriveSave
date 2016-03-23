var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var path = require('path');
var prettysize = require('prettysize');
var progressStream = require('progress-stream');
var crypto = require('crypto');
var prettyTime =  require('pretty-time');
module.exports = {
    lists: (req, res, next) => {
        req.service.files.list({
            pageSize: 10,
            // fields: " files(id, name,corpus)"
        }, (err, response)=> {
            if (err) {
                console.log(err);
                return res.json(req.error("Error while fetching lists from drive"));
            }
            var dir = _.where(response.files, {mimeType: 'application/vnd.google-apps.folder'});
            return res.json(req.success(dir));
        });
    },
    upload: (req, res)=> {
        console.log("Socket id is " + req.cookies.id);
        var current_client;
        if (req.cookies.id) {
            current_client = _.findWhere(clientLists, {id: req.cookies.id});
        }

        if (!req.query.url) {
            return res.json(req.error("No any url found"));
        }
        var options = {
            url: ' https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers: {},
        }

        var progress = progressStream({
            time: 1000
        });
        var fileId = undefined;
        progress.on('progress', progress=> {
            var per = Math.round(progress.percentage);
            progress.percentage =per;
            progress.transferred = prettysize(progress.transferred);
            progress.remaining = prettysize(progress.remaining);
            progress.speed = prettysize(progress.speed) + "ps";
            progress.eta = prettyTime(progress.eta *1000000000 );
            current_client.emit('upload', { progress ,fileId});
        });
        //First we visit the url
        request.get(req.query.url)
            .on('error', err => {
                return res.json(req.error("Invalid urls"));
            })
            .on('response', response=> {
                //On Response we create headers and upload the file
                options.headers = response.headers;
                options.headers["Authorization"] = "Bearer " + req.cookies.access_token.access_token;
                if (response.statusCode == 200) {
                    response.headers.name = path.basename(req.query.url);
                    response.headers.size = prettysize(response.headers['content-length'], true, true);
                    response.headers.hash = crypto.createHmac('sha256', 'samundrakc').update(response.headers.name + Date.now()).digest('hex');
                    fileId =  response.headers.hash;
                    res.json(req.success(response.headers));
                    progress.setLength(response.headers['content-length']);
                }
                else
                    return res.json(req.error("There was Problem Connecting to api"));

            })
            .pipe(progress)
            .pipe(request.post(options, (err, status, result)=> {
                if (err) {
                    console.log(err);
                    return;
                }

                result = JSON.parse(result);
                if (result.hasOwnProperty('error')) {
                    console.log(result.error.message);
                    return;
                }
                //After file has been upload we rename it
                var updation = {
                    url: 'https://www.googleapis.com/drive/v3/files/' + result.id,
                    method: 'PATCH',
                    headers: {
                        "Authorization": options.headers['Authorization'],
                        'Content-Type': 'application/json'
                    },
                    json: {
                        fileId: result.id,
                        name: path.basename(req.query.url),
                        mimeType: options.headers['content-type'],
                    }
                }
                request(updation, err=> {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            }));
    }
}