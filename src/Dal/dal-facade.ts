import { remove } from "winston";
import { EAction } from "../common/e-actions";
import { MapStore , GetMapSore } from "../common/mapStore";
import { StoreDto } from "../dtos/store.dto";
import { SqlAction } from "../sql/sql-action";
import { SqlAcionFactory } from "./action-broker";
import { AsyncAction } from "./async-action";


class FacadeInternal {						
	
	
	constructor() {
	}


	getItem(table: string, kind: string, key: string): StoreDto {
		return GetMapSore(table).getItem(kind, key);

	}
	async retrieveType$(table: string, kind: string, where: string = undefined)
		: Promise<AsyncAction> {
		const foo : StoreDto = new StoreDto({  kind : kind,key : 'undefined'});
	
		let action = new SqlAction(EAction.List, table, foo, where);

		let asyncAction:AsyncAction = await action.Do();

		return asyncAction;
	}
	async retrieveItem$(table: string, kind: string, key: string): Promise<AsyncAction> {
		const foo: StoreDto = new StoreDto({ kind: kind, key: key });
		let action = new SqlAction(EAction.GetRow, table, foo, undefined);

		let asyncAction: AsyncAction = await action.Do();

		return asyncAction;
	}

	 deleteType(table: string, kind: string, where: string = undefined) : Array<StoreDto> {
		let store = GetMapSore(table);//.setItem(kind, key, that);
		const oldArray = store.delete(kind);
		if (store.IsDB) {
			const foo = new StoreDto({ kind: kind, key: 'undefined' });
			SqlAcionFactory.EnqueueSqlAction
				(EAction.Delete, table, foo);

		}
			
		return store.getType(kind);
	}
	getType(table: string, kind: string): Array<StoreDto> {
		return GetMapSore(table).getType(kind);
	}

	setItem(table: string, kind: string, key: string, item: StoreDto) : StoreDto {// Array<ItemStoreDto> {
		let store = GetMapSore(table);//.setItem(kind, key, that);
		let old = store.setItem(kind, key, item);
		if (!item) {
			return this.removeItem(table, kind, key);
		}

		if (store.IsDB) {
			if (!old) {
				SqlAcionFactory.EnqueueSqlAction
					(EAction.UpsertRow, table, item);
			} else {
				SqlAcionFactory.EnqueueSqlAction
					(EAction.UpsertRow, table, item);

			}
			

		}
		return old;
	}
	removeItem(table: string, kind: string, key: string): StoreDto {// Array<ItemStoreDto> {
		let store = GetMapSore(table);//.setItem(kind, key, that);
	
		let old = store.removeItem(kind, key) ;
		if (store.IsDB && old) {
			old = old || new StoreDto({ kind: kind, key: key });
			const task = new SqlAcionFactory.EnqueueSqlAction
				(EAction.DeleteRow, table, old);
		}
		return old ;

	}


}

export const Facade: FacadeInternal = new FacadeInternal();
 // the names according to physical  tables , like morror im memory

