"use strict";
var DatasetInfo_1 = require("../DatasetInfo/DatasetInfo");
var Decimal = require('decimal.js');
var Apply = (function () {
    function Apply(query, id) {
        this.query = query;
        this.id = id;
        this.arrayOfComputation = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
    }
    Apply.prototype.isValid = function () {
        if (this.query == null || !(this.query instanceof Array) || this.hasDuplicatedElement(this.getApplyKeys())) {
            return false;
        }
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var applyObject = _a[_i];
            if (!this.isApplyObjectValid(applyObject)) {
                return false;
            }
        }
        return true;
    };
    Apply.prototype.getApplyKeys = function () {
        var arrayOfNewKeys = [];
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var cur = _a[_i];
            var newKey = Object.keys(cur)[0];
            arrayOfNewKeys.push(newKey);
        }
        return arrayOfNewKeys;
    };
    Apply.prototype.getComputationKeys = function () {
        var arrayOfCompKeys = [];
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var cur = _a[_i];
            var newKey = Object.keys(cur)[0];
            var compKey = Object.keys(cur[newKey])[0];
            arrayOfCompKeys.push(compKey);
        }
        return arrayOfCompKeys;
    };
    Apply.prototype.hasDuplicatedElement = function (arr) {
        var temp = Object.create(null);
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var cur = arr_1[_i];
            if (cur in temp) {
                return true;
            }
            temp[cur] = 'haha';
        }
        return false;
    };
    Apply.prototype.isApplyObjectValid = function (applyObject) {
        if (Object.keys(applyObject).length != 1) {
            return false;
        }
        if (Object.keys(applyObject)[0].indexOf('_') >= 0) {
            return false;
        }
        var inside = applyObject[Object.keys(applyObject)[0]];
        return this.isInsideValid(inside);
    };
    Apply.prototype.isInsideValid = function (inside) {
        var arrayOfKeys = Object.keys(inside);
        if (arrayOfKeys.length != 1) {
            return false;
        }
        var comp = arrayOfKeys[0];
        var attribute = inside[comp];
        var index = this.arrayOfComputation.indexOf(comp);
        if (index >= 0) {
            var datasetinfo = new DatasetInfo_1.default(this.id);
            if (index < 4) {
                return datasetinfo.getNumericAttributes().indexOf(attribute) >= 0;
            }
            else {
                return datasetinfo.getAllAttributes().indexOf(attribute) >= 0;
            }
        }
        return false;
    };
    Apply.ComputeMax = function (array, applytoken) {
        var number = -Infinity;
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var element = array_1[_i];
            if (element[applytoken] > number) {
                number = element[applytoken];
            }
        }
        return number;
    };
    Apply.ComputeMin = function (array, applytoken) {
        var number = Infinity;
        for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
            var element = array_2[_i];
            if (element[applytoken] < number) {
                number = element[applytoken];
            }
        }
        return number;
    };
    Apply.ComputeSum = function (array, applytoken) {
        var sumarray = [];
        for (var _i = 0, array_3 = array; _i < array_3.length; _i++) {
            var a = array_3[_i];
            sumarray.push(a[applytoken]);
        }
        var sum = Number(sumarray.map(function (val) { return new Decimal(val); }).reduce(function (a, b) {
            return a.plus(b);
        }).toNumber().toFixed(2));
        return sum;
    };
    Apply.ComputeCount = function (array, applytoken) {
        var count = [];
        for (var _i = 0, array_4 = array; _i < array_4.length; _i++) {
            var a = array_4[_i];
            if (count.indexOf(a[applytoken]) === -1) {
                count.push(a[applytoken]);
            }
        }
        return count.length;
    };
    Apply.ComputeAvg = function (array, applytoken) {
        var avgarray = [];
        for (var _i = 0, array_5 = array; _i < array_5.length; _i++) {
            var a = array_5[_i];
            avgarray.push(a[applytoken]);
        }
        var avg = Number((avgarray.map(function (val) { return new Decimal(val); }).reduce(function (a, b) {
            return a.plus(b);
        }).toNumber() / array.length).toFixed(2));
        return avg;
    };
    return Apply;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Apply;
//# sourceMappingURL=Apply.js.map