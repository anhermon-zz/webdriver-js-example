'use strict';

/**
* Jasmine configuration, sets the relevant properties to jasmine global
**/
var AllureReporter = require('jasmine-allure-reporter');
var SpecReporter   = require('jasmine-spec-reporter');

var allureCustom   = require('./allureCustom');
var override       = require('./override');
var allureReporter = new AllureReporter({
    allureReport: {
        resultsDir: 'allure-results'
    }
}, allureCustom);

//modify allure reporter, so that if test case contains an exception, its status will be changed to 'failed'
override(allureReporter, 'specDone' , function (origFN) {
    return function(spec) {     
        var status = this._getTestcaseStatus(spec.status);
        var errorInfo = this._getTestcaseError(spec);
        status = !!errorInfo ? 'failed' : status;
        this.allure.endCase(status, errorInfo);
    }.bind(allureReporter);
});

jasmine.getEnv().addReporter(allureReporter);
jasmine.getEnv().addReporter(new SpecReporter({
    displayStacktrace: 'none',
    displayFailuresSummary: true,
    displayPendingSummary: true,
    displaySuccessfulSpec: true,
    displayFailedSpec: true,
    displayPendingSpec: true,
    displaySpecDuration: false,
    displaySuiteNumber: false,
    colors: {
        success: 'green',
        failure: 'red',
        pending: 'yellow'
    },
    prefixes: {
        success: 'V ',
        failure: 'X ',
        pending: '* '
    },
    customProcessors: []
}));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

module.exports = jasmine;