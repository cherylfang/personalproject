import Column from "./Column";

export default class Order {
    private query: any;
    private id: string;

    constructor(query: any, id: string) {
        this.query = query;
        this.id = id;
    }

    isValid(column: Column) {
        if(this.isEmpty()) {
            return true;
        }
        return this.isValidWithDir(column) || this.isValidWithoutDir(column);
    }

    isEmpty() {
        return this.query == null;
    }

    private isValidWithoutDir(column: Column) {
        return column.contains(this.query);
    }

    private isValidWithDir(column: Column) {
        if (this.query === Object(this.query) && Object.keys(this.query).length === 2 &&
            Object.keys(this.query).indexOf("dir") > -1 && Object.keys(this.query).indexOf("keys") > -1) {
            if ((this.query["dir"] === "DOWN" || this.query["dir"] === "UP") && this.query["keys"] instanceof Array) {
                for(let attri of this.query["keys"]) {
                    if(!(column.contains(attri))) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    handleorder(ArrayofObject:any):Array<any>{
        if(typeof this.query === 'string'){
            return this.sortstringResult(ArrayofObject,this.query);
        } else if(typeof this.query === 'object'){
            let direction = this.query['dir'];
            let keysarray = [];
            keysarray = this.query['keys'];
            if(direction === 'UP'){
                return this.sortupResult(ArrayofObject,keysarray);
            }else if (direction === 'DOWN'){
                return this.sortdownResult(ArrayofObject,keysarray);
            }
        }
    }

    private sortstringResult(Array: any, order:any):Array<Object>{
        return Array.sort(function(element1:any,element2:any){
                if(element1[order] < element2[order]){
                return -1;
                }
                if(element1[order] > element2 [order]){
                return 1;
                }
                return 0;
           })

    }
    private sortupResult(Array: any, order:any):Array<Object>{
        return Array.sort(function(element1:any,element2:any){
                var i=0;
                while(i < order.length){
                    if(element1[order[i]] < element2[order[i]]){
                        return -1;
                    }
                    if(element1[order[i]] > element2 [order[i]]){
                        return 1;
                    }

                        i ++;
                }
                return 0;

            }
        )
    }
    private sortdownResult(Array: any, order:any):Array<Object>{
        return Array.sort(function(element1:any,element2:any){
                var i=0;
                while(i < order.length){
                    if(element1[order[i]] < element2[order[i]]){
                        return 1;
                    }
                    if(element1[order[i]] > element2 [order[i]]){
                        return -1;
                    }

                        i ++;
                }
                return 0;

            }
        )
    }

}