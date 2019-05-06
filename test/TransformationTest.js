"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var Transformations_1 = require("../src/syntax/Transformations");
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
    it("test transformation without apply", function () {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
            }
        };
        var id = "rooms";
        var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], id);
        var res = trans.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
    it("test invalid apply that define same new key twice", function () {
        var query = {
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "GT": {
                            "rooms_seats": 300
                        }
                    }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "SUM": "rooms_seats"
                        }
                    }, {
                        "maxSeats": {
                            "COUNT": "rooms_seats"
                        }
                    }
                ]
            }
        };
        var id = "rooms";
        var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], id);
        var res = trans.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
    it("test apply key has _", function () {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "count_Room"
                ]
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type", "rooms_seats"],
                "APPLY": [{
                        "count_Room": {
                            "COUNT": "rooms_href"
                        }
                    }]
            }
        };
        var id = "rooms";
        var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], id);
        var res = trans.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
});
//# sourceMappingURL=TransformationTest.js.map