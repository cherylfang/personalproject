import Column from "./Column";
import Order from "./Order";
import {Transformations} from "../syntax/Transformations";


export default class Option {
    private query: any;
    private id: string;
    private column: Column;
    private order: Order;

    constructor(query: any, id: string) {
        this.query = query;
        this.id = id;
        this.column = new Column(query["OPTIONS"]["COLUMNS"], this.id);
        this.order = new Order(query["OPTIONS"]["ORDER"], this.id);
    }

    getInfoFromGroup(objectAfterTransformation:any, trans: Transformations): Array<any> {
        return this.column.getInfoOfGroupWithTrans(objectAfterTransformation,trans);
    }

    getInfoWithoutTrans(obj:any): Array<any> {
        return this.column.getInfoWithoutTrans(obj);
    }

    isValid() {
        let columnValid:boolean = false;
        let orderValid: boolean = true;
        let transQuery = this.query["TRANSFORMATIONS"];
        let orderQuery = this.query["OPTIONS"]["ORDER"];
        if(transQuery) {
            columnValid = this.column.isValidWhenTransExist(new Transformations(transQuery,this.id));
        }else {
            columnValid = this.column.isValidWhenTransNotExist();
        }
        if(orderQuery) {
            orderValid = this.order.isValid(this.column);
        }

        return columnValid && orderValid;
    }


    sort(object: any):any {
        return this.order.handleorder(object);
    }

    isOrderExist() {
        return !(this.order.isEmpty());
    }

}