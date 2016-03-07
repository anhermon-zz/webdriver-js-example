'use strict';

var PageObject = require('./PageObject');
var infra     = require('./../infra');
var By        = require('selenium-webdriver').By;
var until     = require('selenium-webdriver').until;

class LoginPage extends PageObject {
    /**
     * Constructors
     **/
    constructor(driver) {
        super(driver, infra.config.get('tests.urlRoot') + '/#/login');
    }
    /**
    * Selectors
    **/
    static get userNameTBSelector() {
        return By.xpath('//input[@id="username"]');
    }
    static get passwordTBSelector() {
        return By.xpath('//input[@id="password"]');
    }
    static get loginButtonSelector() {
        return By.xpath('//button[text()="Login"]');
    }
    static get registerAnchorSelector() {
        return By.xpath('//a[text()="Register"]');
    }

    /**
    * Setters
    **/
    set userNameTB(value) {
        this.actionbot.type(LoginPage.userNameTBSelector, value, {timeout:this.getTimeout('set_userNameTB')});
    }
    set passwordTB(value) {
        this.actionbot.type(LoginPage.passwordTBSelector, value, {timeout:this.getTimeout('set_passwordTB')});
    }

    /////
    doLogin(user) {
        this.userNameTB = user.userName;
        this.passwordTB = user.password;
        return this.clickLoginButton();
    }
    /////
    clickRegisterAnchor() {
        var RegistrationPage = require('./RegistrationPage');
        this.actionbot.click(LoginPage.registerAnchorSelector);
        return new RegistrationPage(this.driver);
    }
    clickLoginButton(){
        var WelcomePage = require('./WelcomePage');
        this.actionbot.click(LoginPage.loginButtonSelector, {timeout:this.getTimeout('clickLoginButton')});
        return new WelcomePage(this.driver);
    }
}
module.exports = LoginPage;