'use strict';

var infra     = require('./../infra');
var By        = require('selenium-webdriver').By;
var until     = require('selenium-webdriver').until;



class PageObject {
    constructor(driver, url_opt) {
        this.driver = driver;
        this.actionbot = new infra.Actionbot(driver);
        this.url    = url_opt;
    }
    get pageName () {
        return this.constructor.name;
    }
    getTimeout(methodName) {
        var out;
        var property = 'tests.pages.timeouts' + this.pageName + '.' + methodName;
        if (infra.config.has(property)) {
            return infra.config.get(property);
        }
        property = 'tests.pages.timeouts' + this.pageName + '.default';
        if (infra.config.has(property)) {
            return infra.config.get(property);
        }
        return false;
    }
    navigate(){
        if(!this.url) {
            var warning = 'page:' + this.pageName + ' has not URL!';
            console.warn(warning);
            infra.steps.start(warning);
            infra.steps.end.broken();
            return this;
        };
        this.actionbot.get(this.url);
        this.driver.sleep(2000);
        return this;
    }
    then(onSucssess) {
        this.driver.call(onSucssess);
        return this;
    }
    sleep(ms) {
        this.driver.sleep(ms);
        return this;
    }
    quit() {
        this.driver.quit();
        return this;
    }   
}
module.exports = PageObject;