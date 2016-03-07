var flow = require('selenium-webdriver').promise.controlFlow();
/**
 * Convenience metods for allure report steps
 * @type {{start: Function, end: {success: Function, fail: Function}}}
 */
var step = {
    start:function start(name){
        allure._allure.startStep(name);
    },
    end:{
        success : function success() {
            allure._allure.endStep('passed');
        },
        broken : function broken() {
            allure._allure.endStep('broken');
        },
        fail : function fail() {
            allure._allure.endStep('failed');
        }
    },
    executeStep: function executeStep(name, fn, reportStep) {
        reportStep = (reportStep !== false);
        var p = flow.execute(function () {
            if(!!reportStep) {
                allure._allure.startStep(name);
            }
            fn();
        });
        return p.then(function onSuccess() {
            console.log(name, ' success');
            if(!!reportStep) {
                allure._allure.endStep('passed');
            }
        }, function onError(e) {
            console.log(name, ' failed');
            console.log(e.stack);
            if(!!reportStep) {
                allure._allure.endStep('failed');
            }
            throw e;
        });
    }
}

module.exports = step;