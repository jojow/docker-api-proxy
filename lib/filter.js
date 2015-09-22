var _ = require('lodash');
var url = require('url');

// regular expressions to match URLs
var reBuild = new RegExp('.*/build.*', 'i');
var reImg = new RegExp('.*/images.*', 'i');
var reImgGet = new RegExp('.*/images.*/get.*', 'i');
var reAuth = new RegExp('.*/auth.*', 'i');
var reCommit = new RegExp('.*/commit.*', 'i');
var reExec = new RegExp('.*/exec.*', 'i');
var reContCreate = new RegExp('.*/containers/create.*', 'i');
var reContStart = new RegExp('.*/containers/.*/start.*', 'i');
var reContExec = new RegExp('.*/containers/.*/exec.*', 'i');
var reContAttach = new RegExp('.*/containers/.*/attach.*', 'i');
var reContRename = new RegExp('.*/containers/.*/rename.*', 'i');
var reContExport = new RegExp('.*/containers/.*/export.*', 'i');
var reContArchive = new RegExp('.*/containers/.*/archive.*', 'i');
var reContCopy = new RegExp('.*/containers/.*/copy.*', 'i');



var allowedTokens = {};
if (process.env.ALLOWED_TOKENS) _.each(process.env.ALLOWED_TOKENS.split(';'), function(tokenStr) {
  var token = _.first(tokenStr.split(':'));
  var user = _.last(tokenStr.split(':'));

  allowedTokens[token] = user;
});
var allowRequestByToken = function(req) {
  if (_.isEmpty(allowedTokens)) return true;

  var query = url.parse(req.url, true).query;

  return _.reduce(allowedTokens, function(result, user, token) {
    req.url = req.url.replace(token + '-', user + '-');

    return (!_.isEmpty(query) && _.startsWith(query.name, token + '-')) || result;
  }, false);
};

var allowRequestByBody = function(req) {
  var cmdValue = null;
  var entrypointValue = null;
  var mountsValue = null;
  var privilegedValue = null;
  var capaddValue = null;
  var devicesValue = null;
  var bindsValue = null;

  _.each(req.jsonBody, function(val, key) {
    if (key.toLowerCase().trim() === 'cmd') cmdValue = val;
    else if (key.toLowerCase().trim() === 'entrypoint') entrypointValue = val;
    else if (key.toLowerCase().trim() === 'mounts') mountsValue = val;
  });

  _.each(req.jsonBody.HostConfig, function(val, key) {
    if (key.toLowerCase().trim() === 'privileged') privilegedValue = val;
    else if (key.toLowerCase().trim() === 'capadd') capaddValue = val;
    else if (key.toLowerCase().trim() === 'devices') devicesValue = val;
    else if (key.toLowerCase().trim() === 'binds') bindsValue = val;
  });

  if (!_.isEmpty(cmdValue)) return 'cmd property is not allowed';
  if (!_.isEmpty(entrypointValue)) return 'entrypoint property is not allowed';
  if (!_.isEmpty(mountsValue)) return 'mounts property is not allowed';
  if (privilegedValue) return 'privileged property must not be true';
  if (!_.isEmpty(capaddValue)) return 'capadd property is not allowed';
  if (!_.isEmpty(devicesValue)) return 'devices property is not allowed';
  if (!_.isEmpty(bindsValue)) return 'binds property is not allowed';
};



// check if request body has to be inspected
var inspectRequestBody = function(req) {
  if (reContCreate.test(req.url) || reContStart.test(req.url)) return true;

  return false;
};



// check if request is allowed
var allowRequest = function(req) {
  var reqMethod = req.method.toLowerCase().trim();

  if (reqMethod === 'put') return false;

  if (reqMethod === 'post') {
    if (reBuild.test(req.url)) return false;
    if (reImg.test(req.url)) return false;
    if (reAuth.test(req.url)) return false;
    if (reCommit.test(req.url)) return false;
    if (reExec.test(req.url)) return false;
    if (reContExec.test(req.url)) return false;
    if (reContAttach.test(req.url)) return false;
    if (reContRename.test(req.url)) return false;
    if (reContCopy.test(req.url)) return false;

    if (reContCreate.test(req.url)) {
      if (!allowRequestByToken(req)) return 'invalid or missing token for container name';
    }

    if (reContCreate.test(req.url) || reContStart.test(req.url)) {
      var allowByBody = allowRequestByBody(req);

      if (allowByBody === false || _.isString(allowByBody)) return allowByBody;
    }
  }

  if (reqMethod === 'delete') {
    if (reImg.test(req.url)) return false;
  }

  if (reqMethod === 'get') {
    if (reImgGet.test(req.url)) return false;
    if (reContArchive.test(req.url)) return false;
    if (reContArchive.test(req.url)) return false;
  }

  return true;
};



module.exports = {
  allowRequest: allowRequest,
  inspectRequestBody: inspectRequestBody
};
