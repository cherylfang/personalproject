"use strict";
var chai = require("chai");
var chaiHttp = require("chai-http");
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var fs = require("fs");
describe("EchoSpec", function () {
    var server;
    var URL;
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
        chai.use(chaiHttp);
        server = new Server_1.default(4321);
        URL = "http://127.0.0.1:4321";
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        chai.use(chaiHttp);
        var server = new Server_1.default(4321);
        var URL = "http://127.0.0.1:4321";
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
        server.stop();
    });
    it("Should be able to echo", function () {
        var out = Server_1.default.performEcho('echo');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });
    it("Should be able to echo silence", function () {
        var out = Server_1.default.performEcho('');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: '...' });
    });
    it("Should be able to handle a missing echo message sensibly", function () {
        var out = Server_1.default.performEcho(undefined);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Should be able to handle a null echo message sensibly", function () {
        var out = Server_1.default.performEcho(null);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.have.property('error');
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Test Server", function () {
        chai_1.expect(server).to.not.equal(undefined);
        try {
            Server_1.default.echo({}, null, null);
            chai_1.expect.fail();
        }
        catch (err) {
            chai_1.expect(err.message).to.equal("Cannot read property 'json' of null");
        }
        return server.start().then(function (success) {
            return chai.request(URL)
                .get("/");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return server.start();
        }).then(function (success) {
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("PUT basic", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.be.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("PUT empty zip", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/empty')
            .attach("body", fs.readFileSync("./empty.zip"), "./empty.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect(err.status).to.be.equal(400);
        });
    });
    it("PUT basic twice", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res) {
            return chai.request('http://localhost:4321')
                .put('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(201);
            }).catch(function (err) {
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            return chai.request('http://localhost:4321')
                .put('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(201);
            }).catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it("DEL basic", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res) {
            return chai.request('http://localhost:4321')
                .del('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(204);
            }).catch(function (err) {
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            return chai.request('http://localhost:4321')
                .del('/dataset/courses')
                .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(204);
            }).catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it("DEL without PUT", function () {
        return chai.request('http://localhost:4321')
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            chai_1.expect(err.status).to.be.equal(404);
        });
    });
    it("query basic", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "./courses.zip")
            .then(function (res) {
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
                }
            })
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        }).catch(function (err) {
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
                }
            })
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        });
    });
    it('read test2.zip twice code is 201', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content);
        return ifa.addDataset('courses', content)
            .then(function (resp) {
            chai_1.expect(resp.code).to.deep.equal(201);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('read courses.zip once', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
            chai_1.expect(resp.code).to.deep.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('read empty.zip reject 400', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('empty.zip', 'base64');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.test("error: " + err.body["error"]);
            chai_1.expect(err.code).to.deep.equal(400);
        });
    });
    it('read invalid zip file reject 400', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'utf8');
        return ifa.addDataset('courses', content)
            .then(function (resp) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.test("error: " + err.body["error"]);
            chai_1.expect(err.code).to.deep.equal(400);
        });
    });
    it('remove folder.zip reject 404', function () {
        var ifa = new InsightFacade_1.default();
        return ifa.removeDataset('folder')
            .then(function (resp) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(404);
        });
    });
    it('remove folder.zip fulfill 204', function () {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        return ifa.addDataset('folder', content).then(function () {
            ifa.removeDataset('folder')
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(204);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }).catch(function () {
            ifa.removeDataset('folder')
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(204);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it("test with invalid query that has no column", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "NOT": {
                        "IS": {
                            "courses_instructor": "*th*"
                        }
                    }
                }
            };
            ifa.performQuery(query)
                .then(function (resp) {
                chai_1.expect.fail();
                done();
            })
                .catch(function (err) {
                Util_1.default.test('Invalid query!');
                Util_1.default.test("code " + JSON.stringify(err.code));
                chai_1.expect(err.code).to.deep.equal(400);
                done();
            });
        })
            .catch(function (err) {
            done();
        });
    });
    it("test with GT", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test with IS without *", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                Util_1.default.test(JSON.stringify(err.code));
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
        });
    });
    it("test with IS ending *", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test with IS starting *", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test with IS starting * and ending with *", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test with equal", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test with less than", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("check double negation", function (done) {
        var ifa = new InsightFacade_1.default();
        var query = {
            "WHERE": {
                "NOT": {
                    "NOT": { "IS": { "courses_instructor": "*sun*" } }
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
            chai_1.expect(resp.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("###check complex and eq", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        var query = {
            "WHERE": {
                "AND": [{
                        "OR": [{ "EQ": { "courses_avg": 80 } }, {
                                "LT": {
                                    "courses_avg": 80
                                }
                            }]
                    }, {
                        "OR": [{ "EQ": { "courses_avg": 70 } }, {
                                "GT": {
                                    "courses_avg": 70
                                }
                            }]
                    }, { "IS": { "courses_dept": "cpsc" } }]
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
            chai_1.expect(resp.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("check EQ", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        var query = {
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
            chai_1.expect(resp.code).to.deep.equal(200);
            done();
        })
            .catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("check all instructor that have same partial name ", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test NOT with IS starting * and ending with *", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "NOT": {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("test NOT with GT then 80", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "NOT": {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function (err) {
            Util_1.default.test(err);
        });
    });
    it("find sections fail EQ and GT 30.", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
    it("find a specific section.", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("find some courses without order.", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
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
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
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
    it("find sections in a dept with average between 70 and 80.", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('courses.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                { "GT": { "courses_avg": 70 } },
                                { "LT": { "courses_avg": 80 } }
                            ]
                        },
                        {
                            "IS": {
                                "courses_dept": "cpsc"
                            }
                        }
                    ]
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
    it("test where has two filters in where without and ot", function () {
        var ifa = new InsightFacade_1.default();
        return ifa.performQuery({
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                },
                "LT": {
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
        })
            .then(function (result) {
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.deep.equal(400);
        });
    });
    it("test where has two filters with and", function (done) {
        var ifa = new InsightFacade_1.default();
        ifa.performQuery({
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
    it("test NOT with AND contains GT and LT", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "AND": [
                        {
                            "GT": {
                                "courses_avg": 80
                            }
                        },
                        {
                            "LT": {
                                "courses_avg": 95
                            }
                        }
                    ]
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
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
            chai_1.expect.fail();
            done();
        });
    });
    it("test NOT with AND contains OR and GT printuuid", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 100
                                }
                            }
                        }
                    ]
                },
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
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
            chai_1.expect.fail();
            done();
        });
    });
    it("valid json but not have columns", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 100
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
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
    it("order have a feature that column does not have", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 100
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_uuid",
                        "courses_avg"
                    ],
                    "ORDER": "courses_id"
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
    it("No options", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 100
                                }
                            }
                        }
                    ]
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
    it("No where", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
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
    it("feature that does not exist", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_123": 100
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_23",
                        "courses_av23"
                    ],
                    "ORDER": "courses_sdsda"
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
    it("test NOT with AND contains OR and GT", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "AND": [
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 99
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER": "courses_dept"
                }
            };
            ifa.performQuery(query)
                .then(function (resp) {
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
            chai_1.expect.fail();
            done();
        });
    });
    it("test performquery without dataset reject 424", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            ifa.removeDataset('courses')
                .then(function (res) {
                ifa.performQuery({
                    "WHERE": {
                        "OR": [
                            {
                                "GT": {
                                    "courses_avg": 97
                                }
                            },
                            {
                                "LT": {
                                    "courses_avg": 98
                                }
                            }
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg"
                    }
                }).then(function (result) {
                    chai_1.expect.fail();
                    done();
                }).catch(function (err) {
                    chai_1.expect(err.code).to.deep.equal(424);
                    done();
                });
            });
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it("test NOT with AND contains OR and GT", function (done) {
        var ifa = new InsightFacade_1.default();
        var content = fs.readFileSync('test2.zip', 'base64');
        ifa.addDataset('courses', content)
            .then(function (res) {
            var query = {
                "WHERE": {
                    "OR": [
                        {
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
                        }, {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
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
                chai_1.expect(resp.code).to.deep.equal(200);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
                done();
            });
        })
            .catch(function () {
            chai_1.expect.fail();
            done();
        });
    });
    it("test where has two filters with or", function () {
        var ifa = new InsightFacade_1.default();
        return ifa.performQuery({
            "WHERE": {
                "OR": [
                    {
                        "GT": {
                            "courses_avg": 97
                        }
                    },
                    {
                        "LT": {
                            "courses_avg": 98
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
                    "courses_avg"
                ],
                "ORDER": "courses_avg"
            }
        }).then(function (result) {
            chai_1.expect(result.code).to.deep.equal(200);
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("test when dataset is only in disk", function () {
        var ifa = new InsightFacade_1.default();
        return ifa.performQuery({
            "WHERE": {
                "OR": [
                    {
                        "GT": {
                            "courses_avg": 85
                        }
                    },
                    {
                        "LT": {
                            "courses_avg": 80
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg"
            }
        }).then(function (resp) {
            chai_1.expect(resp.code).to.deep.equal(200);
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=EchoSpec.js.map