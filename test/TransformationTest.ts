import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {Transformations} from "../src/syntax/Transformations";


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

    it("test transformation without apply", function () {
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
            }
        };
        let id = "rooms"
        let trans = new Transformations(query["TRANSFORMATIONS"],id);
        let res = trans.isValid();
        return expect(res).to.deep.equal(false);
    });

    it("test invalid apply that define same new key twice", function () {
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
                },{
                    "maxSeats": {
                        "COUNT": "rooms_seats"
                    }
                }
                ]
            }
        };
        // let temp = Object.create(null);
        // temp["1"] = true;
        // console.log("1" in temp);
        let id = "rooms"
        let trans = new Transformations(query["TRANSFORMATIONS"],id);
        let res = trans.isValid();
        return expect(res).to.deep.equal(false);
    });


    it("test apply key has _", function () {
        let query: any = {
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
        };
        let id = "rooms"
        let trans = new Transformations(query["TRANSFORMATIONS"],id);
        let res = trans.isValid();
        return expect(res).to.deep.equal(false);
    });


});