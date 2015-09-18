var _ = require('lodash');
var spawn = require('child_process').spawn;
var url = require('url');
var request = require('request');

var reContStart = new RegExp('.*/containers/.*/start.*', 'i');
var reContStop = new RegExp('.*/containers/.*/stop.*', 'i');

var childProcesses = {};

var gateway = {
  address: process.env.GATEWAY_ADDRESS,
  user: process.env.GATEWAY_USER,
  keyPath: process.env.GATEWAY_KEYPATH
};



var manageGateway = function(req, res, ctx, callback) {
  if (!gateway.address || !gateway.user || !gateway.keyPath) return callback();

  ctx = ctx || {};

  res.on('finish', function() {
    if (reContStart.test(req.url)) {
      var urlParts = req.url.split('/');
      urlParts.pop();
      var containerId = urlParts.pop();

      request.get({ url: ctx.targetUrl + '/containers/' + containerId + '/json', json: true }, function(err, response, body) {

        if (err) return callback(err);
        else if (response.statusCode !== 200) return callback(new Error('http response status code ' + response.statusCode));

        _.each(_.get(body, 'NetworkSettings.Ports'), function(mappingArr, portStr) {
          var port = _.get(mappingArr, ['0', 'HostPort']);

          if (!port) return;

          childProcesses[port] = childProcesses[port] || {};

          childProcesses[port].id = containerId;

          if (childProcesses[port].proc) childProcesses[port].proc.kill('SIGKILL');

          childProcesses[port].proc = spawn('ssh', [ '-p22', '-N', '-o', 'StrictHostKeyChecking=no',
            '-R', gateway.address + ':' + port + ':localhost:' + port,
            '-i', gateway.keyPath, gateway.user + '@' + gateway.address ]);

          childProcesses[port].proc.stdout.on('data', function(data) {
            if (!_.isString(data)) data = data.toString();

            console.log('[action]', 'child ssh tunnel stdout:', data);
          });

          childProcesses[port].proc.stderr.on('data', function(data) {
            if (!_.isString(data)) data = data.toString();

            console.log('[action]', 'child ssh tunnel stderr:', data);
          });

          childProcesses[port].proc.on('close', function(code) {});
        });

        callback();
      });
    } else if (reContStop.test(req.url)) {
      var urlParts = req.url.split('/');
      urlParts.pop();
      var containerId = urlParts.pop();

      _.each(childProcesses, function(child, port) {
        if (containerId === child.id) child.proc.kill('SIGKILL');

        delete childProcesses[port];
      });

      callback();
    }
  });

/*
  var _write = res.write;
  var _end = res.end;

  res.rawBody = '';

  res.write = function(chunk, encoding, callback) {
    if (!chunk) return;

    if (Buffer.isBuffer(chunk)) res.rawBody += chunk.toString();
    else res.rawBody += chunk;

    return _write.call(res, chunk, encoding, callback);
  };

  res.end = function(chunk, encoding, callback) {
    if (chunk && !_.isFunction(chunk)) res.write(chunk, encoding);

    return _end.call(res, chunk, encoding, callback);
  };

  res.on('finish', function() {
    try {
      res.jsonBody = JSON.parse(res.rawBody);
    } catch (err) {}

    if (res.jsonBody) {
      _.each(ports, function(port) {
        childProcesses[port].id = res.jsonBody.Id;
      });
    }
  });

  callback();
*/
};



process.on('exit', function(code) {
  _.each(childProcesses, function(child) {
    child.proc.kill('SIGKILL');
  });
});



module.exports = {
  manageGateway: manageGateway
};
