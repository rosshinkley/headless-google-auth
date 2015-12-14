require('es6-promise')
  .polyfill();
var http = require('http'),
  google = require('googleapis'),
  login = require('./login'),
  path = require('path'),
  OAuth2 = google.auth.OAuth2;

module.exports = exports = function(options, cb) {
  var ix = new Promise(function(resolve, reject) {
    //ensure all of the required parts have been passed
    options.callbackUri = options.callbackUri || 'http://localhost:5678';
    options.port = options.port || 5678;
    options.accessType = options.accessType || 'online';
    if (!options.clientId) {
      return reject('No Google client ID specified.');
    }
    if (!options.clientSecret) {
      return reject('No Google client secret specified.');
    }
    if (!options.email) {
      return reject('No email specified.');
    }
    if (!options.password) {
      return reject('No Google password specified.');
    }
    if (!options.scopes) {
      return reject('No Google auth scopes specified.');
    }

    //set up the auth client
    var client = new OAuth2(options.clientId, options.clientSecret, options.callbackUri);

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
            if (err || closeErr) {
              return reject(err || closeErr);
            }
            resolve(tokens);
          });
        });
      })
      .listen(options.port, function(err) {
        if (err) {
          return cb(err);
        }

        //create auth url
        options.url = client.generateAuthUrl({
          scope: options.scopes,
          access_type: options.accessType
        });

        login(options)
          .then(function() {
            //do nothing
          })
          .catch(function(err) {
            return reject(err);
          });
        //otherwise, wait for the propped up dummy server to get called and for the auth token process to complete
      });
  });

  if (!cb) {
    return ix;
  }

  ix
    .then(function(tokens) {
      cb(null, tokens);
    })
    .catch(function(err) {
      cb(err);
    });

};
