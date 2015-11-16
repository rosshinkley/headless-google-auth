var Nightmare = require('nightmare'),
    vo = require('vo');


var run = function*(options) {
    var nightmare = Nightmare();
    console.log('starting nightmare');
    var captcha = yield nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5')
        .goto(options.url)
        .wait('input[name="Email"]')
        .type('input[name="Email"]', options.email)
        .click('input#next')
        .wait('div#identifier-captcha')
        .evaluate(function() {
            return false;
            //return document.querySelector('div#identifier-captcha')
            //    .visible();
        }).run()

    console.log('checking captcha');
    if (captcha) {
        //todo: pull captcha down
        //todo: display captcha?
        //todo: prompt captcha?
        //for now throw exception
        throw new Error('hit by the captcha monster');
    }

    console.log('starting password entry');
    //can you just pick up where you left off like this?
    var loginFail = yield nightmare
        .wait('input#Passwd')
        .type('input#Passwd', options.password)
        .click('input#signIn')
        .evaluate(function() {
            var alert = document.querySelector('span[role="alert"]');
            return !!alert && alert.visible();
        });

    console.log('checking login failure');
    if (loginFail) {
        throw new Error('login failed: bad password');
        return;
    }

    console.log('approving access');
    yield nightmare
        .wait('button#submit_approve_access')
        .wait(3000)
        .click('button#submit_approve_access')
        .wait('div#complete')
        .end();
};

module.exports = exports = function(options, cb) {
    vo(run)(options, function(err) {
        cb(err);
    });
};
