/**
 * Created by rtholmes on 2016-10-31.
 */
import chai = require('chai');
import chaiHttp = require('chai-http');
import Response = ChaiHttp.Response;
import restify = require('restify');
import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
let fs = require("fs");



describe("EchoSpec", function () {
    var server : Server ;
    var URL : string;


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
        chai.use(chaiHttp);
        server = new Server(4321);
         URL = "http://127.0.0.1:4321";
        //server.start();
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        chai.use(chaiHttp);
        let server = new Server(4321);
        let URL = "http://127.0.0.1:4321";
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
        server.stop();
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Test Server", function() {


        // Test
        expect(server).to.not.equal(undefined);
        try{
            Server.echo((<restify.Request>{}), null, null);
            expect.fail()
        } catch(err) {
            expect(err.message).to.equal("Cannot read property 'json' of null");
        }

        return server.start().then(function(success: boolean) {
            return chai.request(URL)
                .get("/")
        }).catch(function(err:any) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello")
        }).catch(function(err:any) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return server.start()
        }).then(function(success: boolean) {
            expect.fail();
        }).catch(function(err:any) {
            expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function(err:any) {
            expect.fail();
        });
    });

    it("PUT basic", function () {
            return chai.request('http://localhost:4321')
                .put('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res: Response) {

                    Log.trace('then:');
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err) {
                    Log.trace('catch:');
                    console.log(err);
                    expect.fail();
                });
        });

    it("PUT empty zip", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/empty')
            .attach("body", fs.readFileSync("./empty.zip"), "./empty.zip")
            .then(function (res: Response) {

                Log.trace('then:');
                expect.fail();
            })
            .catch(function (err) {
                Log.trace('catch:');
                console.log(err);

                expect(err.status).to.be.equal(400);

            });
    });


    it("PUT basic twice", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res: Response) {
                return chai.request('http://localhost:4321')
                    .put('/dataset/courses')
                    .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                    .then(function (res: Response) {
                        Log.trace('then:');
                        expect(res.status).to.be.equal(201);
                    }).catch(function(err){
                        expect.fail();
                    })})
            .catch(function (err) {
                return chai.request('http://localhost:4321')
                    .put('/dataset/courses')
                    .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                    .then(function (res: Response) {
                        Log.trace('then:');
                        expect(res.status).to.be.equal(201);
                    }).catch(function(err){
                        expect.fail();
                    })
            });
    });




    it("DEL basic", function () {
            return chai.request('http://localhost:4321')
                .put('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res: Response) {
                    return chai.request('http://localhost:4321')
                        .del('/dataset/courses')
                        .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                        .then(function (res: Response) {
                            Log.trace('then:');
                            expect(res.status).to.be.equal(204);
                        }).catch(function(err){
                            expect.fail();
                        })})
                .catch(function (err) {
                    return chai.request('http://localhost:4321')
                        .del('/dataset/courses')
                        .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                        .then(function (res: Response) {
                            Log.trace('then:');
                            expect(res.status).to.be.equal(204);
                        }).catch(function(err){
                            expect.fail();
                        })
                });
        });

    it("DEL without PUT", function () {
        return chai.request('http://localhost:4321')
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.status).to.be.equal(404);
            });
    });


    it("query basic",function(){
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res: Response) {
                return chai.request('http://localhost:4321')
                .post('/query')
                .send({
                    "WHERE": {
                        "GT": {
                            "courses_avg": 50
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }})
                .then(function (res: Response) {
                    Log.trace('then:');
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.trace('catch:');
                    expect.fail();
                })}).catch(function(err){
                return chai.request('http://localhost:4321')
                    .post('/query')
                    .send({
                        "WHERE": {
                            "GT": {
                                "courses_avg": 50
                            }
                        },
                        "OPTIONS": {
                            "COLUMNS": [
                                "courses_dept",
                                "courses_avg"
                            ],
                            "ORDER": "courses_avg"
                        }})
                    .then(function (res: Response) {
                        Log.trace('then:');
                        expect(res.status).to.be.equal(200);
                    })
                    .catch(function (err) {
                        Log.trace('catch:');
                        expect.fail();
                    })
        })
    });


    it('read test2.zip twice code is 201',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip','base64');
        ifa.addDataset('courses',content);
        return ifa.addDataset('courses', content)
            .then(function (resp) {
                expect(resp.code).to.deep.equal(201);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it('read courses.zip once',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip','base64');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
                expect(resp.code).to.deep.equal(204);
            })
            .catch(function (err) {
                expect.fail();
            })
    });

    it('read empty.zip reject 400',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('empty.zip','base64');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
                expect.fail();
            })
            .catch(function (err) {
                Log.test("error: " + err.body["error"]);
                expect(err.code).to.deep.equal(400);
            })
    });

    it('read invalid zip file reject 400',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip','utf8');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
                expect.fail();
            })
            .catch(function (err) {
                Log.test("error: " + err.body["error"]);
                expect(err.code).to.deep.equal(400);
            })
    });

    it('remove folder.zip reject 404',function () {
        let ifa = new InsightFacade();
        return ifa.removeDataset('folder')
            .then(function (resp) {
                expect.fail();
            })
            .catch(function (err) {
                expect(err.code).to.deep.equal(404);
            })
    });

    it('remove folder.zip fulfill 204',function () {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip','base64');
        return ifa.addDataset('folder',content).then(function () {
            ifa.removeDataset('folder')
                .then(function (resp) {
                    expect(resp.code).to.deep.equal(204);
                })
                .catch(function (err) {
                    expect.fail();
                })
        }).catch(function () {
            ifa.removeDataset('folder')
                .then(function (resp) {
                    expect(resp.code).to.deep.equal(204);
                })
                .catch(function (err) {
                    expect.fail();
                })
        })
    });

    it("test with invalid query that has no column", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "NOT":{
                            "IS": {
                                "courses_instructor": "*th*"
                            }
                        }
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // Log.test("Body: " + JSON.stringify( resp.body));
                        expect.fail();
                        done();
                    })
                    .catch(function (err) {
                        Log.test('Invalid query!');
                        Log.test("code " + JSON.stringify(err.code));
                        expect(err.code).to.deep.equal(400);
                        done();

                    });
            })
            .catch(function(err){
                done();
            })
    });


    it("test with GT", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "GT": {
                            "courses_avg": 50
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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

    it("test with IS without *", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "IS": {
                            "courses_dept": "bmeg"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // Log.test("Body: " + JSON.stringify( resp.body));
                        // Log.test(resp.code);
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        Log.test(JSON.stringify(err.code));
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){

            })
    });

    it("test with IS ending *", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "IS": {
                            "courses_title": "cl*"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
                        // Log.test("Body: " + JSON.stringify( resp.body));
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

    it("test with IS starting *", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "IS": {
                            "courses_instructor": "*th"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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

    it("test with IS starting * and ending with *", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "IS": {
                            "courses_instructor": "*th*"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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

    it("test with equal", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "EQ": {
                            "courses_avg": 95
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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

    it("test with less than", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "LT": {
                            "courses_avg": 80
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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

    it("check double negation", function(done) {
        let ifa = new InsightFacade();
        let query = {
            "WHERE": {
                "NOT": {
                    "NOT": {"IS": {"courses_instructor": "*sun*"}}
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_instructor",
                    "courses_dept",
                    "courses_uuid"

                ],
                "ORDER": "courses_instructor"
            }

        };
        ifa.performQuery(query)
            .then(function (resp) {
                // console.log(resp.body);
                expect(resp.code).to.deep.equal(200);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            });
    })

    it("###check complex and eq", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');

        let query = {
            "WHERE": {
                "AND": [{
                    "OR": [{"EQ": {"courses_avg": 80}}, {
                        "LT": {
                            "courses_avg": 80
                        }
                    }]
                }, {
                    "OR": [{"EQ": {"courses_avg": 70}}, {
                        "GT": {
                            "courses_avg": 70
                        }
                    }]
                }, {"IS": {"courses_dept": "cpsc"}}]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg"
            }
        };

        ifa.performQuery(query)
            .then(function (resp) {
                // console.log(resp.body);
                expect(resp.code).to.deep.equal(200);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            });
    });


    it("check EQ", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        let query = {
            "WHERE": {
                "EQ": {
                    "courses_avg": 80
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg"
            }

        };
        ifa.performQuery(query)
            .then(function (resp) {
                // console.log(resp.body);
                expect(resp.code).to.deep.equal(200);
                done();
            })
            .catch(function (err) {
                expect.fail();
                done();
            });
    });

    it("check all instructor that have same partial name ", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "IS": {
                            "courses_instructor": "*anthony*"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_instructor",
                            "courses_dept",
                            "courses_uuid"
                        ],
                        "ORDER": "courses_instructor"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // console.log(resp.body);
                        expect(resp.code).to.deep.equal(200);
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

    it("test NOT with IS starting * and ending with *", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "NOT":{
                            "IS": {
                                "courses_instructor": "*th*"
                            }
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
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


    it("test NOT with GT then 80", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "NOT":{
                            "GT": {
                                "courses_avg": 80
                            }
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_instructor",
                            "courses_avg",
                            "courses_uuid"
                        ],
                        "ORDER": "courses_instructor"
                    }

                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // console.log(resp.body);
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(err){
                Log.test(err);
            })
    });


    it("find sections fail EQ and GT 30.", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "OR": [
                            {
                                "GT": {
                                    "courses_fail": 96
                                }
                            },
                            {
                                "EQ": {
                                    "courses_fail": 96
                                }
                            }
                        ]

                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_avg",
                            "courses_fail",
                            "courses_uuid",
                            "courses_id"
                        ],
                        "ORDER": "courses_uuid"
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

    it("find a specific section.", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "AND": [
                            {
                                "GT": {
                                    "courses_fail": 95
                                }
                            },
                            {
                                "IS": {
                                    "courses_uuid": "26808"
                                }
                            }
                        ]

                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_avg",
                            "courses_fail",
                            "courses_uuid",
                            "courses_id"
                        ],
                        "ORDER": "courses_id"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // console.log(resp.body);
                        expect(resp.code).to.deep.equal(200);
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

    it("find some courses without order.", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE": {
                        "OR": [
                            {
                                "GT": {
                                    "courses_fail": 95
                                }
                            },
                            {
                                "IS": {
                                    "courses_uuid": "26808"
                                }
                            }
                        ]

                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_avg",
                            "courses_fail",
                            "courses_uuid",
                            "courses_id"
                        ]
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        // console.log(resp.body);
                        expect(resp.code).to.deep.equal(200);
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

    it("find sections in a dept with average between 70 and 80.", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "AND":[
                            {
                                "AND":[
                                    { "GT": {"courses_avg": 70}},
                                    { "LT": {"courses_avg": 80}}
                                ]
                            },
                            {
                                "IS":{
                                    "courses_dept": "cpsc"
                                }
                            }
                        ]

                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER":"courses_avg"
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


    it("test where has two filters in where without and ot", function () {
        let ifa = new InsightFacade();
        return ifa.performQuery(

            {
                "WHERE":{
                    "GT":{
                        "courses_avg":90
                    },
                    "LT":{
                        "courses_avg":95
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg"
                }

            })
            .then(function (result:InsightResponse) {
            expect.fail();

        }).catch(function(err:InsightResponse){
            expect(err.code).to.deep.equal(400);
        })});

    it("test where has two filters with and", function (done) {
        let ifa = new InsightFacade();

        ifa.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "adhe"
                            }
                        }
                    ]
                },

                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_year"
                    ],
                    "ORDER": "courses_avg"
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

    it("test NOT with AND contains GT and LT", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg": 80
                                }
                            },
                            {
                                "LT":{
                                    "courses_avg": 95
                                }
                            }
                        ]},

                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER":"courses_avg"
                    }


                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){
                expect.fail();
                done();
            })
    });

    it("test NOT with AND contains OR and GT printuuid", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_avg": 100
                                    }
                                }
                            }
                        ]},

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
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){
                expect.fail();
                done();
            })
    });

    it("valid json but not have columns", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_avg": 100
                                    }
                                }
                            }
                        ]},

                    "OPTIONS":{
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

    it("order have a feature that column does not have", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_avg": 100
                                    }
                                }
                            }
                        ]},

                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_uuid",
                            "courses_avg"
                        ],
                        "ORDER": "courses_id"
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

    it("No options", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_avg": 100
                                    }
                                }
                            }
                        ]}
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

    it("No where", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
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

    it("feature that does not exist", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_123": 100
                                    }
                                }
                            }
                        ]},

                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_23",
                            "courses_av23"
                        ],
                        "ORDER": "courses_sdsda"
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

    it("test NOT with AND contains OR and GT", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg": 90
                                }
                            },
                            {
                                "NOT":{

                                    "GT":{
                                        "courses_avg": 99
                                    }
                                }
                            }
                        ]},

                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER":"courses_dept"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){
                expect.fail();
                done();
            })
    });

    it("test performquery without dataset reject 424", function (done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                ifa.removeDataset('courses')
                    .then(function (res) {
                        ifa.performQuery(

                            {
                                "WHERE":{
                                    "OR":[
                                        {
                                            "GT":{
                                                "courses_avg":97
                                            }
                                        },
                                        {
                                            "LT":{
                                                "courses_avg":98
                                            }
                                        }]

                                },
                                "OPTIONS":{
                                    "COLUMNS":[
                                        "courses_dept",
                                        "courses_avg"
                                    ],
                                    "ORDER":"courses_avg"
                                }
                            }


                        ).then(function (result:InsightResponse) {
                            expect.fail();
                            done();

                        }).catch(function(err:InsightResponse){
                            expect(err.code).to.deep.equal(424);
                            done();

                        })
                    })
            }).catch(function (err) {
            expect.fail();
            done();
        })
});
    it("test NOT with AND contains OR and GT", function(done) {
        let ifa = new InsightFacade();
        let content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses',content)
            .then(function(res){
                let query = {
                    "WHERE":{
                        "OR":[
                            {
                                "AND":[
                                    {
                                        "GT":{
                                            "courses_avg":90
                                        }
                                    },
                                    {
                                        "IS":{
                                            "courses_dept":"adhe"
                                        }
                                    }
                                ]
                            },  {
                                "EQ":{
                                    "courses_avg":95
                                }
                            }
                        ]
                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_id",
                            "courses_avg"
                        ],
                        "ORDER":"courses_avg"
                    }
                };
                ifa.performQuery(query)
                    .then(function(resp){
                        expect(resp.code).to.deep.equal(200);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail();
                        done();
                    });
            })
            .catch(function(){
                expect.fail();
                done();
            })
    });


    it("test where has two filters with or", function () {
        let ifa = new InsightFacade();

        return ifa.performQuery(

            {
                "WHERE":{
                    "OR":[
                        {
                            "GT":{
                                "courses_avg":97
                            }
                        },
                        {
                            "LT":{
                                "courses_avg":98
                            }
                        },
                        {
                            "IS":{
                                "courses_dept":"adhe"
                            }
                        }]

                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg"
                }
            }


        ).then(function (result:InsightResponse) {
            expect(result.code).to.deep.equal(200);

        }).catch(function(err:InsightResponse){
            expect.fail();
        })});

    it("test when dataset is only in disk", function () {
        let ifa = new InsightFacade();

        return ifa.performQuery(

            {
                "WHERE":{
                    "OR":[
                        {
                            "GT":{
                                "courses_avg":85
                            }
                        },
                        {
                            "LT":{
                                "courses_avg":80
                            }
                        }
                    ]

                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg"
                }
            }


        ).then(function (resp:InsightResponse) {
            // console.log(resp.body);
            // console.log(resp.code);
            expect(resp.code).to.deep.equal(200);

        }).catch(function(err:InsightResponse){
            expect.fail()
        })});




});
