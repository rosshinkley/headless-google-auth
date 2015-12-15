Log into a Google account, setting up Google's official library without a browser.

## Prerequisites

### Google Client ID and Secret

1. Head to the [Google Developers Console](https://console.developers.google.com).
1. On the dashboard, click on "Use Google APIs".
1. On the lefthand pane, click on "Credentials".
1. Click the dropdown labelled "New credentials".  Select "OAuth Client ID".
1. Click "Web Application".  (This will show additional options.)
1. Enter in a name.  Be sure to name it something informative.
1. Leave the "Authorized JavaScript Origins" blank for the time being.
1. Add `http://localhost:5678` as an authorized redirect URI.  If you change the callback URI or port in the options (see below), make sure the new URI is added or the existing URI is altered to match.
1. Review entries and click "Create" when finished.

Once done, you should see a popover that has the client ID and client secret.  If you need to get to it again, you can click on the name selected in step 6.

### NightmareJS

[Nightmare](https://github.com/segmentio/nightmare) is a browser automation toolkit based on [Electron](https://github.com/atom/electron).  Unlike v0.1.x which used [Casper](https://github.com/n1k0/casperjs) and consequently required several special setup steps, Nightmare is installable and usable via NPM.  For most cases, it will Just Work (tm) out of the box.

However, Electron requires a video buffer to be available.  If you are using this library on a headless system (eg, a server with no X client,  a Docker instance, or a chroot under Crouton), you will need to use a virtual framebuffer to get this library working.  More information about this [can be found in the Nightmare repository's issues.](https://github.com/segmentio/nightmare/issues/224)

## Installation

Use `npm`: `npm install headless-google-auth`

## Options

The exposed method takes an options hash:

* **clientId** - the client ID obtained from the Google Developers Console.
* **clientSecret** - the client secret obtained from the Google Developers Console.
* **email** - the email address to log into.
* **password** - the password for the account.
* **scopes** - scopes to request for the logging in user.  Note that anything specified here is automatically granted.
* **port** - (optional) the port the ad hoc NodeJS server that gets propped up for the Google callback listens on.  Defaults to `5678`.
* **callbackUri** - (optional) the fully-qualified port-inclusive URI the Google login is going to call back to. Defaults to `http://localhost:5678`.
* **accessType** - (optional) the kind of access to get, defaults to "online".  ("offline" will get a refresh token.)

The callback (or promise resolution) passes up the newly set up Google client and the tokens used to create that client.

## Usage

### Callbacks

If you wanted to get a list of GMail messages (albeit only their IDs and thread IDs), for example:

```javascript
var headlessAuth = require('headless-google-auth'),
    gmail = require('googleapis').gmail('v1');

headlessAuth({
    clientId: '[client ID from developer's console]',
    clientSecret: '[client secret from developer's console]',
    email: 'testemail@gmail.com',
    password: 'MySuperSecretPassword',
    scopes:[
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
}, function(err, client, tokens){
    gmail.users.messages.list({
        userId: 'testemail@gmail.com'
        }, function(err, messages){
            //will print out an array of messages plus the next page token
            console.dir(messages);
        });
});
```

### Promises

If you wanted tog et  list of GMail messages like above, but wanted to use promises instead:

```javascript
var headlessAuth = require('headless-google-auth'),
    gmail = require('googleapis').gmail('v1');

var authPromise = headlessAuth({
    clientId: '[client ID from developer's console]',
    clientSecret: '[client secret from developer's console]',
    email: 'testemail@gmail.com',
    password: 'MySuperSecretPassword',
    scopes:[
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
});

//... other code if needed...

authPromise.then(function(client, tokens){
    gmail.users.messages.list({
        userId: 'testemail@gmail.com'
        }, function(err, messages){
            //will print out an array of messages plus the next page token
            console.dir(messages);
        });
});
```

## Further information

Take a look at the [Google NodeJS API Client](https://github.com/google/google-api-nodejs-client) for more information about scopes, authorization schemes, and other API information.

The [Nightmare API documentation](https://github.com/segmentio/nightmare#api) is also an excellent resource.

There are also other libraries that accomplish something similar to this one.  Highlighting the differences:

* **[Google CLI Auth](https://www.npmjs.com/package/google-cli-auth)** - uses the `open` library to open the authorization link in the default (or specified) browser.
* **[Google Auth CLI](https://www.npmjs.com/package/google-auth-cli)** - very similar to the above without the ability to refresh tokens.
* **[Google OAuth2](https://www.npmjs.com/package/google-oauth2)** - uses PhantomJS only to acheive a similar goal, does not use the official Google API library.

