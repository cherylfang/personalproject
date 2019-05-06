"use strict";
var DatasetInfo_1 = require("../DatasetInfo/DatasetInfo");
var Column = (function () {
    function Column(query, id) {
        this.query = query;
        this.id = id;
        this.datasetInfo = new DatasetInfo_1.default(this.id);
    }
    Column.prototype.getInfoWithoutTrans = function (arrayOfObject) {
        var arrayAfterColumn = [];
        for (var _i = 0, arrayOfObject_1 = arrayOfObject; _i < arrayOfObject_1.length; _i++) {
            var object = arrayOfObject_1[_i];
            var obj = {};
            for (var _a = 0, _b = this.getArrayOfKey(); _a < _b.length; _a++) {
                var key = _b[_a];
                obj[key] = object[key];
            }
            arrayAfterColumn.push(obj);
        }
        return arrayAfterColumn;
    };
    Column.prototype.getInfoOfGroupWithTrans = function (objectAfterTransformation, trans) {
        var arrayOfGroups = [];
        for (var keyOfgroup in objectAfterTransformation) {
            var groupObject = {};
            for (var _i = 0, _a = this.getArrayOfKey(); _i < _a.length; _i++) {
                var key = _a[_i];
                if (trans.groupKeysContains(key)) {
                    var attribute = objectAfterTransformation[keyOfgroup]["array"][0][key];
                    groupObject[key] = attribute;
                }
                if (trans.applyKeysContains(key)) {
                    groupObject[key] = objectAfterTransformation[keyOfgroup][key];
                }
            }
            arrayOfGroups.push(groupObject);
        }
        return arrayOfGroups;
    };
    Column.prototype.isValidWhenTransExist = function (tran) {
        if (this.query == null || !(this.query instanceof Array) || this.query.length < tran.getApplyKeys().length) {
            return false;
        }
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var attri = _a[_i];
            if (!tran.applyKeysContains(attri) && !tran.groupKeysContains(attri)) {
                return false;
            }
        }
        return true;
    };
    Column.prototype.isValidWhenTransNotExist = function () {
        if (this.query == null || !(this.query instanceof Array)) {
            return false;
        }
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var attri = _a[_i];
            if (!this.datasetInfo.allAttributesContains(attri)) {
                return false;
            }
        }
        return true;
    };
    Column.prototype.getArrayOfKey = function () {
        return this.query;
    };
    Column.prototype.contains = function (key) {
        return this.query.indexOf(key) >= 0;
    };
    return Column;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Column;
//# sourceMappingURL=Column.js.map