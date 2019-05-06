import Log from "../Util";

export default class DatasetInfo {
    private attributes: Array<string>;
    private numericAttri: Array<string>;
    private stringAttri: Array<string>;

    constructor(id: string) {
        this.addInfo(id);
    }

    getAllAttributes(): Array<string> {
        return this.attributes;
    }

    getNumericAttributes(): Array<string> {
        return this.numericAttri;
    }

    getStringAttributes(): Array<string> { return this.stringAttri;}

    allAttributesContains(att: string): boolean {
        return this.attributes.indexOf(att) >= 0;
    }







    // Constructor helper method

    private addInfo(id: string): void {
        switch (id) {
            case "rooms":
                this.addInfoForRooms();
                break;

            case "courses":
                this.addInfoForCourses();
                break;

            default: Log.trace("Invalid id");

        }
    }

    // Attributes
    private addInfoForRooms(): void {
        this.attributes = ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
            "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"];
        this.numericAttri = ["rooms_lat", "rooms_lon", "rooms_seats"];
        this.stringAttri = ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address",
            "rooms_type", "rooms_furniture", "rooms_href"];
    }

    private addInfoForCourses(): void {
        this.attributes = ["courses_dept", "courses_id", "courses_instructor", "courses_avg", "courses_title",
            "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year"];
        this.numericAttri = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year"];
        this.stringAttri = ["courses_dept", "courses_id", "courses_instructor", "courses_title", "courses_uuid"];
    }
}