'use strict';

var until = require('selenium-webdriver').until;

var untilLocatorIsLocatedAndVisible = function(locator, opt) {
    var onError = function(e) {
        return false;
    }
    return new until.Condition('until element: ' + locator +' is visible', function(driver) {
        var e = driver.findElement(locator);
        e.thenCatch(onError)
        var p = e.isDisplayed();
        p.thenCatch(onError);
        return p.then(function(y) {
            return y;
        }, onError);
    });
};
var elementIsVisible = function(element, opt) {
    var onError = function(e) {
        //console.error(e.message);
        return false;
    }
    return new until.Condition('until element is visible', function() {
        var p = element.isDisplayed();
        return p.then(function(y) {
            return y;
        }, onError);
    });
};
/**
 * custom until condition factory, receives a {webdriver.promise} and a name for the condition,
 * and returns a {webdriver.until.Condition} that will wait until the promise resolves without an error
 * or until timeout.
 * @param Webdriver.promise - a webdriver promise
 * @param name - condition name
 * @param opt - optional arguments
 * @returns {*|webdriver.until.Condition}
 */
var customUntil = function customUntil(promise, name, opt) {
    var onSuccess = function() {
        return true;
    };
    var onError = function(e) {
        return false;
    }
    return new until.Condition(name, promise.then(onSuccess, onError));
}

module.exports = {
    untilLocatorIsLocatedAndVisible : untilLocatorIsLocatedAndVisible,
    elementIsVisible                : elementIsVisible,
    until                           : customUntil
}