import DatasetInfo from "../DatasetInfo/DatasetInfo";

export default class Group {
    // Field

    private query: any;
    private id: string

    constructor(query: any, id: string) {
        this.query = query;
        this.id = id;
    }

    isValid(): boolean {
        if(this.query == null || !(this.query  instanceof Array) || this.query.length === 0) {
            return false;
        }

        let datasetInfo: DatasetInfo = new DatasetInfo(this.id);

        for(let feature of this.query) {
            if(datasetInfo.getAllAttributes().indexOf(feature) < 0) {
                return false;
            }
        }
        return true;
    }


    getGroupKeys(): Array<any> {
        return this.query;
    }
}