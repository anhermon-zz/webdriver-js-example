'use strict';

var PageObject = require('./PageObject');
var infra     = require('./../infra');
var By        = require('selenium-webdriver').By;
var until     = require('selenium-webdriver').until;

class WelcomePage extends PageObject {
    /**
     * Constructors
     **/
    constructor(driver) {
        super(driver);
    }
    /**
    * Selectors
    **/
    static get logoutAnchorSelector() {
        return By.xpath('//a[text()="Logout"]');
    }
    static getDeleteUserAnchorSelector(user) {
        return By.xpath('//li[@ng-repeat="user in vm.allUsers"][contains(text(),"' + (user.firstName + ' ' + user.lastName)+'")]/a[text()="Delete"]');
    }

    /////
    clickLogoutAnchor() {
        var LoginPage = require('./LoginPage');
        this.actionbot.click(WelcomePage.logoutAnchorSelector);
        this.sleep(2000);
        return new LoginPage(this.driver);
    }
    clickDeleteUserAnchor(user) {
        this.actionbot.click(WelcomePage.getDeleteUserAnchorSelector(user));
        this.sleep(2000);
        return this;
    }
}
module.exports = WelcomePage;