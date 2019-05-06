"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var fs = require("fs");
describe("EchoSpec", function () {
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("Should be able to echo", function () {
        var out = Server_1.default.performEcho('echo');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });
    it('read BUCH.zip once', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('rooms.zip', 'base64');
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
            chai_1.expect(resp.code).to.deep.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('read BUCH.zip twice', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('rooms.zip', 'base64');
        ifa.addDataset('rooms', content);
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
            chai_1.expect(resp.code).to.deep.equal(201);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('read empty.zip reject 400', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('empty.zip', 'base64');
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
        });
    });
    it("No where", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('rooms.zip', 'base64');
        ifa.addDataset('rooms', content)
            .then(function (res) {
            var query = {
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_uuid",
                        "courses_avg"
                    ],
                    "ORDER": "courses_uuid"
                }
            };
            ifa.performQuery(query)
                .then(function (resp) {
                chai_1.expect.fail();
                done();
            })
                .catch(function (err) {
                chai_1.expect(err.code).to.deep.equal(400);
                done();
            });
        })
            .catch(function () {
            chai_1.expect.fail();
            done();
        });
    });
    it("find sections in a room with lat between 49.264 and 49.265.", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('rooms.zip', 'base64');
        ifa.addDataset('rooms', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                { "GT": { "rooms_lat": 49.264 } },
                                { "LT": { "rooms_lat": 49.265 } }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": "ANGU"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_lat",
                        "rooms_name"
                    ],
                    "ORDER": "rooms_lat"
                }
            };
            ifa.performQuery(query)
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.
                    equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
        });
    });
    it("test find rooms with plenty of seats", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test find rooms with plenty of seats in a building", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "rooms_seats": 0
                        }
                    },
                    {
                        "IS": {
                            "rooms_shortname": "MATH"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test find rooms with table", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test finding all rooms within a certain bounding box", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_fullname": "Auditorium Annex"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test deeply nested query", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [{
                        "OR": [{ "EQ": { "rooms_seats": 100 } }, {
                                "LT": {
                                    "rooms_seats": 100
                                }
                            }]
                    }, {
                        "OR": [{ "EQ": { "rooms_seats": 70 } }, {
                                "GT": {
                                    "rooms_seats": 70
                                }
                            }]
                    }, { "IS": { "rooms_shortname": "DMP" } }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_href",
                    "rooms_name",
                    "rooms_type",
                    "rooms_seats",
                    "rooms_address"
                ],
                "ORDER": "rooms_type"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test finding all rooms within MAUD that is not in index.htm", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "NOT": { "IS": {
                        "rooms_shortname": "MAUD"
                    } }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats"
            }
        })
            .then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test complex nested query", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [{
                        "OR": [{ "EQ": { "rooms_seats": 90 } }, {
                                "LT": {
                                    "rooms_seats": 90
                                }
                            }]
                    }, {
                        "OR": [{ "EQ": { "rooms_seats": 70 } }, {
                                "GT": {
                                    "rooms_seats": 70
                                }
                            }]
                    }, { "NOT": { "IS": { "rooms_shortname": "DMP" } } }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type",
                    "rooms_seats",
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": "maxSeats"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type", "rooms_seats"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            console.log(result.body);
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
});
//# sourceMappingURL=d2PartAddDataset.js.map