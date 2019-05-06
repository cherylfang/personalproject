"use strict";
var Order = (function () {
    function Order(query, id) {
        this.query = query;
        this.id = id;
    }
    Order.prototype.isValid = function (column) {
        if (this.isEmpty()) {
            return true;
        }
        return this.isValidWithDir(column) || this.isValidWithoutDir(column);
    };
    Order.prototype.isEmpty = function () {
        return this.query == null;
    };
    Order.prototype.isValidWithoutDir = function (column) {
        return column.contains(this.query);
    };
    Order.prototype.isValidWithDir = function (column) {
        if (this.query === Object(this.query) && Object.keys(this.query).length === 2 &&
            Object.keys(this.query).indexOf("dir") > -1 && Object.keys(this.query).indexOf("keys") > -1) {
            if ((this.query["dir"] === "DOWN" || this.query["dir"] === "UP") && this.query["keys"] instanceof Array) {
                for (var _i = 0, _a = this.query["keys"]; _i < _a.length; _i++) {
                    var attri = _a[_i];
                    if (!(column.contains(attri))) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    };
    Order.prototype.handleorder = function (ArrayofObject) {
        if (typeof this.query === 'string') {
            return this.sortstringResult(ArrayofObject, this.query);
        }
        else if (typeof this.query === 'object') {
            var direction = this.query['dir'];
            var keysarray = [];
            keysarray = this.query['keys'];
            if (direction === 'UP') {
                return this.sortupResult(ArrayofObject, keysarray);
            }
            else if (direction === 'DOWN') {
                return this.sortdownResult(ArrayofObject, keysarray);
            }
        }
    };
    Order.prototype.sortstringResult = function (Array, order) {
        return Array.sort(function (element1, element2) {
            if (element1[order] < element2[order]) {
                return -1;
            }
            if (element1[order] > element2[order]) {
                return 1;
            }
            return 0;
        });
    };
    Order.prototype.sortupResult = function (Array, order) {
        return Array.sort(function (element1, element2) {
            var i = 0;
            while (i < order.length) {
                if (element1[order[i]] < element2[order[i]]) {
                    return -1;
                }
                if (element1[order[i]] > element2[order[i]]) {
                    return 1;
                }
                i++;
            }
            return 0;
        });
    };
    Order.prototype.sortdownResult = function (Array, order) {
        return Array.sort(function (element1, element2) {
            var i = 0;
            while (i < order.length) {
                if (element1[order[i]] < element2[order[i]]) {
                    return 1;
                }
                if (element1[order[i]] > element2[order[i]]) {
                    return -1;
                }
                i++;
            }
            return 0;
        });
    };
    return Order;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Order;
//# sourceMappingURL=Order.js.map