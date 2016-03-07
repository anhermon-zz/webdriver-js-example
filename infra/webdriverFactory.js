"use strict";

var webdriver             = require('selenium-webdriver');
var path                  = require('path');
var config                = require('./config');
var args                  = require('./args');

var server                = config.get('tests.server');
var drivers = [];

//set default browser if one was not specified
setBrowserDriver();

module.exports = {
    init     : init,
    clear    : clear
};

/**
 * Webdriver factory method
 * @param options - optional args
 * @returns {!webdriver.WebDriver}
 */
function init(options) {
    options = !!options ? options : {};
    var driver = initDriver(options);
    driver.manage().window().maximize();
    drivers.push(driver);
    return driver;
}
function clear(options) {
    return flow.execute(function(){
                flow.execute(function(){
                    drivers.forEach(function(driver) {
                        driver.quit();
                    });
                });
                flow.execute(function(){
                    drivers = [];
                });
    });
}
///
/**
* Set relevant browser driver
**/
function setBrowserDriver() {
    if(!!server.remote) return;
    if(!args.browser) {
        args.browser = "firefox";
        return;
    }
    if (args.browser === "chrome") {
        var chrome = require('selenium-webdriver/chrome');
        var service           = new chrome.ServiceBuilder(config.get('tests.pathToChromeDriver')).build();
        chrome.setDefaultService(service);
    } 
    else if(args.browser === "ie") {
        process.env.PATH = process.env.PATH + ';' + path.resolve (config.get('tests.pathToIEDriver'));
    }
};

function initDriver(options) {
    var capabilities = webdriver.Capabilities[args.browser]();
    if(args.browser === "ie") {
        if(!!capabilities.caps_) {
            capabilities.caps_.ignoreProtectedModeSettings = true;
        } else {
            capabilities.ignoreProtectedModeSettings = true;
        }
    }
    var builder = new webdriver.Builder().withCapabilities(capabilities);
    if(!!server.remote) {
        builder = builder.usingServer(server.address);
    }
    return builder.build();
}