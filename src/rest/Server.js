"use strict";
var restify = require("restify");
var Util_1 = require("../Util");
var InsightFacade_1 = require("../controller/InsightFacade");
var Server = (function () {
    function Server(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
        Server.myfacade = new InsightFacade_1.default();
    }
    Server.prototype.stop = function () {
        Util_1.default.info('Server::close()');
        var that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    };
    Server.prototype.start = function () {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info('Server::start() - start');
                that.rest = restify.createServer({
                    name: 'insightUBC'
                });
                that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }));
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get('/', function (req, res, next) {
                    res.send(200);
                    return next();
                });
                that.rest.get('/echo/:msg', Server.echo);
                that.rest.put('/dataset/:id', Server.add);
                that.rest.del('/dataset/:id', Server.remove);
                that.rest.post('query', Server.query);
                that.rest.listen(that.port, function () {
                    Util_1.default.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });
                that.rest.on('error', function (err) {
                    Util_1.default.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    };
    Server.add = function (req, res, next) {
        console.log('add here');
        var content = new Buffer(req.params.body).toString('base64');
        var contentid = req.params.id;
        try {
            Server.myfacade.addDataset(contentid, content).then(function (response) {
                res.json(response.code, response.body);
                next();
            }).catch(function (err) {
                res.json(err.code, err.body);
                next();
            });
        }
        catch (err) {
            Util_1.default.error('Server::add(..) - responding 400');
            res.json(400, { error: err.message });
            next();
        }
    };
    Server.remove = function (req, res, next) {
        console.log('remove here');
        var contentid = req.params.id;
        try {
            Server.myfacade.removeDataset(contentid).then(function (response) {
                res.json(response.code, response.body);
                next();
            }).catch(function (err) {
                res.json(err.code, err.body);
                next();
            });
        }
        catch (err) {
            res.json(404, { error: err.message });
            next();
        }
    };
    Server.query = function (req, res, next) {
        console.log('query here');
        var content = req.body;
        var contentid = req.params.id;
        try {
            Server.myfacade.performQuery(content).then(function (response) {
                res.json(response.code, response.body);
                next();
            }).catch(function (err) {
                res.json(err.code, err.body);
                next();
            });
        }
        catch (err) {
            res.json(400, { error: err.message });
            next();
        }
    };
    Server.echo = function (req, res, next) {
        Util_1.default.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            var result = Server.performEcho(req.params.msg);
            Util_1.default.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        }
        catch (err) {
            Util_1.default.error('Server::echo(..) - responding 400');
            res.json(400, { error: err.message });
        }
        return next();
    };
    Server.performEcho = function (msg) {
        if (typeof msg !== 'undefined' && msg !== null) {
            return { code: 200, body: { message: msg + '...' + msg } };
        }
        else {
            return { code: 400, body: { error: 'Message not provided' } };
        }
    };
    return Server;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
//# sourceMappingURL=Server.js.map