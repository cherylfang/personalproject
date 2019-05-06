"use strict";
var Util_1 = require("../Util");
var DatasetInfo = (function () {
    function DatasetInfo(id) {
        this.addInfo(id);
    }
    DatasetInfo.prototype.getAllAttributes = function () {
        return this.attributes;
    };
    DatasetInfo.prototype.getNumericAttributes = function () {
        return this.numericAttri;
    };
    DatasetInfo.prototype.getStringAttributes = function () { return this.stringAttri; };
    DatasetInfo.prototype.allAttributesContains = function (att) {
        return this.attributes.indexOf(att) >= 0;
    };
    DatasetInfo.prototype.addInfo = function (id) {
        switch (id) {
            case "rooms":
                this.addInfoForRooms();
                break;
            case "courses":
                this.addInfoForCourses();
                break;
            default: Util_1.default.trace("Invalid id");
        }
    };
    DatasetInfo.prototype.addInfoForRooms = function () {
        this.attributes = ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
            "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"];
        this.numericAttri = ["rooms_lat", "rooms_lon", "rooms_seats"];
        this.stringAttri = ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
            "rooms_type", "rooms_furniture", "rooms_href"];
    };
    DatasetInfo.prototype.addInfoForCourses = function () {
        this.attributes = ["courses_dept", "courses_id", "courses_instructor", "courses_avg", "courses_title",
            "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year"];
        this.numericAttri = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year"];
        this.stringAttri = ["courses_dept", "courses_id", "courses_instructor", "courses_title", "courses_uuid"];
    };
    return DatasetInfo;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DatasetInfo;
//# sourceMappingURL=DatasetInfo.js.map