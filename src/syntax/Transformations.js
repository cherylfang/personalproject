"use strict";
var Util_1 = require("../Util");
var Group_1 = require("./Group");
var Apply_1 = require("./Apply");
var Transformations = (function () {
    function Transformations(query, id) {
        Util_1.default.trace('Transormation syntax node ::init()');
        this.query = query;
        this.id = id;
        var queryForGroup = null;
        var queryForApply = null;
        if (query != null) {
            queryForGroup = query["GROUP"];
            queryForApply = query["APPLY"];
        }
        this.group = new Group_1.default(queryForGroup, id);
        this.apply = new Apply_1.default(queryForApply, id);
    }
    Transformations.prototype.isValid = function () {
        if (this.query == null || Object.keys(this.query).length != 2) {
            return false;
        }
        return this.group.isValid() && this.apply.isValid();
    };
    Transformations.prototype.getGroupKeys = function () {
        return this.group.getGroupKeys();
    };
    Transformations.prototype.getApplyKeys = function () {
        return this.apply.getApplyKeys();
    };
    Transformations.prototype.groupKeysContains = function (attribute) {
        return this.group.getGroupKeys().indexOf(attribute) >= 0;
    };
    Transformations.prototype.applyKeysContains = function (attribute) {
        return this.apply.getApplyKeys().indexOf(attribute) >= 0;
    };
    Transformations.prototype.createGroup = function (result) {
        var groups = this.query["GROUP"];
        var map = {};
        var groupobject = {};
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var element = result_1[_i];
            for (var _a = 0, groups_1 = groups; _a < groups_1.length; _a++) {
                var keyOfGroup = groups_1[_a];
                groupobject[keyOfGroup] = element[keyOfGroup];
            }
            var nameOfGroup = JSON.stringify(groupobject);
            if (map[nameOfGroup]) {
                var oneGroup = map[nameOfGroup]["array"];
                oneGroup.push(element);
            }
            else {
                map[nameOfGroup] = {};
                map[nameOfGroup]["array"] = [];
                map[nameOfGroup]["array"].push(element);
            }
        }
        return map;
    };
    Transformations.readIndex = function (arrayOfIndex, dataset) {
        var arrayOfObjects = [];
        for (var _i = 0, arrayOfIndex_1 = arrayOfIndex; _i < arrayOfIndex_1.length; _i++) {
            var index = arrayOfIndex_1[_i];
            arrayOfObjects.push(dataset[index]);
        }
        return arrayOfObjects;
    };
    Transformations.prototype.handleapply = function (groupObject) {
        for (var a in groupObject) {
            var objectarray = groupObject[a];
            var array = groupObject[a]['array'];
            var temp = this.apply.getApplyKeys();
            for (var i = 0; i < this.apply.getApplyKeys().length; i++) {
                var key = this.apply.getApplyKeys()[i];
                var switchkey = this.apply.getComputationKeys()[i];
                var content = this.query["APPLY"][i][key][switchkey];
                switch (switchkey) {
                    case "MAX":
                        objectarray[key] = Apply_1.default.ComputeMax(array, content);
                        break;
                    case 'MIN':
                        objectarray[key] = Apply_1.default.ComputeMin(array, content);
                        break;
                    case 'AVG':
                        objectarray[key] = Apply_1.default.ComputeAvg(array, content);
                        break;
                    case 'COUNT':
                        objectarray[key] = Apply_1.default.ComputeCount(array, content);
                        break;
                    case 'SUM':
                        objectarray[key] = Apply_1.default.ComputeSum(array, content);
                        break;
                }
            }
        }
        return groupObject;
    };
    return Transformations;
}());
exports.Transformations = Transformations;
//# sourceMappingURL=Transformations.js.map