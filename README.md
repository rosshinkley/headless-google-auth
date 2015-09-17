Log into a Google account using OAuth2 without a browser.

##Prerequisites

###Google Client ID and Secret

1. Head to the [Google Developers Console](https://console.developers.google.com).
1. Create a new project.  Be sure to name it something informative.
1. Navigate to the newly-minted project by clicking on the project name.
1. On the left-hand side, navigate to "APIs & Auth" > "Credentials".
1. Click on "Add Credentials", then select "OAuth 2.0 client ID".
1. Select "Web Application".
1. Enter in a name.  Again, be sure to name it something informative.
1. Leave the "Authorized JavaScript Origins" blank for the time being.
1. Add `http://localhost:5678` as an authorized redirect URI.  If you change the callback URI or port in the options (see below), make sure the new URI is added or the existing URI is altered to match.

Once done, you should see a popover that has the client ID and client secret.  If you need to get to it again, you can click on the name selected in step 7.

###CasperJS

Casper is a utility toolset for PhantomJS.  Installation instructions can be found in the [Casper documentation](http://docs.casperjs.org/en/latest/installation.html).  You will need to ensure that PhantomJS (>=1.8.2) and Python (>=2.6) are installed first.

##Installation

Use `npm`: `npm install headless-google-auth`

##Options

The exposed method takes an options hash:

* **clientId** - the client ID obtained from the Google Developers Console.
* **clientSecret** - the client secret obtained from the Google Developers Console.
* **username** - the email address to log into.
* **password** - the password for the account.
* **scopes** - scopes to request for the logging in user.  Note that anything specified here is automatically granted.
* **port** - (optional) the port the ad hoc NodeJS server that gets propped up for the Google callback listens on.  Defaults to `5678`.
* **callbackUri** - (optional) the fully-qualified port-inclusive URI the Google login is going to call back to. Defaults to `http://localhost:5678`.
* **accessType** - (optional) the kind of access to get, defaults to "online".  ("offline" will get a refresh token.)

The callback gives the set up Google client if needed.

##Usage

If you wanted to get a list of GMail messages (albeit only their IDs and thread IDs), for example:

```
var headlessAuth = require('headless-google-auth'),
    gmail = require('googleapis').gmail('v1');
headlessAuth({
    clientId: '[client ID from developer's console]',
    clientSecret: '[client secret from developer's console]',
    username: 'testemail@gmail.com',
    password: 'MySuperSecretPassword',
    scopes:[
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
}, function(err, client){
    gmail.users.messages.list({
        userId: 'testemail@gmail.com'
        }, function(err, messages){
            //will print out an array of messages plus the next page token
            console.dir(messages);
        });
});
```

##Further information

Take a look at the [Google NodeJS API Client](https://github.com/google/google-api-nodejs-client) for more information about scopes, authorization schemes, and other API information.

The [Casper API documentation](http://docs.casperjs.org/en/latest/modules/index.html) is also an excellent resource.

There are also other libraries that accomplish something similar to this one.  Highlighting the differences:

* **[Google CLI Auth](https://www.npmjs.com/package/google-cli-auth)** - uses the `open` library to open the authorization link in the default (or specified) browser.
* **[Google Auth CLI](https://www.npmjs.com/package/google-auth-cli)** - very similar to the above without the ability to refresh tokens.
* **[Google OAuth2](https://www.npmjs.com/package/google-oauth2)** - uses PhantomJS only to acheive a similar goal, does not use the official Google API library.

