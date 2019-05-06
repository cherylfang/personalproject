"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var Apply_1 = require("../src/syntax/Apply");
var Transformations_1 = require("../src/syntax/Transformations");
var Option_1 = require("../src/Option_Syntax/Option");
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
    it("test add transformation with empty apply.", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
    it.only("test transmation that apply is not empty", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "maxSeats",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "countSeats": {
                            "COUNT": "rooms_seats"
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
    it("test transmation that apply is not empty", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
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
    it("test invalid COMPUTATION in TRANSFORMATION", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAXXXX": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test invalid query column have more keys than group", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "rooms_seats",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test valid query that group has more features than columns", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_seats", "rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
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
                    "rooms_href",
                    "rooms_name",
                    "rooms_type",
                    "rooms_seats",
                    "rooms_address",
                    "rooms_href",
                    "rooms_number"
                ],
                "ORDER": "rooms_href"
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
    it("test with valid query ", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
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
            ifa.performQuery(query)
                .then(function (resp) {
                chai_1.expect.fail();
                done();
            })
                .catch(function (err) {
                Util_1.default.test('Invalid query!');
                chai_1.expect(err.code).to.deep.equal(400);
                done();
            });
        })
            .catch(function (err) {
            done();
        });
    });
    it("test max ", function (done) {
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
                courses_year: 1900 }];
        console.log(Apply_1.default.ComputeMax(a, 'courses_avg'));
        chai_1.expect(Apply_1.default.ComputeMax(a, 'courses_avg')).to.deep.equal(83.69);
        console.log(Apply_1.default.ComputeMin(a, 'courses_avg'));
        chai_1.expect(Apply_1.default.ComputeMin(a, 'courses_avg')).to.deep.equal(79.86);
        console.log(Apply_1.default.ComputeCount(a, 'courses_avg'));
        chai_1.expect(Apply_1.default.ComputeCount(a, 'courses_avg')).to.deep.equal(3);
        console.log(Apply_1.default.ComputeSum(a, 'courses_avg'));
        chai_1.expect(Apply_1.default.ComputeSum(a, 'courses_avg')).to.deep.equal(404.81);
        console.log(Apply_1.default.ComputeAvg(a, 'courses_avg'));
        chai_1.expect(Apply_1.default.ComputeAvg(a, 'courses_avg')).to.deep.equal(80.96);
        done();
    });
    it("test creategroup ", function (done) {
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
        var query = { "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", 'courses_id'],
                "APPLY": [{
                        "avgcourses": {
                            "AVG": "courses_avg"
                        }
                    }]
            } };
        var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], 'courses');
        var object = [];
        object = trans.createGroup(a);
        var b = [];
        b = trans.handleapply(object);
        console.log(b);
        done();
    });
    it("test sort colomn", function (done) {
        var b = [{ rooms_furniture: 'Classroom-Fixed Tablets' },
            { rooms_furniture: 'Classroom-Movable Tables & Chairs' },
            { rooms_furniture: 'Classroom-Fixed Tables/Movable Chairs' },
            { rooms_furniture: 'Classroom-Hybrid Furniture' },
            { rooms_furniture: 'Classroom-Movable Tablets' },
            { rooms_furniture: 'Classroom-Moveable Tables & Chairs' },
            { rooms_furniture: 'Classroom-Moveable Tablets' },
            { rooms_furniture: 'Classroom-Fixed Tables/Fixed Chairs' },
            { rooms_furniture: 'Classroom-Fixed Tables/Moveable Chairs' },
            { rooms_furniture: 'Classroom-Learn Lab' }];
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
        var option = new Option_1.default(query, "rooms");
        option.sort(b);
        console.log(option.sort(b));
        done();
    });
    it("test min", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MIN": "rooms_seats"
                        }
                    }]
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
    it("test count", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                            "COUNT": "rooms_seats"
                        }
                    }]
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
    it("test sum", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                    }]
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
    it("test empty group", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                "GROUP": [],
                "APPLY": [{
                        "maxSeats": {
                            "SUM": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test no option", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
            "TRANSFORMATIONS": {
                "GROUP": [],
                "APPLY": [{
                        "maxSeats": {
                            "SUM": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test no column with trans", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                "ORDER": {
                    "dir": "UP",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": [],
                "APPLY": [{
                        "maxSeats": {
                            "SUM": "rooms_seats"
                        }
                    }]
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test no column without trans", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
                "ORDER": {
                    "dir": "UP",
                    "keys": ["maxSeats"]
                }
            }
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test column with invalid attributes", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test deeply nested query", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "GT": {
                            "rooms_seats": 100
                        }
                    }]
            },
            "OPTIONS": {
                "COLUMNS": ["rooms_shortname", "maxSeats", "avgSeats", "minSeats", "countRoom", "sumSeats"],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["sumSeats", "minSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }, {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }, {
                        "minSeats": {
                            "MIN": "rooms_seats"
                        }
                    }, {
                        "countRoom": {
                            "COUNT": "rooms_shortname"
                        }
                    }, {
                        "sumSeats": {
                            "SUM": "rooms_seats"
                        }
                    }]
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
    it("test another deeply nested query", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
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
            chai_1.expect(result.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test and with one condition", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type",
                    "rooms_seats",
                    "rooms_shortname",
                    "countRoom"
                ],
                "ORDER": "rooms_seats"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type", "rooms_seats", "rooms_fullname"],
                "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_number"
                        }
                    }]
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
    it("test only new defined key in column", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "countRoom"
                ]
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type", "rooms_seats"],
                "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_href"
                        }
                    }]
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
    it("test apply key has _ should be invalid", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
        })
            .then(function (result) {
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
            done();
        });
    });
    it("test query that apply key is not column but should be valid", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type",
                    "rooms_seats",
                    "rooms_shortname"
                ],
                "ORDER": "rooms_seats"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type", "rooms_seats", "rooms_fullname"],
                "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_number"
                        }
                    }]
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
});
//# sourceMappingURL=d3Test.js.map