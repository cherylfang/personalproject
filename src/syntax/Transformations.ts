import Log from "../Util";
import Group from "./Group"
import Apply from "./Apply";


export class Transformations {

    private query: any;
    private id: string;
    private group: Group;
    private apply: Apply;

    constructor(query: any, id: string) {
        Log.trace('Transormation syntax node ::init()');
        this.query = query;
        this.id = id;
        var queryForGroup = null;
        var queryForApply = null;
        if(query != null) {
            queryForGroup = query["GROUP"];
            queryForApply = query["APPLY"];
        }
        this.group = new Group(queryForGroup,id);
        this.apply = new Apply(queryForApply,id);
    }

    isValid():boolean {
        if(this.query == null || Object.keys(this.query).length != 2) {
            return false;
        }
        return this.group.isValid() && this.apply.isValid();
    }


    getGroupKeys(): Array<string> {
        return this.group.getGroupKeys();
    }

    getApplyKeys(): Array<string> {
        return this.apply.getApplyKeys();
    }

    groupKeysContains(attribute: string): boolean {
        return  this.group.getGroupKeys().indexOf(attribute) >= 0;
    }

    applyKeysContains(attribute: string): boolean {
        return this.apply.getApplyKeys().indexOf(attribute) >= 0;
    }




    createGroup(result : Array <any>): any {
        let groups = this.query["GROUP"];
        let map:any = {};
        let groupobject : {[key:string]:any}= {};

        for(let element of result) {
            for (let keyOfGroup of groups) {
                groupobject[keyOfGroup] = element[keyOfGroup];
            }
            let nameOfGroup = JSON.stringify(groupobject);


            if (map[nameOfGroup]) {
                let oneGroup = map[nameOfGroup]["array"];
                oneGroup.push(element);
            } else {
                map[nameOfGroup] = {};
                map[nameOfGroup]["array"] = [];
                map[nameOfGroup]["array"].push(element);
            }
        }

        return map;
    }

    static readIndex(arrayOfIndex: Array<number>, dataset: Array<any>): Array<any> {
        let arrayOfObjects: Array<any> = [];

        for(let index of arrayOfIndex) {
            arrayOfObjects.push(dataset[index])
        }
        return arrayOfObjects;
    }

    handleapply(groupObject :any): any {

        for(let a in groupObject){
            let objectarray = groupObject[a];
            let array = groupObject[a]['array'];
            let temp = this.apply.getApplyKeys();
            for(let i = 0; i < this.apply.getApplyKeys().length; i++)
            {
                let key = this.apply.getApplyKeys()[i];
                let switchkey = this.apply.getComputationKeys()[i];
                let content = this.query["APPLY"][i][key][switchkey];

            switch(switchkey){
                case "MAX" :
                    objectarray[key] = Apply.ComputeMax(array,content);
                    break;
                case 'MIN' :
                    objectarray[key] = Apply.ComputeMin(array,content);
                    break;
                case 'AVG':
                    objectarray[key] = Apply.ComputeAvg(array,content);
                    break;
                case 'COUNT':
                    objectarray[key] = Apply.ComputeCount(array,content);
                    break;
                case 'SUM':
                    objectarray[key] = Apply.ComputeSum(array,content);
                    break;
            }
            }
        }
        return groupObject;
    }





    

}