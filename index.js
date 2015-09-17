var http = require('http'),
    google = require('googleapis'),
    spawn = require('child_process')
    .spawn,
    path = require('path'),
    OAuth2 = google.auth.OAuth2;

module.exports = exports = function(options, cb) {
    //ensure all of the required parts have been passed
    options.port = options.port || 5678;
    options.accessType = options.accessType || 'online';
    if (!options.clientId) {
        return cb('No Google client ID specified.');
    }
    if (!options.clientSecret) {
        return cb('No Google client secret specified.');
    }
    if (!options.username) {
        return cb('No Google username specified.');
    }
    if (!options.password) {
        return cb('No Google password specified.');
    }
    if (!options.scopes) {
        return cb('No Google auth scopes specified.');
    }

    //set up the auth client
    var client = new OAuth2(options.clientId, options.clientSecret, 'http://localhost:' + options.port);

    google.options({
        auth: client
    });

    //prop up webhook endpoint
    var server = http.createServer(function(req, res) {
            res.writeHead('200', {
                'Content-Type': 'text/html'
            });
            res.write('<html><body><div style="background-color:#FFF" id="complete">Grant complete.</div></body></html>');
            res.end();
            var code = /code=(.+)$/.exec(req.url)[1];
            client.getToken(code, function(err, tokens) {
                if (!!tokens) {
                    client.setCredentials(tokens);
                }
                server.close(function(closeErr) {
                    cb(err || closeErr, client);
                });
            });
        })
        .listen(options.port, function(err) {
            if (err) {
                return cb(err);
            }

            //create auth url
            var url = client.generateAuthUrl({
                scope: options.scopes,
                access_type: options.accessType
            });

            //shell out to casper to execute google auth login
            var child = spawn('casperjs', [path.resolve(__dirname, 'login.js'), options.username, options.password, url]);
            child.stdout.setEncoding('utf8');
            var diemsg = '';
            child.stderr.on('data', function(data) {
                diemsg += data;
            });

            child.on('close', function(code) {
                if (!!code) {
                    //code is nonzero, kill the server, call back with the error
                    server.close();
                    return cb(diemsg);
                }
            });
        });
};
