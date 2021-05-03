import { PoolClient, QueryResult } from "pg";
import { GetMapSore, MapStore } from "../common/mapStore";
import { StoreDto } from "../dtos/store.dto";
import { Env } from "../env/env.controller";
import * as S from '../common/http-status';
import { SqlFactory } from './sql-factory';
import { EAction } from "../common/e-actions";
import { AsyncAction } from "../Dal/async-action";




export class SqlAction extends AsyncAction<SqlAction> {
	//readonly dbTablele: string;
	readonly IsUpsert: boolean = true;
	readonly IsDelete: boolean = true;
	readonly IsOneRow: boolean = true;
	readonly IsDB: boolean;
	readonly Sql: string;
	readonly oldRow: StoreDto = undefined;
	readonly kind: string;
	readonly key: string;
    private _StrStatus: string;
	public  LogStatus() {
		let strStatus = `${EAction[this.eAction]}::${S.StrStatus(this.Status)}`;
		let strKey = (this.key) ? `/${this.key}` : '';
		strStatus += `::[${this.table}/${this.kind}${strKey}]`;
		if (!this.Error)
			return `${strStatus}::RowCount=${this.Data.length}`;
		else {
			return `${strStatus}::Error=${this.Error}`;

		}
	};
	
	


	constructor(public readonly eAction: EAction,
		table: string,
		public readonly row: StoreDto,
		public readonly where: string = undefined
	) {
		super(table);
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
		if (!this.row) {
			throw new Error('CreateAction Undefined row instance');
		}
		if (!this.row.kind) {
			throw new Error('CreateAction Undefined  row.kind');
		}
		if (!this.IsOneRow && !this.row.key) {
			throw new Error('CreateAction Undefined  row.key');
		}
	}
	//IMPORTANT !!! Every SQL returnsrow: S processed rows in via suffix RETURNING* 
	//in sql , so inserted updated orwhere: deleted row have been modified
	// in MapStore!!!!
	async Do(): Promise<SqlAction> {//F ex S.OK , S,CREAStoreDtoED
		if (!this.Store.IsDB) {
			this.Status = S.PRECONDITION_FAILED;


			this.Error = new Error(this.Store.Qname + ` isn't supports DB`);

			return this;
		}
		const sql = this.Sql;
		try {
			const client = await this.getClient();
			const result: QueryResult<StoreDto>
				= await client.query<StoreDto>(sql);
			//StoreDtoo release , this function safe
			result.rows = result.rows || [];
			this._data = [...result.rows];
			this.safeRelease();

			if (result.rows.length > 0) {
				this.Status = S.OK;
				if (this.IsUpsert) {
					this.Status = (this._data[0].status == 0) ?
						S.CREATED : S.OK;
				}

			} else {
				this._data = [];
				this.Status = S.NOT_FOUND;
				if (this.IsUpsert) {
					this.Status = S.OK;
				}
			}
			this.synchronizeMapStore();

		} catch (e) {
			this.Error = e;
			this.Status = S.CONFLICT;

		} finally {
			this.safeRelease();
			this.setDone(this);//!!!!! = true;
		}
		return this;

	}



	synchronizeMapStore() {
		//On retrieve List returded all Kind records updatad
		if (this.eAction == EAction.DeleteRow) {
			const old = this.Store.removeItem(this.kind, this.key)
			this._data = (old) ? [old] : [];
			
		}
		//Returns old values
		else if (this.eAction == EAction.Delete) {
			let oldArr:StoreDto[] = [];
			for (var item of (this._data || [])) {
				let old = this.Store.removeItem(item.kind, item.key);
				if (old) {
					oldArr.push(old);
				}
			}
			this._data = oldArr;
;
		}
		else if (this.eAction == EAction.List) {
			for (var item of (this._data ||[])) {
				this.Store.setItem(item.kind,item.key,item);
			}
			const map = this.Store.get(this.kind);

			this._data = [...map.values()];
			
		}

		else //Upsert, UpsertRow Update = Returns new Records 
		{
			this.Store.setRange(this.kind, this.Data);
			const map = this.Store.get(this.kind);
			this._data = [...map.values()];
			
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
