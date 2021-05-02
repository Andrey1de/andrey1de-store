import { threadId } from "node:worker_threads";
import { EAction } from "../common/e-actions";
import { StoreDto } from "../dtos/store.dto";
import { SqlHolder } from "./sql-holder";

///INFO Generates necessaruy for EAction sql
class SqlFactoryClass {
    GenerateSql(action: EAction,table:string, row : StoreDto, where:string = undefined)
        : string {
        let sql: string = '';
        switch (action) {
            case EAction.GetRow:
                ;
                sql = SqlHolder.SqlGetRow(table, row);
                break;
            case EAction.UpsertRow:
                if (!row) throw "Row data sql demands row.row parameter";
                sql = SqlHolder.SqlUpsertRow(table, row);
                break;
            case EAction.UpdateRow:
                if (!row) throw "Row data sql demands row.row parameter";
                sql = SqlHolder.SqlUpdateRow(table, row);
                break;
            case EAction.DeleteRow:
                if (!row) throw "Row data sql demands row.row parameter";
                sql = SqlHolder.SqlDeleteRow(table, row);
                break;
            case EAction.List:
                sql = SqlHolder.SqlList(table, where);
                break;
            case EAction.Delete:
                sql = SqlHolder.SqlDelete(table,where);
                break;
            default:
                throw "Unsupported type: " + EAction[action];

        }
        return sql;

    }
}
 // Here you may to create anonther  singletone wit another base
export const SqlFactory: SqlFactoryClass = new SqlFactoryClass();