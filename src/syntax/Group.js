"use strict";
var DatasetInfo_1 = require("../DatasetInfo/DatasetInfo");
var Group = (function () {
    function Group(query, id) {
        this.query = query;
        this.id = id;
    }
    Group.prototype.isValid = function () {
        if (this.query == null || !(this.query instanceof Array) || this.query.length === 0) {
            return false;
        }
        var datasetInfo = new DatasetInfo_1.default(this.id);
        for (var _i = 0, _a = this.query; _i < _a.length; _i++) {
            var feature = _a[_i];
            if (datasetInfo.getAllAttributes().indexOf(feature) < 0) {
                return false;
            }
        }
        return true;
    };
    Group.prototype.getGroupKeys = function () {
        return this.query;
    };
    return Group;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Group;
//# sourceMappingURL=Group.js.map