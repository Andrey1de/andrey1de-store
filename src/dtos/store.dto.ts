
//export const ITEM_STORE_TABLE_NAME =  Env.DB_SCHEMA + '.' + 'item_store'



export class StoreDto {// implements IDto{
    //id: number = 0;// integer NOT NULL DEFAULT nextval('item_store_id_seq'::regclass),
    kind: string;// text COLLATE pg_catalog."memory" NOT NULL,
    key: string;//text COLLATE pg_catalog."memory" NOT NULL,
    stored : Date | undefined = new Date();//timestamp(3) with time zone NOT NULL,
    store_to: Date | undefined;
    jdata: any;///text COLLATE pg_catalog."memory"
    status: number = 0;
    
    constructor(that: any | undefined ) {
        this.fromAny(that);

    }

    fromAny(that: any) {
        if (that) {
            this.kind = that.kind;
            this.key = that.key;
            if (that.stored) this.stored = that.stored;//| undefined;//timestamp(3) with time zone NOT NULL,
            if (that.store_to) this.store_to = that.store_to;
            this.jdata = that?.jdata || {};
            if (that.status) this.status = that.status;

		}
    }
    compare(that: StoreDto): boolean {
        let ret: boolean = this.kind == that.kind
            && this.key == that.key
            && this.stored == that.stored
            && this.store_to == that.store_to
            && this.jdata == that.jdata;
        return ret;

    }


    //get HashCode(): string {
    //    let hash = uuid(this.kind + '||' + this.key, '', 5);
    //    return hash;
    //};

   
    toString(toTabJson : boolean = false) {
        const json = (!toTabJson) ? JSON.stringify(this.jdata || {})
            : '\n' + JSON.stringify(this.jdata || {}, null, 2);
        return `StoreDto:[${this.kind}/${this.key}] => ${json};`
	}
 
};

