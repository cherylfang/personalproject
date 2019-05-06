import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
let fs = require("fs");


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

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it('read BUCH.zip once',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('rooms.zip','base64');
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
                expect(resp.code).to.deep.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });


    it('read BUCH.zip twice',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('rooms.zip','base64');
        ifa.addDataset('rooms', content);
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
                expect(resp.code).to.deep.equal(201);
            })
            .catch(function (err) {
                expect.fail();
            })
    });


    it('read empty.zip reject 400',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('empty.zip','base64');
        return ifa.addDataset('rooms', content)
            .then(function (resp) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).to.deep.equal(400);
            })
    });


    it("No where", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('rooms.zip', 'base64');
        ifa.addDataset('rooms',content)
            .then(function(res){
                let query = {
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_uuid",
                            "courses_avg"
                        ],
                        "ORDER": "courses_uuid"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect.fail();
                        done();
                    })
                    .catch(function (err) {
                        expect(err.code).to.deep.equal(400);
                        done();
                    });
            })
            .catch(function(){
                expect.fail();
                done();
            })
    });


    it("find sections in a room with lat between 49.264 and 49.265.", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('rooms.zip', 'base64');
        ifa.addDataset('rooms',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "AND":[
                            {
                                "AND":[
                                    { "GT": {"rooms_lat": 49.264}},
                                    { "LT": {"rooms_lat": 49.265}}
                                ]
                            },
                            {
                                "IS":{
                                    "rooms_shortname": "ANGU"
                                }
                            }
                        ]

                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "rooms_lat",
                            "rooms_name"
                        ],
                        "ORDER":"rooms_lat"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // console.log(resp.body);
                        expect(resp.code).to.deep.
                        equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){

            })
    });


    it("test find rooms with plenty of seats", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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
            .then(function (result: InsightResponse) {
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });


    it("test find rooms with plenty of seats in a building", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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


    it("test find rooms with table", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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


    it("test finding all rooms within a certain bounding box", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
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

    it("test finding all rooms within MAUD that is not in index.htm", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                    "NOT":{"IS": {
                        "rooms_shortname": "MAUD"
                    }}
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
                        "rooms_type",
                        "rooms_seats",
                        "rooms_shortname",
                        "maxSeats"
                    ],
                    "ORDER": "maxSeats"
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
                console.log(result.body)
                expect(result.code).to.deep.equal(200);
                done();

            })
            .catch(function (err: InsightResponse) {
                expect.fail();
                done();
            })
    });

});
