import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import Apply from "../src/syntax/Apply";
import {Transformations} from "../src/syntax/Transformations";
import Option from "../src/Option_Syntax/Option";
let fs = require("fs");
let Decimal = require('decimal.js');


describe("EchoSpec", function () {


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });


    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("test add transformation with empty apply.", function (done) {
        let ifa = new InsightFacade();
        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    it.only("test transmation that apply is not empty", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    it("test transmation that apply is not empty", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body['result'].length);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    it("test invalid COMPUTATION in TRANSFORMATION", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body['result'].length);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });


    it("test invalid query column have more keys than group", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });

    it("test valid query that group has more features than columns", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body['result'].length);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test deeply nested query", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                    "AND": [{
                        "OR": [{"EQ": {"rooms_seats":100}}, {
                            "LT": {
                                "rooms_seats": 100
                            }
                        }]
                    }, {
                        "OR": [{"EQ": {"rooms_seats": 70}}, {
                            "GT": {
                                "rooms_seats": 70
                            }
                        }]
                    }, {"IS": {"rooms_shortname": "DMP"}}]
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test complex nested query", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                    "AND": [{
                        "OR": [{"EQ": {"rooms_seats":90}}, {
                            "LT": {
                                "rooms_seats": 90
                            }
                        }]
                    }, {
                        "OR": [{"EQ": {"rooms_seats": 70}}, {
                            "GT": {
                                "rooms_seats": 70
                            }
                        }]
                    }, {"NOT":{"IS": {"rooms_shortname": "DMP"}}}]
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test with valid query ", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query =
                    {
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
                    .then(function(resp){
                        expect.fail();
                        done();
                    })
                    .catch(function (err) {
                        Log.test('Invalid query!');
                        expect(err.code).to.deep.equal(400);
                        done()

                    });
            })
            .catch(function(err){
                done();
            })
    });


    it("test max ",function (done) {

        let a :Array<any> =
            [{ courses_dept: 'bmeg',
            courses_id: '456',
            courses_avg: 83.69,
            courses_instructor: '',
            courses_title: 'clin&ind bio eng',
            courses_pass: 25,
            courses_fail: 1,
            courses_audit: 0,
            courses_uuid: '73454',
            courses_year: 1900 },
        {   courses_dept: 'bmeg',
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
            courses_year: 1900 }]

        console.log(Apply.ComputeMax(a,'courses_avg'));
        expect(Apply.ComputeMax(a,'courses_avg')).to.deep.equal(83.69);
        console.log(Apply.ComputeMin(a,'courses_avg'));
        expect(Apply.ComputeMin(a,'courses_avg')).to.deep.equal(79.86);
        console.log(Apply.ComputeCount(a,'courses_avg'));
        expect(Apply.ComputeCount(a,'courses_avg')).to.deep.equal(3);
        console.log(Apply.ComputeSum(a,'courses_avg'));
        expect(Apply.ComputeSum(a,'courses_avg')).to.deep.equal(404.81);
        console.log(Apply.ComputeAvg(a,'courses_avg'))
        expect(Apply.ComputeAvg(a,'courses_avg')).to.deep.equal(80.96);
        done();

    })

    it("test creategroup ",function (done) {
        let a :Array<any> =
            [{ courses_dept: 'bmeg',
                courses_id: '456',
                courses_avg: 83.69,
                courses_instructor: '',
                courses_title: 'clin&ind bio eng',
                courses_pass: 25,
                courses_fail: 1,
                courses_audit: 0,
                courses_uuid: '73454',
                courses_year: 1900 },
                {   courses_dept: 'bmeg',
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
                {   courses_dept: 'cpsc',
                    courses_id: '121',
                    courses_avg: 79.86,
                    courses_instructor: 'jaggi, bruno',
                    courses_title: 'clin&ind bio eng',
                    courses_pass: 37,
                    courses_fail: 0,
                    courses_audit: 0,
                    courses_uuid: '75917',
                    courses_year: 2015 },
                {   courses_dept: 'cpsc',
                    courses_id: '121',
                    courses_avg: 90,
                    courses_instructor: 'jaggi, bruno',
                    courses_title: 'clin&ind bio eng',
                    courses_pass: 37,
                    courses_fail: 0,
                    courses_audit: 0,
                    courses_uuid: '75917',
                    courses_year: 2015 },
                {   courses_dept: 'cpsc',
                    courses_id: '221',
                    courses_avg: 10.86,
                    courses_instructor: 'jaggi, bruno',
                    courses_title: 'clin&ind bio eng',
                    courses_pass: 37,
                    courses_fail: 0,
                    courses_audit: 0,
                    courses_uuid: '75917',
                    courses_year: 2015 },
                {   courses_dept: 'cpsc',
                    courses_id: '221',
                    courses_avg: 30,
                    courses_instructor: 'jaggi, bruno',
                    courses_title: 'clin&ind bio eng',
                    courses_pass: 37,
                    courses_fail: 0,
                    courses_audit: 0,
                    courses_uuid: '75917',
                    courses_year: 2015 }];

        let query ={"TRANSFORMATIONS": {
                "GROUP": ["courses_dept",'courses_id'],
                "APPLY": [{
                "avgcourses": {
                    "AVG": "courses_avg"
                }
            }]
        }}


        let trans  = new Transformations(query["TRANSFORMATIONS"], 'courses');
        let object = [];
        object = trans.createGroup(a);
        //console.log(trans.createGroup(a));


        let b =[];
        b = trans.handleapply(object);
        console.log(b);

        done();

    })
    it("test sort colomn",function(done){
        let b :Array<any>= [ { rooms_furniture: 'Classroom-Fixed Tablets' },
            { rooms_furniture: 'Classroom-Movable Tables & Chairs' },
            { rooms_furniture: 'Classroom-Fixed Tables/Movable Chairs' },
            { rooms_furniture: 'Classroom-Hybrid Furniture' },
            { rooms_furniture: 'Classroom-Movable Tablets' },
            { rooms_furniture: 'Classroom-Moveable Tables & Chairs' },
            { rooms_furniture: 'Classroom-Moveable Tablets' },
            { rooms_furniture: 'Classroom-Fixed Tables/Fixed Chairs' },
            { rooms_furniture: 'Classroom-Fixed Tables/Moveable Chairs' },
            { rooms_furniture: 'Classroom-Learn Lab' } ];
        let query:any = {
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

        let option = new Option(query, "rooms",);
        option.sort(b);
        console.log(option.sort(b));
        done();
    })

    it("test min", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test count", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test sum", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test empty group", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });

    it("test no option", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });

    it("test no column with trans", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });

    it("test no column without trans", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });

    it("test column with invalid attributes", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                // console.log(result.body);
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });


    it("test deeply nested query", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test another deeply nested query", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
                    "GROUP": ["rooms_shortname","rooms_type","rooms_seats"],
                    "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
                }
            })
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

    it("test and with one condition", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
                    "GROUP": ["rooms_shortname","rooms_type","rooms_seats","rooms_fullname"],
                    "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_number"
                        }
                    }]
                }
            })
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    // find one bug. I get ID from query by access the first element in column but in d3 it can
    // be new key defined by apply. So it will mark a valid query to invalid.
    it("test only new defined key in column", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "countRoom"
                    ]
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname","rooms_type","rooms_seats"],
                    "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_href"
                        }
                    }]
                }
            })
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    it("test apply key has _ should be invalid", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "count_Room"
                    ]
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname","rooms_type","rooms_seats"],
                    "APPLY": [{
                        "count_Room": {
                            "COUNT": "rooms_href"
                        }
                    }]
                }
            })
            .then(function (result: InsightResponse) {
                expect.fail();
                done();

            })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.deep.equal(400);
                done();
            })
    });


    it("test query that apply key is not column but should be valid", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
                    "GROUP": ["rooms_shortname","rooms_type","rooms_seats","rooms_fullname"],
                    "APPLY": [{
                        "countRoom": {
                            "COUNT": "rooms_number"
                        }
                    }]
                }
            })
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

});
