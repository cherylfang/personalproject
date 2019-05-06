"use strict";
var JSZip = require("jszip");
var fs = require('fs');
var parse5 = require('parse5');
var Util_1 = require("../Util");
var util_1 = require("util");
var Transformations_1 = require("../syntax/Transformations");
var Option_1 = require("../Option_Syntax/Option");
var http = require('http');
var InsightFacade = (function () {
    function InsightFacade() {
        this.map = {};
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var that = this;
        if (id === 'rooms') {
            return that.addRoomset(id, content);
        }
        else {
            return new Promise(function (fulfill, reject) {
                var zip = new JSZip();
                var course = [];
                var promises = [];
                zip.loadAsync(content, { base64: true })
                    .then(function (strs) {
                    for (var filePath in strs.files) {
                        if (!strs.files[filePath].dir) {
                            var promiseOfAFile = zip.file(strs.files[filePath].name).async("string");
                            promises.push(promiseOfAFile);
                            promiseOfAFile
                                .then(function (content) {
                                try {
                                    var json = JSON.parse(content);
                                    for (var _i = 0, _a = json["result"]; _i < _a.length; _i++) {
                                        var section = _a[_i];
                                        var sec = {};
                                        sec[id + "_dept"] = section["Subject"];
                                        sec[id + "_id"] = section["Course"];
                                        sec[id + "_avg"] = section["Avg"];
                                        sec[id + "_instructor"] = section["Professor"];
                                        sec[id + "_title"] = section["Title"];
                                        sec[id + "_pass"] = section["Pass"];
                                        sec[id + "_fail"] = section["Fail"];
                                        sec[id + "_audit"] = section["Audit"];
                                        sec[id + "_uuid"] = String(section["id"]);
                                        if (section["Section"] === "overall") {
                                            sec[id + "_year"] = 1900;
                                        }
                                        else {
                                            sec[id + "_year"] = Number(section["Year"]);
                                        }
                                        course.push(sec);
                                    }
                                }
                                catch (err) {
                                }
                            })
                                .catch(function () {
                            });
                        }
                    }
                    Promise.all(promises)
                        .then(function () {
                        Util_1.default.trace('all promises are resolved');
                        if (!course[0]) {
                            reject({ code: 400, body: { "error": "No valid section in dataset" } });
                        }
                        else {
                            var alreadyExist_1 = false;
                            if (that.map[id] != null) {
                                alreadyExist_1 = true;
                            }
                            that.map[id] = course;
                            fs.writeFile(id, JSON.stringify(that.map), function (err) {
                                if (err) {
                                    reject({ code: 400, body: { "error": "Cannot write file" } });
                                }
                                else if (alreadyExist_1) {
                                    fulfill({ code: 201, body: {} });
                                }
                                fulfill({ code: 204, body: {} });
                            });
                        }
                    })
                        .catch(function (err) {
                        reject({ code: 400, body: { "error": "Empty folder" } });
                    });
                }).catch(function () {
                    reject({ code: 400, body: { "error": "Provided dataset is invalid." } });
                });
            });
        }
    };
    InsightFacade.prototype.addRoomset = function (id, content) {
        var that = this;
        that.map['Buildings'] = {};
        var exist = false;
        if (that.map['rooms'] != undefined) {
            exist = true;
        }
        that.map['rooms'] = [];
        return new Promise(function (fulfill, reject) {
            var zip = new JSZip();
            var course = [];
            var promises = [];
            var promiseofLatlon = [];
            zip.loadAsync(content, { base64: true })
                .then(function (strs) {
                var _loop_1 = function (filePath) {
                    if (!strs.files[filePath].dir) {
                        if ((strs.files[filePath].name.includes("index.htm") || strs.files[filePath].name.includes('buildings-and-classrooms')) && !strs.files[filePath].name.includes('.DS_Store')) {
                            var short_name_1 = filePath.slice(filePath.lastIndexOf('/') + 1, filePath.length);
                            var promiseOfAFile_1 = zip.file(strs.files[filePath].name).async("string");
                            var p = new Promise(function (fulfill, reject) {
                                promiseOfAFile_1
                                    .then(function (string) {
                                    try {
                                        var html_js = parse5.parse(string, { treeAdapter: parse5.treeAdapters.default });
                                        handleChildNode(html_js, promiseofLatlon, short_name_1);
                                        fulfill();
                                    }
                                    catch (err) {
                                        console.log(err);
                                        reject();
                                    }
                                })
                                    .catch(function () {
                                });
                            });
                            promises.push(p);
                        }
                    }
                };
                for (var filePath in strs.files) {
                    _loop_1(filePath);
                }
                Promise.all(promises)
                    .then(function (result) {
                    Promise.all(promiseofLatlon)
                        .then(function (res) {
                        var gonnaRemove = [];
                        for (var _i = 0, _a = that.map['rooms']; _i < _a.length; _i++) {
                            var room = _a[_i];
                            if (that.map['Buildings'][room[id + '_shortname']] != undefined) {
                                var fullname = that.map['Buildings'][room[id + '_shortname']]['Full_name'];
                                var lat = that.map['Buildings'][room[id + '_shortname']]['latlon']['lat'];
                                var lon = that.map['Buildings'][room[id + '_shortname']]['latlon']['lon'];
                                var address = that.map['Buildings'][room[id + '_shortname']]['Address'];
                                room[id + '_fullname'] = fullname;
                                room[id + '_lat'] = Number(lat);
                                room[id + '_lon'] = Number(lon);
                                room[id + '_address'] = address;
                            }
                            else {
                                gonnaRemove.push(that.map['rooms'].indexOf(room));
                            }
                        }
                        for (var i = gonnaRemove.length - 1; i >= 0; i--) {
                            that.map['rooms'].splice(gonnaRemove[i], 1);
                        }
                        delete that.map['Buildings'];
                        if (Object.keys(that.map['rooms']).length === 0) {
                            reject({ code: 400, body: { "error": "Empty dataset" } });
                        }
                        fs.writeFile(id, JSON.stringify(that.map), function (err) {
                            if (err) {
                                reject({ code: 400, body: { "error": "Cannot write file" } });
                            }
                            else if (exist) {
                                fulfill({ code: 201, body: {} });
                            }
                            else {
                                fulfill({ code: 204, body: {} });
                            }
                        });
                    }).catch(function () {
                        reject({ code: 404, body: { "error": "Cannot get latlon" } });
                    });
                }).catch(function (err) {
                    reject({ code: 400, body: { "error": "Cannot load file" } });
                });
            })
                .catch(function () {
                console.log("ERROR in Promise.all");
                reject({ code: 400, body: { "error": "Provided dataset is invalid." } });
            });
        });
        function handleChildNode(childNode, promises, short_name) {
            if (childNode["nodeName"] === 'tr' && childNode['attrs'].length != 0) {
                handleRow(childNode, promises, short_name);
            }
            else {
                if (childNode.hasOwnProperty('childNodes')) {
                    for (var _i = 0, _a = childNode['childNodes']; _i < _a.length; _i++) {
                        var cn = _a[_i];
                        handleChildNode(cn, promises, short_name);
                    }
                }
            }
        }
        function handleRow(childNode, promises, short_name) {
            var childNodes = childNode['childNodes'];
            var buildingAttributes = {};
            var room = {};
            if (!short_name.includes('index')) {
                room[id + '_shortname'] = short_name;
            }
            for (var _i = 0, childNodes_1 = childNodes; _i < childNodes_1.length; _i++) {
                var cn = childNodes_1[_i];
                if (isAddress(cn)) {
                    var address = getAddress(cn);
                    var addressUrl = address.replace(/ /g, '%20');
                    var pro = getLatLon(addressUrl, buildingAttributes);
                    promises.push(pro);
                    buildingAttributes['Address'] = address;
                }
                else if (isShortName(cn)) {
                    buildingAttributes['Short_name'] = getShortName(cn);
                }
                else if (isFullName(cn)) {
                    buildingAttributes['Full_name'] = getFullName(cn);
                }
                else if (isRoomNumber(cn)) {
                    room[id + '_number'] = getRoomNumber(cn);
                }
                else if (isRoomSeats(cn)) {
                    room[id + '_seats'] = Number(getRow(cn));
                }
                else if (isFurniture(cn)) {
                    room[id + '_furniture'] = getRow(cn);
                }
                else if (isRoomType(cn)) {
                    room[id + '_type'] = getRow(cn);
                }
                else if (isHREF(cn) && !short_name.includes('index')) {
                    room[id + '_href'] = getHREF(cn);
                }
                if (room[id + '_number'] != null && room[id + '_shortname'] != null) {
                    room[id + '_name'] = room[id + '_shortname'] + '_' + room[id + '_number'];
                }
            }
            if (Object.keys(room).length != 0) {
                that.map['rooms'].push(room);
            }
            if (Object.keys(buildingAttributes).length != 0) {
                that.map['Buildings'][buildingAttributes['Short_name']] = buildingAttributes;
            }
        }
        function isRoomSeats(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-capacity";
            return bool;
        }
        function isRoomNumber(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-number";
            return bool;
        }
        function isRoomType(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-type";
            return bool;
        }
        function isFurniture(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-furniture";
            return bool;
        }
        function isHREF(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-nothing";
            return bool;
        }
        function isAddress(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-building-address";
            return bool;
        }
        function isShortName(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-building-code";
            return bool;
        }
        function isFullName(cn) {
            var bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-title";
            return bool;
        }
        function getHREF(cn) {
            return cn['childNodes'][1]['attrs'][0]['value'];
        }
        function getRoomNumber(cn) {
            return cn['childNodes'][1]['childNodes'][0]['value'];
        }
        function getAddress(cn) {
            var addresswithn = cn['childNodes'][0]['value'];
            return addresswithn.replace(/\n/g, '').trim();
        }
        function getRow(cn) {
            return cn['childNodes'][0]['value'].replace(/\n/g, '').trim();
        }
        function getShortName(cn) {
            var shortName = cn['childNodes'][0]['value'];
            return shortName.replace(/\n/g, '').trim();
        }
        function getFullName(cn) {
            return cn['childNodes'][1]['childNodes'][0]['value'];
        }
        function getLatLon(url, building) {
            return new Promise(function (fulfill, reject) {
                var httpForAddress = 'http://skaha.cs.ubc.ca:11316/api/v1/team165/' + url;
                http.get(httpForAddress, function (res) {
                    res.setEncoding('utf8');
                    var body = '';
                    res.on('data', function (chunk) {
                        body += chunk;
                    });
                    res.on('end', function () {
                        try {
                            var json = JSON.parse(body);
                            building['latlon'] = json;
                            fulfill(json);
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                }).on('error', function (e) {
                    console.log('http.get failed');
                    reject({ code: 404, body: { "error": "can not get latlon" } });
                });
            });
        }
    };
    InsightFacade.prototype.fileExist = function (id) {
        try {
            fs.accessSync(id);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var that = this;
        console.log("exist? " + that.fileExist(id));
        return new Promise(function (fulfill, reject) {
            if (!that.map[id] && !that.fileExist(id)) {
                console.log('not exist');
                reject({ code: 404, body: { "error": "the operation was unsuccessful because the delete was for a resource that was not previously added." } });
            }
            else {
                fs.unlink(id, function (err) {
                    if (err) {
                        reject({ code: 404, body: { "error": "cant delete find" } });
                    }
                    else {
                        Util_1.default.trace('successfully deleted name: ' + id);
                        delete that.map[id];
                        fulfill({ code: 204, body: {} });
                    }
                });
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                var queryIn = JSON.parse(JSON.stringify(query));
                var attribute = void 0;
                var id = void 0;
                if (!('TRANSFORMATIONS' in queryIn)) {
                    attribute = queryIn['OPTIONS']['COLUMNS'][0];
                }
                else {
                    attribute = queryIn['TRANSFORMATIONS']['GROUP'][0];
                }
                id = attribute.slice(0, attribute.indexOf('_'));
                if (!QueryValid(queryIn, id)) {
                    reject({ code: 400, body: { "error": "the syntax of query " } });
                }
                if (!that.getDataset(id) && !that.fileExist(id)) {
                    reject({ code: 424, body: { "error": "The dataset does not exist in memory or disk." } });
                }
                if (!that.getDataset(id) && that.fileExist(id)) {
                    var content = fs.readFileSync(id, 'utf8');
                    that.map[id] = JSON.parse(content)[id];
                }
                Util_1.default.trace("parse the json");
                var result = {};
                result["result"] = handleFilter(queryIn, id);
                fulfill({ code: 200, body: result });
            }
            catch (e) {
                Util_1.default.trace(e);
                Util_1.default.trace("Invalid parse");
                reject({ code: 400, body: { "error": "quert is not valid json" } });
            }
            function handleFilter(query, id) {
                var arrayOfIndex = whereFilter(query["WHERE"], id);
                var arrayOfObject = Transformations_1.Transformations.readIndex(arrayOfIndex, that.getDataset(id));
                var after;
                var op = new Option_1.default(query, id);
                if (query["TRANSFORMATIONS"]) {
                    var trans = new Transformations_1.Transformations(query["TRANSFORMATIONS"], id);
                    var groupOfObject = trans.createGroup(arrayOfObject);
                    var afterApply = trans.handleapply(groupOfObject);
                    var afterColumn = op.getInfoFromGroup(afterApply, trans);
                    after = afterColumn;
                }
                else {
                    after = op.getInfoWithoutTrans(arrayOfObject);
                }
                if (op.isOrderExist()) {
                    var afterOrder = op.sort(after);
                    return afterOrder;
                }
                else {
                    return after;
                }
            }
            function whereFilter(query, id) {
                var result;
                if (Object.keys(query).length === 0) {
                    result = [];
                    for (var i = 0; i < that.getDataset(id).length; i++) {
                        result.push(i);
                    }
                    return result;
                }
                if (isMCOMPARISON(query, id)) {
                    var comparator = Object.keys(query)[0];
                    switch (comparator) {
                        case "GT":
                            result = comparatorHelper(comparator, query[comparator], id);
                            break;
                        case "LT":
                            result = comparatorHelper(comparator, query[comparator], id);
                            break;
                        case "EQ":
                            result = comparatorHelper(comparator, query[comparator], id);
                            break;
                    }
                }
                if (isSCOMPARISON(query, id)) {
                    result = isHelper(query["IS"], id);
                }
                if (isNEGATION(query, id)) {
                    result = notHelper(query["NOT"], id);
                }
                if (isLOGICCOMPARISAON(query)) {
                    if (Object.keys(query).indexOf("AND") === 0) {
                        result = andHelper(query["AND"], id);
                    }
                    else {
                        result = orHelper(query["OR"], id);
                    }
                }
                return result;
            }
            function comparatorHelper(comparatorKey, body, id) {
                var result = [];
                var attribute = Object.keys(body)[0];
                var range = body[attribute];
                var dataset = that.getDataset(id);
                switch (comparatorKey) {
                    case "GT":
                        for (var index = 0; index < dataset.length; index++) {
                            if (dataset[index][attribute] > range) {
                                result.push(index);
                            }
                        }
                        break;
                    case "LT":
                        for (var index = 0; index < dataset.length; index++) {
                            if (dataset[index][attribute] < range) {
                                result.push(index);
                            }
                        }
                        break;
                    case "EQ":
                        for (var index = 0; index < dataset.length; index++) {
                            if (dataset[index][attribute] === range) {
                                result.push(index);
                            }
                        }
                        break;
                }
                return result;
            }
            function notHelper(query, id) {
                var result = whereFilter(query, id);
                result = disjoint(result, id);
                return result;
            }
            function andHelper(query, id) {
                var firstResult = whereFilter(query[0], id);
                var result = firstResult;
                for (var i = 1; i < query.length; i++) {
                    result = intersection(result, whereFilter(query[i], id));
                }
                return result;
            }
            function orHelper(query, id) {
                var firstResult = whereFilter(query[0], id);
                var result = firstResult;
                for (var i = 1; i < query.length; i++) {
                    result = union(result, whereFilter(query[i], id));
                }
                return result;
            }
            function disjoint(arrayOfIndexOfSelectedSection, id) {
                var dataset = that.getDataset(id);
                var temp = [];
                var result = [];
                for (var i = 0; i < arrayOfIndexOfSelectedSection.length; i++) {
                    temp[arrayOfIndexOfSelectedSection[i]] = true;
                }
                for (var i = 0; i < dataset.length; i++) {
                    if (!temp[i]) {
                        result.push(i);
                    }
                }
                return result;
            }
            function union(a, b) {
                var temp = [];
                var result = [];
                for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
                    var valueA = a_1[_i];
                    temp[valueA] = true;
                }
                for (var _a = 0, b_1 = b; _a < b_1.length; _a++) {
                    var valueB = b_1[_a];
                    temp[valueB] = true;
                }
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i]) {
                        result.push(i);
                    }
                }
                return result;
            }
            function intersection(a, b) {
                var newArray = [];
                var results = [];
                for (var i = 0; i < b.length; i++) {
                    newArray[b[i]] = true;
                }
                for (var j = 0; j < a.length; j++) {
                    if (newArray[a[j]])
                        results.push(a[j]);
                }
                return results;
            }
            function isHelper(query, id) {
                var result = [];
                var attribute = Object.keys(query)[0];
                var value = query[attribute];
                var dataset = that.getDataset(id);
                var charArray = value.split("");
                var length = charArray.length;
                if (charArray[0] === "*" && charArray[length - 1] === "*") {
                    value = value.slice(1, length - 1);
                    for (var i = 0; i < dataset.length; i++) {
                        if (dataset[i][attribute].indexOf(value) >= 0) {
                            result.push(i);
                        }
                    }
                }
                else if (charArray[length - 1] === "*") {
                    value = value.slice(0, length - 1);
                    for (var i = 0; i < dataset.length; i++) {
                        if (dataset[i][attribute].startsWith(value)) {
                            result.push(i);
                        }
                    }
                }
                else if (charArray[0] === "*") {
                    value = value.slice(1);
                    for (var i = 0; i < dataset.length; i++) {
                        if (dataset[i][attribute].endsWith(value)) {
                            result.push(i);
                        }
                    }
                }
                else {
                    for (var i = 0; i < dataset.length; i++) {
                        if (dataset[i][attribute] === value) {
                            result.push(i);
                        }
                    }
                }
                return result;
            }
            function whereValid(query, id) {
                return filterValid(query, id);
            }
            function filterValid(query, id) {
                var len = Object.keys(query).length;
                if (len === 0) {
                    return true;
                }
                if (len === 1) {
                    if (isMCOMPARISON(query, id) || isNEGATION(query, id) || isSCOMPARISON(query, id)) {
                        return true;
                    }
                    if (isLOGICCOMPARISAON(query)) {
                        var logic = Object.keys(query)[0];
                        for (var _i = 0, _a = query[logic]; _i < _a.length; _i++) {
                            var filter = _a[_i];
                            if (!filterValid(filter, id)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                }
                else {
                    return false;
                }
            }
            function isLOGICCOMPARISAON(query) {
                var logic = Object.keys(query)[0];
                if (logic === "AND" || logic === "OR") {
                    if (query[logic] instanceof Array && query[logic].length > 0) {
                        return true;
                    }
                }
                return false;
            }
            function isMCOMPARISON(query, id) {
                var mcomparator = Object.keys(query)[0];
                if (mcomparator === "GT" || mcomparator === "LT" || mcomparator === "EQ") {
                    var mkey = Object.keys(query[mcomparator])[0];
                    if (id === 'courses') {
                        if (mkey === "courses_avg" || mkey === "courses_pass" || mkey === "courses_fail" || mkey === "courses_audit" || mkey === "courses_year") {
                            return util_1.isNumber(query[mcomparator][mkey]);
                        }
                    }
                    if (id === "rooms") {
                        if (mkey === 'rooms_lat' || mkey === 'rooms_lon' || mkey === 'rooms_seats') {
                            return util_1.isNumber(query[mcomparator][mkey]);
                        }
                    }
                }
                return false;
            }
            function isSCOMPARISON(query, id) {
                var sCompara = Object.keys(query)[0];
                if (sCompara === "IS") {
                    var skey = Object.keys(query[sCompara])[0];
                    if (id === 'courses') {
                        if (skey === "courses_dept" || skey === "courses_id" || skey === "courses_instructor" || skey === "courses_title" || skey === "courses_uuid") {
                            return typeof query[sCompara][skey] === 'string' || query[sCompara][skey] instanceof String;
                        }
                    }
                    if (id === 'rooms') {
                        if (skey === "rooms_fullname" || skey === "rooms_shortname" || skey === "rooms_number" || skey === "rooms_name"
                            || skey === "rooms_address" || skey === "rooms_type" || skey === "rooms_furniture" || skey === "rooms_href") {
                            return typeof query[sCompara][skey] === 'string' || query[sCompara][skey] instanceof String;
                        }
                    }
                }
                return false;
            }
            function isNEGATION(query, id) {
                var negation = Object.keys(query)[0];
                if (negation === "NOT") {
                    var filter = query[negation];
                    if (filterValid(filter, id)) {
                        return true;
                    }
                }
                return false;
            }
            function QueryValid(query, id) {
                var queryKeys = Object.keys(query);
                if (queryKeys.length != 2 && queryKeys.length != 3) {
                    return false;
                }
                if (!whereValid(query["WHERE"], id)) {
                    return false;
                }
                if (queryKeys.indexOf("OPTIONS") === -1) {
                    return false;
                }
                var option = new Option_1.default(query, id);
                if (!option.isValid()) {
                    return false;
                }
                if (queryKeys.indexOf("TRANSFORMATIONS") != -1) {
                    var transformations = new Transformations_1.Transformations(query["TRANSFORMATIONS"], id);
                    var res = transformations.isValid();
                    return res;
                }
                return true;
            }
        });
    };
    InsightFacade.prototype.getDataset = function (id) {
        var that = this;
        var dataset = that.map[id];
        return dataset;
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map