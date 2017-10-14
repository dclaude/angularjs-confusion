exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    'e2e/*.js'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  // @TODO: to be changed to the url which serves our web app (conFusion)
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine',
    directConnect: true,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};

