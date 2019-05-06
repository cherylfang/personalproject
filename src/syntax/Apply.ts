import DatasetInfo from "../DatasetInfo/DatasetInfo";
let Decimal = require('decimal.js');

export default class Apply {

    // Fields
    private query: any;
    private id: string;
    private arrayOfComputation: Array<string>;

    constructor(query: any, id: string) {
        this.query = query;
        this.id = id;
        this.arrayOfComputation = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
    }

    isValid(): boolean {
        if(this.query == null || !(this.query instanceof Array) || this.hasDuplicatedElement(this.getApplyKeys())){// check if apply define same key twice.
            return false;
        }

        for(let applyObject of this.query) {
            if(!this.isApplyObjectValid(applyObject)){
                return false;
            }
        }

        return true;
    }

    getApplyKeys(): Array<any> {
        let arrayOfNewKeys = [];
        for(let cur of this.query) {
            let newKey = Object.keys(cur)[0];
            arrayOfNewKeys.push(newKey);
        }
        return arrayOfNewKeys;
    }

    getComputationKeys(): Array<any> {
        let arrayOfCompKeys = [];
        for(let cur of this.query) {
            let newKey = Object.keys(cur)[0];
            let compKey = Object.keys(cur[newKey])[0];

            arrayOfCompKeys.push(compKey);
        }
        return arrayOfCompKeys;
    }

    private hasDuplicatedElement(arr: Array<any>): boolean {
        let temp = Object.create(null);
        for (let cur of arr) {
            if(cur in temp) {
                return true;
            }
            temp[cur] = 'haha';
        }
        return false;

    }

    private isApplyObjectValid(applyObject: any):boolean {
        if(Object.keys(applyObject).length != 1) {
            return false;
        }

        if(Object.keys(applyObject)[0].indexOf('_') >= 0 ) {
            return false;
        }

        let inside = applyObject[Object.keys(applyObject)[0]];

        return this.isInsideValid(inside);
    }

    private isInsideValid(inside: any):boolean {
        let arrayOfKeys = Object.keys(inside);
        if(arrayOfKeys.length != 1) {
            return false;
        }

        let comp = arrayOfKeys[0];
        let attribute = inside[comp];
        let index = this.arrayOfComputation.indexOf(comp);
        if(index >= 0) {
            // check if attribute is numeric or for count both types of attributes are okay.

            let datasetinfo: DatasetInfo = new DatasetInfo(this.id);
            // index < 4 means that attributes should be numeric.
            if(index < 4) {
                return datasetinfo.getNumericAttributes().indexOf(attribute) >=0;
            }else {
                return datasetinfo.getAllAttributes().indexOf(attribute) >=0;
            }

        }

        return false;
    }

    static ComputeMax(array: Array<any>,applytoken: string):number{
        let number = -Infinity;
        for(let element of array){
            if(element[applytoken] > number){
                number = element[applytoken];
            }
        }
        return number;
    }
    static ComputeMin(array: Array<any>,applytoken:string):number{
        let number = Infinity;
        for(let element of array){
            if(element[applytoken] < number){
                number = element[applytoken];
            }
        }
        return number;
    }
    static ComputeSum(array: Array<any>,applytoken:string):number{
        let sumarray : Array<any> = [];
        for (let a of array){
            sumarray.push(a[applytoken]);
        }
        let sum = Number(sumarray.map(val => new Decimal(val)).reduce((a,b) =>
            a.plus(b)).toNumber().toFixed(2));
        return sum;

    }

    static ComputeCount (array : Array<any>,applytoken:string):number {
        let count :Array<any> = [];
        for (let a of array){
            if(count.indexOf(a[applytoken]) === -1){
                count.push(a[applytoken]);
            }
        }
        return count.length;
    }

    static ComputeAvg(array : Array<any>,applytoken:string):number{
        let avgarray : Array<any> = [];
        for (let a of array){
            avgarray.push(a[applytoken]);
        }
        let avg: number = Number((avgarray.map(val => <any>new Decimal(val)).reduce((a,b) =>
            a.plus(b)).toNumber() / array.length).toFixed(2));
        return avg;
    }

}