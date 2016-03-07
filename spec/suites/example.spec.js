var infra = require('./../../infra');
var pages = require('./../../pages');
jasmine.DEFAULT_TIMEOUT_INTERVAL = infra.config.get('tests.specs.example.jasmine.timeout');

describe('Test suite', function() {
   
    it('Test case', function(done) {
        data = infra.config.get('tests.specs.example.tests.example.data');
        driver = infra.webdriverFactory.init();
        loginPage = new pages.LoginPage(driver);
        loginPage.navigate();
        registrationPage = loginPage.clickRegisterAnchor();
        loginPage = registrationPage.doRegister(data.user);
        
        welcomePage = loginPage.doLogin(data.user);
        
        welcomePage.clickDeleteUserAnchor(data.user);
        loginPage = welcomePage.clickLogoutAnchor();
        loginPage.sleep(5000);
        loginPage.quit().then(done);
        var driver, loginPage, registrationPage, welcomePage, user;
    });
});