import DatasetInfo from "../DatasetInfo/DatasetInfo";
import {Transformations} from "../syntax/Transformations";

export default class Column {
    private query: any;
    private id: string;
    private datasetInfo: DatasetInfo;

    constructor(query: any, id: string) {
        this.query = query;
        this.id = id;
        this.datasetInfo = new DatasetInfo(this.id);
    }


    getInfoWithoutTrans(arrayOfObject: Array<any>): Array<any> {
        let arrayAfterColumn = [];
        for(let object of arrayOfObject) {
            let obj:any = {};
            for(let key of this.getArrayOfKey()) {
                obj[key] = object[key];
            }
            arrayAfterColumn.push(obj);
        }
        return arrayAfterColumn;
    }

    getInfoOfGroupWithTrans(objectAfterTransformation: any, trans: Transformations): Array<any> {
        let arrayOfGroups: Array<any> = [];
        for (let keyOfgroup in objectAfterTransformation) {
            let groupObject:any = {};
            for(let key of this.getArrayOfKey()){
                if(trans.groupKeysContains(key)) {
                    let attribute = objectAfterTransformation[keyOfgroup]["array"][0][key];
                    groupObject[key] = attribute;
                }
                if(trans.applyKeysContains(key)) {
                    groupObject[key] = objectAfterTransformation[keyOfgroup][key];
                }

            }
            arrayOfGroups.push(groupObject);

        }
        return arrayOfGroups;
    }



    isValidWhenTransExist(tran: Transformations): boolean {
        if(this.query == null || !(this.query  instanceof Array) || this.query.length < tran.getApplyKeys().length) {
            return false;
        }


        // Column is able to have key that is in column

        // for(let applyKey of tran.getApplyKeys()){
        //     if(!this.contains(applyKey)) {
        //         return false;
        //     }
        // }

        for(let attri of this.query) {
            if(!tran.applyKeysContains(attri) && !tran.groupKeysContains(attri)) {
                return false;
            }
        }
        return true;
    }

    isValidWhenTransNotExist(): boolean {
        if(this.query == null || !(this.query  instanceof Array)) {
            return false;
        }
        for(let attri of this.query) {
            if(!this.datasetInfo.allAttributesContains(attri)) {
                return false;
            }
        }
        return true;
    }

    getArrayOfKey(): Array<string> {
        return this.query;
    }


    contains(key: string): boolean {
        return this.query.indexOf(key) >= 0;
    }






}