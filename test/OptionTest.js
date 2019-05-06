"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var Option_1 = require("../src/Option_Syntax/Option");
var Transformations_1 = require("../src/syntax/Transformations");
var fs = require("fs");
var Decimal = require('decimal.js');
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
    it("test Options valid", function () {
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
                "APPLY": []
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(true);
    });
    it("test Options valid with not empty apply. But column doesnot contain apply. so it is invalid ", function () {
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
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(true);
    });
    it("test column only has key in group but not apply ", function () {
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
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(true);
    });
    it("test column that has invalid attribute", function () {
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
                    "rooms_ahahahssd",
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
                    }]
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
    it("test add one more attribute in group ", function () {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture", "rooms_shortname"],
                "APPLY": []
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(true);
    });
    it("test add one more attribute column but group doesnot contain it ", function () {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture",
                    "rooms_fullname"
                ],
                "ORDER": "rooms_furniture"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture", "rooms_shortname"],
                "APPLY": []
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
    it("test Options invalid with invalid order attribute ", function () {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture",
                    "maxSeats"
                ],
                "ORDER": "rooms_furnitures"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        };
        var id = "rooms";
        var option = new Option_1.default(query, id);
        var res = option.isValid();
        return chai_1.expect(res).to.deep.equal(false);
    });
    it("test Column getInfoOfGroup ", function (done) {
        var a = [{ courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 83.69,
                courses_instructor: '',
                courses_title: 'clin&ind bio eng',
                courses_pass: 25,
                courses_fail: 1,
                courses_audit: 0,
                courses_uuid: '73454',
                courses_year: 1900 },
            { courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 79.86,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75917',
                courses_year: 2015 },
            { courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 79.86,
                courses_instructor: '',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75918',
                courses_year: 1900 },
            { courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 80.7,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 27,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '85129',
                courses_year: 2016 },
            { courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 80.7,
                courses_instructor: '',
                courses_title: 'clin&ind bio eng',
                courses_pass: 27,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '85130',
                courses_year: 1900 },
            { courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 83.69,
                courses_instructor: '',
                courses_title: 'clin&ind bio eng',
                courses_pass: 25,
                courses_fail: 1,
                courses_audit: 0,
                courses_uuid: '73454',
                courses_year: 1900 },
            { courses_dept: 'cpsc',
                courses_id: '121',
                courses_avg: 79.86,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75917',
                courses_year: 2015 },
            { courses_dept: 'cpsc',
                courses_id: '121',
                courses_avg: 90,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75917',
                courses_year: 2015 },
            { courses_dept: 'cpsc',
                courses_id: '221',
                courses_avg: 10.86,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75917',
                courses_year: 2015 },
            { courses_dept: 'cpsc',
                courses_id: '221',
                courses_avg: 30,
                courses_instructor: 'jaggi, bruno',
                courses_title: 'clin&ind bio eng',
                courses_pass: 37,
                courses_fail: 0,
                courses_audit: 0,
                courses_uuid: '75917',
                courses_year: 2015 }];
        var query = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "avgcourses"
                ],
                "ORDER": "avgcourses"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept"],
                "APPLY": [{
                        "avgcourses": {
                            "AVG": "courses_avg"
                        }
                    }]
            }
        };
        var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], 'courses');
        var object = trans.createGroup(a);
        var option = new Option_1.default(query, "courses");
        var temp = trans.handleapply(object);
        var newGroup = option.getInfoFromGroup(temp, trans);
        console.log(newGroup);
        done();
    });
});
//# sourceMappingURL=OptionTest.js.map