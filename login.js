var Nightmare = require('nightmare'),
    vo = require('vo'),
    uuid = require('uuid'),
    debug = require('debug')('headless-google-auth');


var run = function *(options) {
    var nightmare = new Nightmare({
        'skip-taskbar': true,
        'web-preferences': {
            partition:'persist:' + uuid.v4()
        }
    });

    debug('starting nightmare');
    var captchaVisible = yield nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5')
        .goto(options.url)
        .wait('input[name="Email"]')
        .type('input[name="Email"]', options.email)
        .click('input#next')
        .wait('div#identifier-captcha')
        .visible('div#identifier-captcha')

    debug('checking captcha');
    if (captchaVisible) {
        throw new Error('captcha must be cleared manually');
    }

    debug('starting password entry');
    var loginFail = yield nightmare
        .wait('input#Passwd')
        .type('input#Passwd', options.password)
        .wait(500)
        .click('input#signIn')
        .visible('span[role="alert"]');
    
    debug('checking login failure');
    if (loginFail) {
        throw new Error('login failed: bad password');
        return;
    }

    debug('approving access');
    yield nightmare
        .wait('button#submit_approve_access')
        .wait(3000)
        .click('button#submit_approve_access')
        .wait('div#complete')
        .end();
};

module.exports = exports = function(options, cb) {
    vo(run)(options, function(err) {
        debug('finished.');
        cb(err);
    });
};
