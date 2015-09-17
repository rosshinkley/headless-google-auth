var casper = require('casper')
    .create(),
    util = require('utils');

//args:[
//username,
//password,
//auth link
//]

casper.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5');
casper.start(casper.cli.args[2], function() {
    casper.waitForSelector('input[name="Email"]', function() {
        this.sendKeys('input[name="Email"]', casper.cli.args[0]);
    });
});

casper.then(function() {
    casper.mouseEvent('click', 'input#next');
});

casper.then(function() {
    casper.waitForSelector('div#identifier-captcha', function() {
        if (this.exists('div#identifier-captcha') && this.visible('div#identifier-captcha')) {
            casper.die('Catpcha monster got you.  You will have to go log in by hand to clear the captcha up.');
        }
    });
});


casper.then(function() {
    casper.waitForSelector('input#Passwd', function() {
        this.sendKeys('input#Passwd', casper.cli.args[1]);
        this.mouseEvent('click', 'input#signIn');
    });
});

casper.then(function() {
    if (this.exists('span[role="alert"]') && this.visible('span[role="alert"]')) {
        this.capture(fname());
        casper.die('Password entered did not work.');
    }
});
casper.then(function() {
    //hack: wait for the approve access button to be available
    casper.waitForSelector('button#submit_approve_access', function() {
        casper.wait(3000, function() {
            casper.click('button#submit_approve_access');
        });
    });
});

casper.then(function() {
    casper.waitForSelector('div#complete', function() {
        casper.exit();
    });
});

casper.run();
