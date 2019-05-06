import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import Option from "../src/Option_Syntax/Option";
import {Transformations} from "../src/syntax/Transformations";
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

    it("test Options valid", function () {
        let query: any = {
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
        let id = "rooms"
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(true);
    });

    it("test Options valid with not empty apply. But column doesnot contain apply. so it is invalid ", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(true);
    });

    it("test column only has key in group but not apply ", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(true);
    });

    it("test column that has invalid attribute", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(false);
    });

    it("test add one more attribute in group ", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(true);
    });

    it("test add one more attribute column but group doesnot contain it ", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(false);
    });

    it("test Options invalid with invalid order attribute ", function () {
        let query: any = {
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
        let id = "rooms";
        let option = new Option(query,id);
        let res = option.isValid();
        return expect(res).to.deep.equal(false);
    });

    it("test Column getInfoOfGroup ",function (done) {
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

        let query = {
                "WHERE":{
                    "GT":{
                        "courses_avg":97
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "avgcourses"
                    ],
                    "ORDER":"avgcourses"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["courses_dept"],
                    "APPLY": [{
                        "avgcourses": {
                            "AVG": "courses_avg"
                        }
                    }]
                }
            }
        ;


        let trans  = new Transformations(query["TRANSFORMATIONS"], 'courses');
        let object = trans.createGroup(a);
        //console.log(trans.createGroup(a));
        let option = new Option(query,"courses");
        let temp = trans.handleapply(object);
        let newGroup = option.getInfoFromGroup(temp,trans);
        console.log(newGroup);

        //let abb =[];
        //abb = trans.handleapply(object)
        //console.log(abb['{"courses_dept":"bmeg","courses_id":"456"}']['array'][6])

        done();

    });






});