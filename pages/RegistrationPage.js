'use strict';

var PageObject = require('./PageObject');
var infra     = require('./../infra');
var By        = require('selenium-webdriver').By;
var until     = require('selenium-webdriver').until;

class RegistrationPage extends PageObject {
    /**
     * Constructors
     **/
    constructor(driver) {
        super(driver, infra.config.get('tests.urlRoot') + '/#/login');
    }
    /**
    * Selectors
    **/
    static get firstNameTBSelector() {
        return By.xpath('//input[@id="firstName"]');
    }
    static get lastNameTBSelector() {
        return By.xpath('//input[@name="lastName"]');
    }
    static get userNameTBSelector() {
        return By.xpath('//input[@id="username"]');
    }
    static get passwordTBSelector() {
        return By.xpath('//input[@id="password"]');
    }
    static get registerButtonSelector() {
        return By.xpath('//button[text()="Register"]');
    }
    static get cancelAnchorSelector() {
        return By.xpath('//a[text()="Cancel"]');
    }

    /**
    * Setters
    **/
    set firstNameTB(value) {
        this.actionbot.type(RegistrationPage.firstNameTBSelector, value, {timeout:this.getTimeout('set_firstNameTB')});
    }
    set lastNameTB(value) {
        this.actionbot.type(RegistrationPage.lastNameTBSelector, value, {timeout:this.getTimeout('set_lastNameTB')});
    }
    set userNameTB(value) {
        this.actionbot.type(RegistrationPage.userNameTBSelector, value, {timeout:this.getTimeout('set_userNameTB')});
    }
    set passwordTB(value) {
        this.actionbot.type(RegistrationPage.passwordTBSelector, value, {timeout:this.getTimeout('set_passwordTB')});
    }

    /////
    doRegister(registration) {
        this.firstNameTB = registration.firstName;
        this.lastNameTB  = registration.lastName;
        this.userNameTB  = registration.userName;
        this.passwordTB  = registration.password;
        return this.clickRegistenBtn();
    }
    /////
    clickRegistenBtn() {
        var LoginPage = require('./LoginPage');
        this.actionbot.click(RegistrationPage.registerButtonSelector);
        this.sleep(2000);
        return new LoginPage(this.driver);
    }
    clickCancelAnchor() {
        var LoginPage = require('./LoginPage');
        this.actionbot.click(RegistrationPage.cancelAnchorSelector);
        return new LoginPage(this.driver);
    }
}
module.exports = RegistrationPage;