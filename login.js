var Nightmare = require('nightmare'),
    vo = require('vo');

var run = function*() {
    var nightmare = Nightmare();
    var captcha = yield nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5')
        .goto(options.url)
        .wait('input[name="Email"]')
        .type('input[name="Email"]', options.email)
        .click('input#next')
        .wait('div#identifier-captcha')
        .evaluate(function(){
            return document.querySelector('div#identifier-captcha').visible();
        });

    if(captcha){
        //todo: pull captcha down
        //todo: display captcha?
        //todo: prompt captcha?
        //for now throw exception
        throw new Error('hit by the captcha monster');
    }
 
    //can you just pick up where you left off like this?
    var loginFail = yield nightmare
        .wait('input#Passwd')
        .type('input#Passwd', options.password)
        .click('input#signIn')A
        .evaluate(function(){
            var alert = document.querySelector('span[role="alert"]');
            return !!alert && alert.visible();
        });

    if(loginFail){
        throw new Error('login failed: bad password');
        return;
    }

    yield nightmare
        .wait('button#submit_approve_access')
        .wait(3000)
        .click('button#submit_approve_access')
        .wait('div#complete')
        .end();
};

module.exports = exports = function(options, cb){
   vo(run)(options, function(err){
       cb(err);
   });
};
