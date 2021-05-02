import { PoolClient, QueryResult } from "pg";
import { GetMapSore, MapStore } from "../common/mapStore";
import { StoreDto } from "../dtos/store.dto";
import { Env } from "../env/env.controller";
import * as S from '../common/http-status';
import { SqlFactory } from './sql-factory';
import { EAction } from "../common/e-actions";
import { AsyncAction } from "../Dal/async-action";



const TO_LOG_RESULT = true;
const TO_LOG_SQL = true;


export class SqlAction extends AsyncAction<SqlAction> {
	//readonly dbTablele: string;
	readonly Store: MapStore;
	readonly IsUpsert: boolean = true;
	readonly IsDelete: boolean = true;
	readonly IsOneRow: boolean = true;
	readonly IsDB: boolean;
	readonly Sql: string;
	readonly oldRow: StoreDto = undefined;
	readonly kind: string;
	readonly key: string;

	constructor(readonly eAction: EAction,
		readonly table: string,
		readonly row: StoreDto,
		readonly where: string = undefined
	) {
		super();
		this.Store = GetMapSore(this.table);
		this.IsDB = this.Store.IsDB;

		this.IsOneRow = !(this.eAction == EAction.Delete ||
						this.eAction == EAction.List ||
						this.eAction == EAction.Upsert);
		this.IsUpsert = (this.eAction == EAction.UpdateRow ||
						this.eAction == EAction.UpsertRow ||
						this.eAction == EAction.GetRow);
		this.IsDelete = (this.eAction == EAction.Delete ||
						this.eAction == EAction.DeleteRow);
		this.validateAction();
		this.kind = row.kind;
		this.key =  row?.key || 'undefined';
		this.Sql = SqlFactory.GenerateSql(this.eAction,table,this.row,this.where);

			//TBD  may be test oldRow in actions ???? compare ?
		if (this.eAction == EAction.UpdateRow ||
			this.eAction == EAction.UpsertRow ||
			this.eAction == EAction.DeleteRow) {
			this.oldRow =  this.Store.getItem(this.row.kind, this.row.key) ;
		}
	}
	protected validateAction() {
		if (this.row) {
			throw new Error('CreateAction Undefined row instance');
		}
		if (!this.row.kind) {
			throw new Error('CreateAction Undefined  row.kind');
		}
		if (!this.IsOneRow && !this.row.key) {
			throw new Error('CreateAction Undefined  row.key');
		}
	}
	//public async DoAnotherTask(eAction: EAction): Promise<Array<StoreDto>> {
	//	const action = new SqlAction(eAction, this.table, this.row, this.where);
	//	const ret = action.Do();
	//	return ret;
	
	//}								 
	//IMPORTANT !!! Every SQL returnsrow: S processed rows in via suffix RETURNING* 
	//in sql , so inserted updated orwhere: deleted row have been modified
	// in MapStore!!!!
	async Do(): Promise<SqlAction> {//F ex S.OK , S,CREAStoreDtoED
		if (!this.Store.IsDB) {
			this.Status = S.CONFLICT;
			this.StrStatus = this.Store.Qname + ` isn't supports DB`;
			return this;
		}
		const sql = this.Sql;
		try {
			const client = await this.getClient();
			const result: QueryResult<StoreDto>
				= await client.query<StoreDto>(sql);
			//StoreDtoo release , this function safe
			this.safeRelease();

			if (result.rows.length > 0) {
				this._data = [...result.rows];
				this.synchronizeMapStore();
				this.OnRows();
					
			} else {
				this._data = [];
				this.OnNoRows();
			}
	
		} catch (e) {
			this.Error = e;
			this.OnErrorSql(e);

		} finally {
			this.safeRelease();
			this._done = true;
		}
		return this;

	}



	OnRows() {
		this.Status = S.OK;
		this.StrStatus = 'OK::' + EAction[this.eAction]  ;
		if (this.IsUpsert && this._data[0].status == 0) {
			this.Status = S.CREATED;
			this.StrStatus = 'CREATED::' + EAction[this.eAction];
		}
		if (TO_LOG_RESULT) {
			this.LogRows();
		}


	}
	OnNoRows() {
		this.Status = S.NOT_FOUND;
		this.StrStatus = 'NOT_FOUND::' + EAction[this.eAction];
		if (TO_LOG_RESULT) {
			this.LogRows();
		}
	}
	OnErrorSql(e: any) {
		if (TO_LOG_RESULT) {
			this.StrStatus = 'ERROR::' + EAction[this.eAction];

			console.log(`${this.StrStatus}::${e}`);
		}
		// throw new Error('Method not implemented.');
	}

	protected LogRows() {
	
			//let rowStr: string = '';
			let strSql = (TO_LOG_SQL) ? `\n${this.Sql}` : '';
			if (this.IsOneRow) {
				console.log(`${this.StrStatus}::${EAction[this.eAction]}>>row[${this._data[0].toString(false)}]${strSql} `);

			} else {
				console.log(`${this.StrStatus}::${EAction[this.eAction]}${strSql} `);
				console.table(this._data);

			}
	
	}
	synchronizeMapStore() {
		if (this._data && this._data.length > 0) {
			this._data.forEach(row => {
				if (this.IsUpsert) {
					this.Store.setItem(row.kind, row.key, row);
				} else if (this.IsDelete) {
					this.Store.removeItem(row.kind, row.key);

				}
			});
		}
		
	}

 

	protected Client: PoolClient = undefined;

	protected async getClient(): Promise<PoolClient> {
		return this.Client = this.Client || await Env.Pool.connect();
	}
	protected async safeRelease() {
		this.Client?.release();
		this.Client = undefined;
	}
	
	



}
