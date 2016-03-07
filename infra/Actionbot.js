"use strict";
/*jshint esnext: true */

/**
* Selenium Webdriver wrapper
**/
var customUntil = require('./customUntil');
var step        = require('./steps');
var args        = require('./args');
var config      = require('./config');
var until       = require('selenium-webdriver').until;

var waitForAngularScript = 'try { if (document.readyState !== \'complete\') {return false;}if (window.jQuery) {if (window.jQuery.active) {return false;} else if (window.jQuery.ajax && window.jQuery.ajax.active) {return false;}}if (window.angular) {if (!window.qa) {window.qa = {doneRendering: false};} var injector = window.angular.element(\'*[ng-app]\').injector(); var $rootScope = injector.get(\'$rootScope\'); var $http = injector.get(\'$http\');var $timeout = injector.get(\'$timeout\'); if ($rootScope.$$phase === \'$apply\' || $rootScope.$$phase === \'$digest\' || $http.pendingRequests.length !== 0) { window.qa.doneRendering = false; return false;}if (!window.qa.doneRendering) {$timeout(function() {window.qa.doneRendering = true;}, 0); return false;}}return true;} catch (ex) { return false;}';

var startStep = function onSuccess(name, opt) {
    return function() {
        if (!opt || !opt.cancelSteps) {
            step.start(name);
        }
    }
}
var onSuccess = function onSuccess(opt) {
    return function() {
        if (!opt || !opt.cancelSteps) {
            step.end.success();
        }
        return true;
    }
}
var onSuccessWarn = function onErrorWarn(opt) {
    return function() {
        console.log('onSuccessWarn');
        if (!opt || !opt.cancelSteps) {
            step.end.broken();
        }
        return true;
    }
}
var onErrorFail = function onErrorFail(actionbot, opt) {
    return function(e) {
        console.log('onErrorFail', opt);
        console.error(e.stack);
        if (!opt || !opt.cancelSteps) {
            step.end.fail();
        }
        actionbot.takeScreenshot().thenFinally(function() {
            throw e;
        });
    }
}
class ActionBot {    
    constructor(driver) {
        this.driver = driver;
    }
    static  getTimeout(property) {
        var out = config.get(('tests.actionbot.timeouts.' + property), config.get('tests.actionbot.timeouts.default', 2000));
        return out;
    }
    /**
     * Get WebElement using a locator
     * @param {webdriver.Locator} locator - The locator to use.
     * @param {* } opt - Optional argument
     * @returns {!webdriver.WebElement}
     */
    getElement(locator, opt) {
        opt = !!opt ? opt : {};
        if (!opt.timeout) {
            opt.timeout = ActionBot.getTimeout("getElement");
        }
        this.driver.call(startStep('Get Element:' + locator, opt));
        this.wait('Wait for element:' + locator + ' to be located and visible', customUntil.untilLocatorIsLocatedAndVisible(locator), opt);
        var e = this.driver.findElement(locator);
        e.then(onSuccess(opt), onErrorFail(this, opt));
        return e;
    }
    /**
     * wait until a WebElement is visible
     * @param {!webdriver.WebElement} element - element to wait for to be visible.
     * @param {* } opt - Optional argument
     * @returns {!webdriver.WebElement}
     */
    waitForElementToBeVisible(element, opt) {
        opt = !!opt ? opt : {};
        if (!opt.timeout) {
            opt.timeout = ActionBot.getTimeout("waitForElementToBeVisible");
        }
        this.wait('Wait for element to be visible' + (opt.info ? ': ' + opt.info : ''), customUntil.elementIsVisible(element), opt.timeout)
        return element;
    }
    /**
     * Type text into an input box
     * @param {!webdriver.Locator} textBoxSelector - text box locator.
     * @param {string} text to type
     * @param {* } opt Optional argument
     * @returns {!webdriver.promise.Promise}
     */
    type(textBoxSelector, text, opt) {
        if(!!args.debug) {
            console.log(text, '->', textBoxSelector);
        }
        opt = !!opt ? opt : {};
        opt.timeout = !!opt.timeout ? opt.timeout : ActionBot.getTimeout("type");
        this.driver.call(startStep('Type: "' + text + '" into:' + textBoxSelector + " text box", opt));
        var e = this.getElement(textBoxSelector, opt);
        e.click();
        e.clear();
        var p = e.sendKeys(text);
        p.then(onSuccess(opt), onErrorFail(this, opt));
        return p;
    }
    /**
     * Find a WebElement by locator and click on the center of it
     * @param {!webdriver.Locator} locator - The locator to use.
     * @param {* } opt Optional argument
     * @returns {!webdriver.promise.Promise}
     */
    click(locator, opt) {
        if(!!args.debug) {
            console.log('clicking ->', locator.value);
        }
        var _this = this;
        opt = !!opt ? opt : {};
        if (!opt.timeout) {
            opt.timeout = ActionBot.getTimeout("click");
        }
        var element = _this.getElement(locator, opt);
        opt.info = locator;
        var p = this.clickElement(element, opt);
        if(!!args.debug) {
            p.then(function(res) {
                console.log(locator.value, 'clicked');
            });
        }
    }
    /**
     * Click on the center of WebElement
     * @param {webdriver.WebElement} webElement - element to click
     * @param {*} opt Optional argument
     * @returns {webdriver.promise}
     */
    clickElement(webElement, opt) {
        opt = !!opt ? opt : {};
        opt.timeout = !!opt.timeout ? opt.timeout : ActionBot.getTimeout('clickElement');
        this.driver.call(startStep('Click element ' + (!!opt.info ? ':' + opt.info : ''), opt));
        this.wait('Wait for element to be visible', customUntil.elementIsVisible(webElement), opt);
        var p;
        //experiencing some flakiness when clicking elements, adding some console.logs to check if the issue
        //occurs as a result of clicking a disabled / not enabled elements
        this.wait('Wait for element to be enabled', until.elementIsEnabled(webElement), opt);
//        webElement.getAttribute('disabled').then(function(isDisabled) {
//            if(!!isDisabled) {
//                console.log("******************");
//                console.log('isDisabled:', isDisabled);
//                console.trace();
//            }
//        });
//        webElement.isEnabled().then(function(isEnabled) {
//            if(!isEnabled) {
//                console.log("******************");
//                console.log('isEnabled:', isEnabled);
//            }
//        });
        //internet explorer has some known issues with click event, so when running with explorer we'll use javascript to
        //trigger click event rather then webElement.click().
        //in some cases in won't work (it doesn't work with dropdown options), so we can cancel that behaviour by passing
        //optional argument cancelClickScript = true.
        if (!opt.cancelClickScript || args.browser === 'ie') {
            if(!!args.debug) {
                console.log('script');
            }
            p = this.driver.executeScript("arguments[0].click()", webElement);
        } else {
            if(!!args.debug) {
                console.log('click');
            }
            p = webElement.click();
        }
        p.then(onSuccess(opt), onErrorFail(this, opt));
        return p;
    }

    /**
     * Sometimes webElement.click() can fail even though the element was located and visible, there's no webElement.isClickable
     * method that can be used to wait until element is ready to be clicked, so we'll just create perform the click inside
     * a wait condition, and attempt to click the element until successfully clicking the element, or reaching a give timeout.
     * @param clickFN - webElement.promise
     * @param opt - optional arguments, should contain the desired timeout
     */
    clickRetry(clickFN, opt) {
        this.wait('Try Clicking element until clicked or timeout', customUntil.until(clickFN, 'click to execute successfully'), opt);
    }
    scrollToView(element, opt) {
        opt = !!opt ? opt : {};
        this.driver.call(startStep('Scroll element to view ' + (':' + !!opt.info ? opt.info : ''), opt));
        return this.driver.executeScript('arguments[0].scrollIntoView();', element)
            .then(onSuccess(opt), onErrorFail(this, opt));
    }

    get(url) {
        this.driver.call(startStep('Navigate to URL:' + url));
        return this.driver.get(url)
            .then(onSuccess(), onErrorFail(this));
    }
    title() {
        this.driver.call(startStep("get Title"));
        var p = this.driver.getTitle();
        p.then(onSuccess(), onErrorFail(this));
        return p;
    }
    exists(locator) {
        this.driver.call(function() {
            step.start("Check if:" + locator + " is present");
        });
        var p = this.driver.isElementPresent (locator);
        p.then(onSuccess(), onErrorFail(this));
        return p;
    }
    call(cb) {
        return this.driver.call(cb);
    }
    getSibling(element, opt) {
        opt = !!opt ? opt : {};
        opt.timeout = !!opt.timeout ? opt.timeout : ActionBot.getTimeout('getSibling');
        var n = !!opt.index ? opt.index : 1;
        this.driver.call(startStep('Get ' + n + '\'th sibling element' + (opt.info ? ' of element:' + opt.info: ''), opt));
        var get = function (){
            return element.findElement(commons.By.xpath("following-sibling::*[" + n + "]"));
        };
        var e = get();
        this.wait('Wait for sibling element to be visible', customUntil.elementIsVisible(e), opt);
        e = get();
        e.then(onSuccess(opt), onErrorFail(this, opt));
        return e;
    }

    /**
     * Look for webElement matching given locator, and wait for it to match given text,
     * @param locator
     * @param text
     * @param opt
     * @returns {*|!promise.Promise.<T>|!webdriver.promise.Promise.<T>}
     */
    waitForElementToContainText(locator, text, opt) {
        opt = !!opt ? opt : {};
        var regex = new RegExp(text);
        this.driver.call(startStep('Wait for element:' + locator + ' test to equal: "' + text + '"'));
        var e = this.getElement(locator);
        var p = this.driver.wait(until.elementTextMatches(e, regex), !!opt.timeout ? opt.timeout : ActionBot.getTimeout('waitForElementToContainText'));
        p.then(onSuccess(opt), onErrorFail(this, opt));
        return p;
    }

    //Dropdown utilities
    //comment: There's an open issue in webdriver when working with firefox browser, preventing the proper
    //usage of "click" on dropdown options <a href="https://code.google.com/p/selenium/issues/detail?id=7130"/>
    //a workaround suggested for this issue is utilizing ActionSequence.sendKeys(commons.webdriver.Key.ENTER)
    //instead of WebElement.click to selection an option
    clickDropdown(dropdownSelector, optionSelector, opt) {
        opt = !!opt ? opt : {};
        opt.cancelClickScript = true;
        if (!opt.timeout) {
            opt.timeout = ActionBot.getTimeout("clickDropdown");
        }
        var _this = this;
        var p;
        this.driver.call(startStep("Open dropdown:" + dropdownSelector, opt));
        var dropdown = this.getElement(dropdownSelector, opt);
        if(!!args.debug) {
            this.exists(dropdownSelector).then(function(res) {
                console.log(dropdownSelector, 'exists:', res);
            })
        }
        
        var p = commons.flow.execute(function(){
            if (args.browser === 'firefox') {
                new commons.webdriver.ActionSequence(_this.driver)
                    .click(dropdown)
                    .click(_this.waitForElementToBeVisible(dropdown.findElement(optionSelector), opt))
                    .sendKeys(commons.webdriver.Key.ENTER)
                    .perform();
            } else {
                commons.flow.execute(function() {
                    _this.clickElement(dropdown, opt);      
                });
                var option;
                commons.flow.execute(function() {
                    option = dropdown.findElement(optionSelector);
                    option.then(function(element) {
                        option = element;
                    });
                });
                commons.flow.execute(function() {
                    _this.clickElement(option, opt);
                });
                
//                var option = _this.waitForElementToBeVisible(dropdown.findElement(optionSelector), opt);
//                _this.wait(('Wait for dropdown option:' + optionSelector + ': to be visible'), customUntil.elementIsVisible(option), opt);
//                p = option.click({cancelClickScript:true});
            }
        });
        p.then(onSuccess(opt), onErrorFail(this, opt));
    }
    selectDropDownOptionByLabel(dropdown, label, opt) {
        var option = commons.By.xpath(".//option[@label = '" + label + "' or text() = '" + label + "']");
        this.clickDropdown(dropdown, option, opt);
    }
    selectDropDownOptionByPartialLabel(dropdown, label, opt) {
        var option   = commons.By.xpath(".//option[contains(@label,'" + "'| or text() = '" + label + "']");
        this.clickDropdown(dropdown, option, opt);
    };
    selectDropDownOptionByValue(dropdown, value,opt) {
        var option   = commons.By.xpath("//option[@value = '" + label + "']");
        this.clickDropdown(dropdown, option, opt);
    }
    wait(description, condition, opt) {
        if (!opt) {
            console.warn("called wait without specifying a timeout, nothing will happen, was this intentional?");
            console.warn("Description:", description);
            console.trace();
        }
        var _this = this;
        if (!opt || !opt.timeout) {
            return;
        }
        this.driver.call(startStep(description, opt));
        //one part timeout, if exceeded fails
        var p;
        if (typeof opt.timeout === 'number') {
            p = this.driver.wait(condition, opt.timeout).then(onSuccess(opt),onErrorFail(this, opt));
        } else
        //two part timeout, if first is exceeded, step will appear as "broken" in the report, if second is exceeded, fails
        if (typeof opt.timeout.responsive === 'number') {
            var responsiveTimeout = opt.timeout.responsive;
            var functionalTimeout = opt.timeout.functional;
            var diff = functionalTimeout - responsiveTimeout;
            functionalTimeout = diff <= 0 ? responsiveTimeout : diff;
            p = this.driver.wait(condition, responsiveTimeout)
                .then(onSuccess(opt) , function(e){
                    _this.driver.wait(condition, functionalTimeout).then(onSuccessWarn(opt),onErrorFail(_this, opt));
                });
        }
        return p;
    }
    refresh() {
        this.driver.executeScript("location.reload()");
        this.driver.sleep(ActionBot.getTimeout("refresh"));
    }
    sleep(ms) { 
        return this.driver.sleep(ms);
    }
    takeScreenshot() {
        var property = 'tests.actionbot.screenshots';
        if (!config.get(property + '.enabled', false)) {
            return;
        }
        console.log('Taking screenshot...');
        var writeScreenshot = function writeScreenshot(data) {
            allure.createAttachment('Screenshot', function () {
                return new Buffer(data, 'base64')
            }, 'image/png')();
        };
        return this.driver.takeScreenshot().then(function(data) {
            return writeScreenshot(data);
        });
    }
    /**
    * Waits for Angular to finishe loading, also waits for document to be ready and jQuery.
    **/
    waitForAngular(opt) {
        opt = !!opt ? opt : {};
        opt.timeout = opt.timeout || ActionBot.getTimeout("waitForAngular") || 20000;
        var _this = this;
        var onError = function(e){};
        var condition =  new until.Condition('until Angular is done loading page', function() {
            return _this.driver.executeScript(waitForAngularScript)
                .then(function(y) {
                    return y;
                }, onErrorFail);
        });
        return this.wait('Wait for angular to finish loading', condition, opt);
    }
}
module.exports = ActionBot;