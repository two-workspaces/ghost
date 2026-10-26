// Railway's healthcheck is plain http with no X-Forwarded-Proto and the
// healthcheck host, so Ghost answers it with a redirect to its https url,
// which never counts as healthy. Present those requests as the real site.
const http = require('http');
const site = process.env.url && new URL(process.env.url);
const emit = http.Server.prototype.emit;
http.Server.prototype.emit = function (event, req, ...rest) {
  if (site && event === 'request' && /^RailwayHealthCheck\//.test(req.headers['user-agent'] || '')) {
    req.headers['x-forwarded-proto'] = site.protocol.slice(0, -1);
    req.headers.host = site.host;
  }
  return emit.call(this, event, req, ...rest);
};
