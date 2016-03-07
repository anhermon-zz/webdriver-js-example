'use strict';

/**
 * monkey patch allure.prototype.endCase so that test cases will inherit the worst status of its child steps
 * for example: if the test passed, but one of its steps status is "broken" the test case will status will be set to "broken"
 */
var STATUS = {
    'passed' : 1,
    'broken' : 2,
    'failed' : 3
};
var processStep = function processStep(step) {
    if(!step) {
        return;
    }
    if(!step.steps ||  step.steps.length === 0) {
        return {status:step.status, stop:step.stop};
    } else {
        var childrenStatusList = step.steps.map(function(step) {return processStep(step);});
        var worstChildStatus = 'passed';
        var latestTimestamp = 0;
        childrenStatusList.forEach(function(childrenStatus) {
            if (STATUS[childrenStatus.status] > STATUS[worstChildStatus]) {
                worstChildStatus = childrenStatus.status;
            }
            if(latestTimestamp < childrenStatus.stop) {
                latestTimestamp = childrenStatus.stop;
            }
        });
        step.status = STATUS[step.status] > STATUS[worstChildStatus] ? step.status : worstChildStatus;
        if (!step.stop) {
            step.stop = latestTimestamp;
        }
        var out = {status:step.status, stop:!!step.stop ? step.stop : latestTimestamp};
        return out;
    }
};
allure._allure.endCase = function (status, err, timestamp) {
    //end all steps that were not ended as failed
    var stop = false;
    while(!stop) {
        try {
            allure._allure.endStep('passed');
        }catch(e){
            stop = true;
        }
    }

    var suite = this.getCurrentSuite();
    var test = suite.currentTest;
    var stepStatus = processStep(test);
    if(!!stepStatus) {
        var result = STATUS[status] > STATUS[stepStatus.status] ? status : stepStatus.status;
        suite.currentTest.end(result, err, !!timestamp ? timestamp : stepStatus.stop);
    }
    else {
        suite.currentTest.end(!!status ? status : 'failed',err,!!timestamp ? timestamp : new Date().getTime());
    }
    suite.currentTest = null;
}
module.exports = allure._allure;