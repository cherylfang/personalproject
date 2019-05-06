import {IInsightFacade, InsightResponse} from "./IInsightFacade";
var JSZip = require("jszip");
var fs = require('fs');
var parse5 = require('parse5');

import Log from "../Util";
import {isArray, isNumber} from "util";
import {Transformations} from "../syntax/Transformations";
import DatasetInfo from "../DatasetInfo/DatasetInfo";
import Group from "../syntax/Group";
import Option from "../Option_Syntax/Option";
var http = require('http');


export default class InsightFacade implements IInsightFacade {

    map: any = {};

    constructor() {
        Log.trace('InsightFacadeImpl::init()');

    }


    addDataset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        if (id === 'rooms') {
            return that.addRoomset(id, content);
        } else {
            return new Promise(function (fulfill, reject) {
                let zip = new JSZip();
                let course: Array<any> = [];

                let promises: Promise<string>[] = [];
                zip.loadAsync(content, {base64: true})
                    .then(function (strs: any) {
                        for (let filePath in strs.files) {
                            if (!strs.files[filePath].dir) {
                                let promiseOfAFile = zip.file(strs.files[filePath].name).async("string");
                                promises.push(promiseOfAFile);
                                promiseOfAFile
                                    .then(function (content: string) {
                                        try {
                                            let json = JSON.parse(content);

                                            for (let section of json["result"]) {
                                                let sec: any = {};
                                                sec[id + "_dept"] = section["Subject"];
                                                sec[id + "_id"] = section["Course"];
                                                sec[id + "_avg"] = section["Avg"];
                                                sec[id + "_instructor"] = section["Professor"];
                                                sec[id + "_title"] = section["Title"];
                                                sec[id + "_pass"] = section["Pass"];
                                                sec[id + "_fail"] = section["Fail"];
                                                sec[id + "_audit"] = section["Audit"];
                                                sec[id + "_uuid"] = String(section["id"]);
                                                if(section["Section"] === "overall") {
                                                    sec[id + "_year"] = 1900;
                                                }else{
                                                    sec[id + "_year"] = Number(section["Year"]);
                                                }
                                                course.push(sec);

                                            }
                                        }
                                        catch (err) {
                                            // Log.trace('invalid json');
                                            // reject({code: 400, body: {}});
                                        }
                                    })
                                    .catch(function () {
                                    });
                            }

                        }
                        Promise.all(promises)
                            .then(function () {
                                Log.trace('all promises are resolved');
                                // console.log(!course[0])
                                if (!course[0]) {
                                    reject({code: 400, body: {"error": "No valid section in dataset"}});
                                } else {
                                    let alreadyExist = false;
                                    if (that.map[id] != null) {
                                        alreadyExist = true;
                                    }
                                    that.map[id] = course;
                                    fs.writeFile(id, JSON.stringify(that.map), function (err: string) {
                                        if (err) {
                                            reject({code: 400, body: {"error": "Cannot write file"}});
                                        } else if (alreadyExist) {
                                            fulfill({code: 201, body: {}});
                                        }
                                        fulfill({code: 204, body: {}});
                                    })
                                }

                            })
                            .catch(function (err) {
                                // console.log("ERROR in Promise.all", err);
                                reject({code: 400, body: {"error": "Empty folder"}});
                            });

                    }).catch(function () {
                    // Log.trace('catch');
                    reject({code: 400, body: {"error": "Provided dataset is invalid."}});
                })

            })
        }
    }

    addRoomset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        that.map['Buildings'] = {};
        var exist = false;
        if (that.map['rooms'] != undefined) {
            exist = true;
        }
        that.map['rooms'] = [];
        return new Promise(function (fulfill, reject) {
            let zip = new JSZip();
            let course: Array<any> = [];
            let promises: Promise<any>[] = [];
            let promiseofLatlon: Promise<any>[] = [];
            zip.loadAsync(content, {base64: true})
                .then(function (strs: any) {
                    for (let filePath in strs.files) {
                        if (!strs.files[filePath].dir) {
                            if ((strs.files[filePath].name.includes("index.htm") || strs.files[filePath].name.includes('buildings-and-classrooms')) && !strs.files[filePath].name.includes('.DS_Store')) {
                                let short_name = filePath.slice(filePath.lastIndexOf('/') + 1, filePath.length);
                                let promiseOfAFile = zip.file(strs.files[filePath].name).async("string");
                                let p = new Promise(function (fulfill, reject) {
                                    promiseOfAFile
                                        .then(function (string: string) {
                                            try {
                                                const html_js = parse5.parse(string, {treeAdapter: parse5.treeAdapters.default})
                                                handleChildNode(html_js, promiseofLatlon, short_name);
                                                fulfill();
                                            } catch (err) {
                                                console.log(err);
                                                reject();
                                            }
                                        })
                                        .catch(function () {
                                        })
                                });
                                promises.push(p);
                            }
                        }
                    }
                    Promise.all(promises)
                        .then(function (result: any) {
                            Promise.all(promiseofLatlon)
                                .then(function (res: any) {
                                    // console.log('building ', that.map['Buildings']);
                                    let gonnaRemove: number[] = [];
                                    for (let room of that.map['rooms']) {
                                        // console.log(room);
                                        // console.log(room[id + '_shortname']);
                                        // console.log(that.map['Buildings'][room[id + '_shortname']]);
                                        if (that.map['Buildings'][room[id + '_shortname']] != undefined) {
                                            let fullname = that.map['Buildings'][room[id + '_shortname']]['Full_name'];
                                            let lat = that.map['Buildings'][room[id + '_shortname']]['latlon']['lat'];
                                            let lon = that.map['Buildings'][room[id + '_shortname']]['latlon']['lon'];
                                            let address = that.map['Buildings'][room[id + '_shortname']]['Address'];
                                            room[id + '_fullname'] = fullname;
                                            room[id + '_lat'] = Number(lat);
                                            room[id + '_lon'] = Number(lon);
                                            room[id + '_address'] = address;
                                        }else{
                                            gonnaRemove.push(that.map['rooms'].indexOf(room));
                                        }
                                    }
                                    // HERE!!! I need to go through them in reverse order
                                    for(let i = gonnaRemove.length - 1; i >= 0; i--) {
                                        that.map['rooms'].splice(gonnaRemove[i],1);
                                    }

                                    delete that.map['Buildings'];
                                    // console.log(that.map);
                                    if (Object.keys(that.map['rooms']).length === 0) {
                                        reject({code: 400, body: {"error": "Empty dataset"}});
                                    }
                                    //console.log("fine");
                                   // console.log(that.map['rooms']);
                                    fs.writeFile(id, JSON.stringify(that.map), function (err: string) {
                                        if (err) {
                                            reject({code: 400, body: {"error": "Cannot write file"}});
                                        } else if (exist) {
                                            fulfill({code: 201, body: {}});
                                        }else {
                                            fulfill({code: 204, body: {}});
                                        }
                                    })
                                }).catch(function () {
                                reject({code: 404, body: {"error": "Cannot get latlon"}});
                            });

                        }).catch(function (err) {
                        reject({code: 400, body: {"error": "Cannot load file"}});
                    })

                })
                .catch(function () {
                    console.log("ERROR in Promise.all");
                    reject({code: 400, body: {"error": "Provided dataset is invalid."}});
                });
        });

        function handleChildNode(childNode: any, promises: Promise<any>[], short_name: string) {
            if (childNode["nodeName"] === 'tr' && childNode['attrs'].length != 0) {
                handleRow(childNode, promises, short_name);
            } else {
                if (childNode.hasOwnProperty('childNodes')) {
                    for (let cn of childNode['childNodes']) {
                        handleChildNode(cn, promises, short_name);
                    }
                }
            }
        }

        function handleRow(childNode: any, promises: Promise<any>[], short_name: string) {
            let childNodes = childNode['childNodes'];
            let buildingAttributes: any = {};
            let room: any = {};
            if (!short_name.includes('index')) {
                room[id + '_shortname'] = short_name;
            }
            for (let cn of childNodes) {
                if (isAddress(cn)) {
                    let address = getAddress(cn);
                    let addressUrl = address.replace(/ /g, '%20');
                    let pro = getLatLon(addressUrl, buildingAttributes);
                    promises.push(pro);

                    buildingAttributes['Address'] = address;
                } else if (isShortName(cn)) {
                    // console.log(getShortName(cn));
                    buildingAttributes['Short_name'] = getShortName(cn);
                    // room[id + '_shortname'] = getShortName(cn)
                } else if (isFullName(cn)) {
                    // console.log(getFullName(cn));
                    buildingAttributes['Full_name'] = getFullName(cn);
                    // room[id + '_fullname'] = getFullName(cn)
                } else if (isRoomNumber(cn)) {
                    // console.log('Room Number ', getRoomNumber(cn));
                    room[id + '_number'] = getRoomNumber(cn); // number is not Number!!!
                } else if (isRoomSeats(cn)) {
                    // console.log('Room seats ', getRow(cn));
                    room[id + '_seats'] = Number(getRow(cn));
                } else if (isFurniture(cn)) {
                    // console.log('Room Furniture ', getRow(cn));
                    room[id + '_furniture'] = getRow(cn)
                } else if (isRoomType(cn)) {
                    // console.log('Room Type ', getRow(cn));
                    room[id + '_type'] = getRow(cn)
                } else if (isHREF(cn) && !short_name.includes('index')) {
                    // console.log('Room Href ', getHREF(cn));
                    room[id + '_href'] = getHREF(cn)
                }
                if (room[id + '_number'] != null && room[id + '_shortname'] != null) {
                    room[id + '_name'] = room[id + '_shortname'] + '_' + room[id + '_number']
                }

            }
            // that.map['Buildings'][buildingAttributes['Short_name']] = buildingAttributes;
            // and to building set
            if (Object.keys(room).length != 0) {
                that.map['rooms'].push(room);
            }
            if (Object.keys(buildingAttributes).length != 0) {
                that.map['Buildings'][buildingAttributes['Short_name']] = buildingAttributes;
            }


        }

        // S
        function isRoomSeats(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-capacity";
            return bool;
        }

        function isRoomNumber(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-number";
            return bool;
        }

        function isRoomType(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-type";
            return bool;
        }

        function isFurniture(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-room-furniture";
            return bool;
        }

        function isHREF(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-nothing"
            return bool;
        }

        function isAddress(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-building-address"
            return bool;
        }

        function isShortName(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-field-building-code"
            return bool;
        }

        function isFullName(cn: any): boolean {
            let bool = cn['nodeName'] === 'td' && cn['attrs'][0]['value'] === "views-field views-field-title";
            return bool;
        }

        function getHREF(cn: any): any {
            return cn['childNodes'][1]['attrs'][0]['value'];
        }

        function getRoomNumber(cn: any): string {
            return cn['childNodes'][1]['childNodes'][0]['value'];
        }

        function getAddress(cn: any): string {
            let addresswithn = cn['childNodes'][0]['value'];
            return addresswithn.replace(/\n/g, '').trim();
        }

        function getRow(cn: any): any {
            return cn['childNodes'][0]['value'].replace(/\n/g, '').trim();
        }

        function getShortName(cn: any): string {
            let shortName = cn['childNodes'][0]['value'];
            return shortName.replace(/\n/g, '').trim();
        }

        function getFullName(cn: any): string {
            return cn['childNodes'][1]['childNodes'][0]['value'];
        }

        function getLatLon(url: string, building: any): Promise<any> {
            return new Promise(function (fulfill, reject) {
                let httpForAddress = 'http://skaha.cs.ubc.ca:11316/api/v1/team165/' + url;
                http.get(httpForAddress, function (res: any) {
                    res.setEncoding('utf8');
                    let body = '';
                    res.on('data', function (chunk: any) {
                        body += chunk;
                    });
                    res.on('end', function () {
                        try {
                            let json = JSON.parse(body);
                            building['latlon'] = json;
                            fulfill(json);
                        } catch (err) {
                            reject(err);
                        }
                    })
                }).on('error', function (e: any) {
                    console.log('http.get failed')
                    reject({code: 404, body: {"error": "can not get latlon"}});
                })
            })
        }


    }

    fileExist(id:string): boolean{
        try{
            fs.accessSync(id)
            return true;
        }catch(e){
            return false;
        }


    }

    removeDataset(id: string): Promise<InsightResponse> {
        let that = this;
        console.log("exist? " + that.fileExist(id));
        return new Promise(function (fulfill, reject) {
            if(!that.map[id] && !that.fileExist(id)) {
                console.log('not exist');
                reject({code:404, body: {"error": "the operation was unsuccessful because the delete was for a resource that was not previously added."}});
            }else{
                fs.unlink(id,function (err: string) {
                    if(err){
                        reject({code:404, body: {"error": "cant delete find"}});
                    }else{
                        Log.trace('successfully deleted name: ' + id);
                        delete that.map[id];
                        // console.log(that.map[id]);
                        fulfill({code: 204, body: {}});
                    }
                });

            }
        })
    }


    performQuery(query: any): Promise <InsightResponse> {
        let that = this;
        return new Promise(function(fulfill,reject) {
            try{
                let queryIn = JSON.parse(JSON.stringify(query));
                let attribute: string;
                let id: string;
                if (!('TRANSFORMATIONS' in queryIn)) {
                    attribute = queryIn['OPTIONS']['COLUMNS'][0];

                }else{
                    attribute = queryIn['TRANSFORMATIONS']['GROUP'][0];
                }
                id = attribute.slice(0, attribute.indexOf('_'));

                if(!QueryValid(queryIn, id)) {
                    reject({code: 400, body: {"error": "the syntax of query "}});
                }


                if(!that.getDataset(id) && !that.fileExist(id)){
                    reject({code: 424, body: {"error": "The dataset does not exist in memory or disk."}});
                }
                if(!that.getDataset(id) && that.fileExist(id)){
                    let content = fs.readFileSync(id,'utf8');
                    that.map[id] = JSON.parse(content)[id];
                }



                Log.trace("parse the json");
                // console.log(queryIn);

                let result: any = {};
                result["result"] = handleFilter(queryIn, id);
                fulfill({code: 200, body: result});


            } catch(e) {
                Log.trace(e);
                Log.trace("Invalid parse");
                reject({code: 400, body: {"error": "quert is not valid json"}});
            }


            function handleFilter(query:any, id:string): Array<any>{
                let arrayOfIndex: Array<any> = whereFilter(query["WHERE"], id);
                let arrayOfObject = Transformations.readIndex(arrayOfIndex,that.getDataset(id));
                let after;
                let op = new Option(query,id);
                if(query["TRANSFORMATIONS"]) {
                    let trans = new Transformations(query["TRANSFORMATIONS"],id);
                    let groupOfObject = trans.createGroup(arrayOfObject);
                    let afterApply = trans.handleapply(groupOfObject);
                    let afterColumn = op.getInfoFromGroup(afterApply, trans);
                    after = afterColumn
                }else{
                    after = op.getInfoWithoutTrans(arrayOfObject);
                }

                if(op.isOrderExist()){
                    let afterOrder = op.sort(after);
                    return afterOrder
                }else{
                    return after
                }
            }


            function whereFilter(query: any, id: string): Array<any> {
                var result: Array<number>;

                if(Object.keys(query).length === 0) {
                    result = [];
                    for(let i = 0; i < that.getDataset(id).length; i++) {
                        result.push(i);
                    }
                    return result;
                }

                if(isMCOMPARISON(query, id)) {
                    let comparator = Object.keys(query)[0];
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
                if(isSCOMPARISON(query, id)) {
                    result = isHelper(query["IS"], id);
                }

                if(isNEGATION(query, id)) {
                    result = notHelper(query["NOT"], id);
                }

                if(isLOGICCOMPARISAON(query)) {
                    if(Object.keys(query).indexOf("AND") === 0) {
                        result = andHelper(query["AND"] ,id);
                    }else{
                        result = orHelper(query["OR"], id);
                    }
                }
                return result;
            }


            function comparatorHelper(comparatorKey: string, body: any, id: string): Array<number> {
                let result: Array<number> = [];
                let attribute = Object.keys(body)[0];
                let range = body[attribute];
                let dataset = that.getDataset(id);
                switch (comparatorKey) {
                    case "GT":
                        for(let index = 0; index < dataset.length; index++) {
                            if(dataset[index][attribute] > range) {
                                result.push(index);
                            }
                        }
                        break;

                    case "LT":
                        for(let index = 0; index < dataset.length; index++) {
                            if(dataset[index][attribute] < range) {
                                result.push(index);
                            }
                        }
                        break;

                    case "EQ":
                        for(let index = 0; index < dataset.length; index++) {
                            if(dataset[index][attribute] === range) {
                                result.push(index);
                            }
                        }
                        break;
                }
                return result;
            }




            function notHelper(query: any, id: string): Array<number> {
                var result = whereFilter(query,id);
                result = disjoint(result, id);
                return result;
            }

            function andHelper(query: Array<any>, id: string): Array<number> {
                let firstResult = whereFilter(query[0], id);
                let result: Array<number> = firstResult;
                for(let i = 1; i < query.length; i++) {
                    result = intersection(result,whereFilter(query[i],id));
                }
                return result;
            }

            function orHelper(query: Array<any>, id: string): Array<number> {
                let firstResult = whereFilter(query[0],id);
                let result: Array<number> = firstResult;
                for(let i = 1; i < query.length; i++) {
                    result = union(result,whereFilter(query[i],id));
                }
                return result
            }


            function disjoint(arrayOfIndexOfSelectedSection: Array<number>, id: string): Array<number> {
                let dataset = that.getDataset(id);
                let temp: Array<boolean> = [];
                let result: Array<number> = [];
                for(let i = 0; i < arrayOfIndexOfSelectedSection.length; i++) {
                    temp[arrayOfIndexOfSelectedSection[i]] = true;
                }
                for(let i = 0; i < dataset.length; i++) {
                    if(!temp[i]) {
                        result.push(i);
                    }
                }
                return result;
            }


            function union(a: Array<number>, b: Array<number>) {
                let temp: Array<boolean> = [];
                let result = [];

                for(let valueA of a) {
                    temp[valueA] = true;
                }
                for(let valueB of b) {
                    temp[valueB] = true;
                }

                // here we have to use explicit for loop to get integer form of index, otherwise if we use
                // for(let i in temp) in which i is key in string form. Maybe because the array is not complete full
                // and we only fulfill some spots of the array.
                for(let i = 0; i < temp.length; i++){
                    if(temp[i]){
                        result.push(i);
                    }
                }
                return result;

            }


            function intersection(a:any, b:any):any {
                let newArray :any[] = [];
                let results = [];
                for (var i = 0; i < b.length; i++) {
                    newArray[b[i]] = true;
                }
                for (var j = 0; j < a.length; j++) {
                    if (newArray[a[j]])
                        results.push(a[j]);
                }
                return results;
            }

            function isHelper(query: any, id: string): Array<number> {
                let result: Array<number> = [];
                let attribute = Object.keys(query)[0];
                let value = query[attribute];
                let dataset = that.getDataset(id);
                let charArray = value.split("");
                let length = charArray.length;

                if(charArray[0] === "*" && charArray[length - 1] === "*") {
                    value = value.slice(1,length - 1);
                    for(let i = 0; i < dataset.length; i++) {
                        if(dataset[i][attribute].indexOf(value) >= 0) {
                            result.push(i);
                        }
                    }
                }else if(charArray[length - 1] === "*") {
                    value = value.slice(0,length - 1);

                    for(let i = 0; i < dataset.length; i++) {
                        if(dataset[i][attribute].startsWith(value)) {
                            result.push(i);
                        }
                    }
                }else if(charArray[0] === "*") {
                    value = value.slice(1);
                    for(let i = 0; i < dataset.length; i++) {
                        if(dataset[i][attribute].endsWith(value)) {
                            result.push(i);
                        }
                    }
                }else{
                    for(let i = 0; i < dataset.length; i++) {
                        if(dataset[i][attribute] === value) {
                            result.push(i);
                        }
                    }
                }
                return result;
            }



            function whereValid(query:any, id: string){

                return filterValid(query, id);

            }


            function filterValid(query:any, id: string):boolean{
                let len = Object.keys(query).length;
                if(len === 0) {
                    return true;
                }
                if(len === 1) {
                    if(isMCOMPARISON(query, id) || isNEGATION(query, id) || isSCOMPARISON(query, id)) {

                        return true;
                    }
                    if(isLOGICCOMPARISAON(query)) {

                        let logic = Object.keys(query)[0];
                        // return filterValid(query[logic][0], id) && filterValid(query[logic][1], id);
                        for(let filter of query[logic]) {
                            if(!filterValid(filter,id)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                }else{
                    return false;
                }
            }


            function isLOGICCOMPARISAON(query: any): boolean {
                let logic = Object.keys(query)[0];
                if( logic === "AND" || logic === "OR") {
                    if(query[logic] instanceof Array && query[logic].length > 0) {
                        return true;
                    }
                }
                return false;
            }


            function isMCOMPARISON(query:any, id: string): boolean{
                let mcomparator = Object.keys(query)[0];
                if(mcomparator === "GT" || mcomparator === "LT" || mcomparator === "EQ"){
                    let mkey = Object.keys(query[mcomparator])[0];
                    if (id === 'courses') {
                        if (mkey === "courses_avg" || mkey === "courses_pass" || mkey === "courses_fail" || mkey === "courses_audit" || mkey === "courses_year") {
                            return isNumber(query[mcomparator][mkey]);
                        }
                    }
                    if(id === "rooms") {
                        if (mkey === 'rooms_lat' || mkey === 'rooms_lon' || mkey === 'rooms_seats') {
                            return isNumber(query[mcomparator][mkey]);
                        }
                    }
                }
                return false;
            }


            function isSCOMPARISON(query:any, id: string): boolean {
                let sCompara = Object.keys(query)[0];

                if(sCompara === "IS") {
                    let skey = Object.keys(query[sCompara])[0];
                    if(id === 'courses') {
                        if(skey === "courses_dept" || skey === "courses_id" || skey === "courses_instructor" || skey === "courses_title" || skey === "courses_uuid") {
                            return typeof query[sCompara][skey] === 'string' || query[sCompara][skey] instanceof String
                        }
                    }
                    if(id === 'rooms') {
                        if(skey === "rooms_fullname" || skey === "rooms_shortname" || skey === "rooms_number" || skey === "rooms_name"
                            || skey === "rooms_address" || skey === "rooms_type" || skey === "rooms_furniture" || skey === "rooms_href") {
                            return typeof query[sCompara][skey] === 'string' || query[sCompara][skey] instanceof String
                        }
                    }
                }
                return false;
            }


            function isNEGATION(query:any, id: string):Boolean {
                let negation = Object.keys(query)[0];
                if(negation === "NOT") {
                    let filter = query[negation];
                    if(filterValid(filter, id)){
                        return true;
                    }
                }
                return false;
            }

            
            function QueryValid(query:any, id: string): boolean{
                let queryKeys = Object.keys(query);
                if(queryKeys.length != 2 && queryKeys.length != 3) {
                    return false;
                }
                if(!whereValid(query["WHERE"],id)) {
                    return false;
                }

                if(queryKeys.indexOf("OPTIONS") === -1) {
                    return false;
                }
                let option = new Option(query, id);
                if(!option.isValid()) {
                    return false;
                }
                if(queryKeys.indexOf("TRANSFORMATIONS") != -1) {
                    let transformations = new Transformations(query["TRANSFORMATIONS"],id);
                    let res: boolean = transformations.isValid();
                    return res;
                }
                return true;

            }

        })}

    getDataset(id: string): Array<any>{
        let that = this;
        let dataset = that.map[id];
        return dataset;
    }

}


