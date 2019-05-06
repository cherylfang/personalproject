"use strict";
var Column_1 = require("./Column");
var Order_1 = require("./Order");
var Transformations_1 = require("../syntax/Transformations");
var Option = (function () {
    function Option(query, id) {
        this.query = query;
        this.id = id;
        this.column = new Column_1.default(query["OPTIONS"]["COLUMNS"], this.id);
        this.order = new Order_1.default(query["OPTIONS"]["ORDER"], this.id);
    }
    Option.prototype.getInfoFromGroup = function (objectAfterTransformation, trans) {
        return this.column.getInfoOfGroupWithTrans(objectAfterTransformation, trans);
    };
    Option.prototype.getInfoWithoutTrans = function (obj) {
        return this.column.getInfoWithoutTrans(obj);
    };
    Option.prototype.isValid = function () {
        var columnValid = false;
        var orderValid = true;
        var transQuery = this.query["TRANSFORMATIONS"];
        var orderQuery = this.query["OPTIONS"]["ORDER"];
        if (transQuery) {
            columnValid = this.column.isValidWhenTransExist(new Transformations_1.Transformations(transQuery, this.id));
        }
        else {
            columnValid = this.column.isValidWhenTransNotExist();
        }
        if (orderQuery) {
            orderValid = this.order.isValid(this.column);
        }
        return columnValid && orderValid;
    };
    Option.prototype.sort = function (object) {
        return this.order.handleorder(object);
    };
    Option.prototype.isOrderExist = function () {
        return !(this.order.isEmpty());
    };
    return Option;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Option;
//# sourceMappingURL=Option.js.map