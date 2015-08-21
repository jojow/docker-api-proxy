var _ = require('lodash');

// regular expressions to match URLs
var reBuild = new RegExp('.*/build.*', 'i');
var reImages = new RegExp('.*/images.*', 'i');
var reAuth = new RegExp('.*/auth.*', 'i');
var reCommit = new RegExp('.*/commit.*', 'i');
var reExec = new RegExp('.*/exec.*', 'i');
var reContCreate = new RegExp('.*/containers/create.*', 'i');
var reContExec = new RegExp('.*/containers/.*/exec.*', 'i');
var reContAttach = new RegExp('.*/containers/.*/attach.*', 'i');



// check if body has to be inspected
var inspectBody = function(req) {
  if (reContCreate.test(req.url)) return true;

  return false;
};



// check if request is allowed
var allowRequest = function(req) {
  var reqMethod = req.method.toLowerCase().trim();

  if (reqMethod === 'put') return false;

  if (reqMethod === 'post') {
    if (reBuild.test(req.url)) return false;
    if (reImages.test(req.url)) return false;
    if (reAuth.test(req.url)) return false;
    if (reCommit.test(req.url)) return false;
    if (reExec.test(req.url)) return false;
    if (reContExec.test(req.url)) return false;
    if (reContAttach.test(req.url)) return false;

    if (reContCreate.test(req.url)) {
      var cmdValue = null;
      var entrypointValue = null;

      _.each(req.jsonBody, function(val, key) {
        if (key.toLowerCase().trim() === 'cmd') cmdValue = val;
        else if (key.toLowerCase().trim() === 'entrypoint') entrypointValue = val;
      });

      if (cmdValue) return 'cmd property is not allowed';
      if (entrypointValue) return 'entrypoint property is not allowed';
    }
  }

  if (reqMethod === 'delete') {
    if (reImages.test(req.url)) return false;
  }

  return true;
};



module.exports = {
  allowRequest: allowRequest,
  inspectBody: inspectBody
};
