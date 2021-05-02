import { StoreDto } from "../dtos/store.dto";
import { Env } from "../env/env.controller";

const DB_SCHEMA = Env.DB_SCHEMA;

class SqlHolderClass {

    constructor() {

    }
 
    /// Row Array Functions
    /// Row Functions
    SqlGetRow(table: string, row: StoreDto): string {
        let sql =

`SELECT * FROM ${DB_SCHEMA}.${table}
WHERE kind='${row.kind}' AND key='${row.key};' ;`

        return sql;

    }
    SqlUpsertRow(table: string, row: StoreDto): string {
        const store_to = (row.store_to) ?
            `'${row.store_to}'` : "DEFAILT";
        const jdata = JSON.stringify(row.jdata || '{}');
        const sql =

`INSERT INTO ${DB_SCHEMA}.${table}
	(kind, key, store_to, jdata)
	VALUES ( '${row.kind}', '${row.key}', ${store_to},'${jdata}')
ON CONFLICT(kind, key) DO UPDATE SET
	jdata = EXCLUDED.jdata,
	stored = now(),
	store_to = EXCLUDED.store_to,
	status = 1,
RETURNING *;`

        return sql;
    }
    SqlUpdateRow(table: string, row: StoreDto): string {
        const store_to = (row.store_to) ?
            `'${row.store_to}'` : "DEFAILT";
        const jdata = JSON.stringify(row.jdata || '{}');
        const sql =

`UPDATE ${DB_SCHEMA}.${table}
SET stored=now(),
    store_to=${store_to},
    jdata=${jdata}
WHERE kind='${row.kind}' AND key='${row.key} ' 
RETURNING * ;`

        return sql;

    }
    SqlDeleteRow(table: string, row: StoreDto): string {
        let sql =

`DELETE FROM ${DB_SCHEMA}.${table}
WHERE kind='${row.kind}' AND key='${row.key} ' 
RETURNING * ;`

        return sql;

    }
    SqlList(table: string, where: string = undefined): string {
        where = (where) ? 'WHERE ' + where : '';
        const sql = `SELECT * FROM ${DB_SCHEMA}.${table} ${where};`
        return sql;
    }
    SqlDelete(table: string, where: string = undefined): string {
        where = (where) ? 'WHERE ' + where : '';
        let sql = `DELETE FROM ${DB_SCHEMA}.${table} ${where} RETURNING *;`
        return sql;
    }

}

export const SqlHolder: SqlHolderClass = new SqlHolderClass();
