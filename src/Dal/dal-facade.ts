import { MapStore , GetMapSore } from "../common/mapStore";
import { StoreDto } from "../dtos/store.dto";
import { SqlAction } from "../sql/sql-action";
import { SqlAcionFactory } from "./action-broker";
import { PackageSync } from "./package-sync";

class FacadeInternal {						
	
	
	constructor() {
	}


	getItem(table: string, kind: string, key: string): StoreDto {
		return GetMapSore(table).getItem(kind, key);

	}

	getKind(table: string, kind: string): StoreDto[] {
		const store = GetMapSore(table);
		const ret = store.getKind(kind);
		return ret

	}

	setItem(table: string, kind: string, item: StoreDto) {
		this.synchonize(table, kind, [item], true);

		return GetMapSore(table).getItem(kind,item.key);

	}
	setItems(table: string, kind: string, items: StoreDto[]) {
		this.synchonize(table, kind, items, true);

		return GetMapSore(table).getKind(kind);

	}
	//Returns item to be deleted
	removeItem(table: string, kind: string, key: string) {
		const item = new StoreDto({ kind: kind , key : key});
		this.synchonize(table, kind, [item], false);

		return GetMapSore(table).getKind(kind);

	}
	//Returns deleted items
	removeItems(table: string, kind: string, items: StoreDto[] | undefined) {
		const mapStore: MapStore = GetMapSore(table);
		items = items || mapStore.getKind(kind);
		this.synchonize(table, kind, items, false);

		return items;

	}
	synchronizeKind(table: string, kind: string): SqlAction {
		const action = SqlAcionFactory.SynchronizeKind(table, kind);

		return action;
	}
   		//TBD What with type to store and uodate that is here

	protected synchonize(table: string, kind: string,
						items: StoreDto[], toSet: boolean) {
		 const mapStore: MapStore = GetMapSore(table);

	     if (!items || items.length <= 0) return;
		 const sync: PackageSync = new PackageSync(table, kind);
	 
		 for (const item of items) {
			 if (toSet) {
				 const old = mapStore.setItem(kind, item.key, item);
				 if (old) {
					 sync.SetArr.push(item);
				 } else {
					 sync.NewArr.push(item);
				 }
			 } else {
				 const old = mapStore.removeItem(kind, item.key);
				 //if (old) {
					 sync.DelArr.push(item);
				 //}
			 }
			 SqlAcionFactory.AppendPackageSync(sync);
	
		 }


	 }


	
	// deleteType(table: string, kind: string, where: string = undefined) : Array<StoreDto> {
	//	let store = GetMapSore(table);//.setItem(kind, key, that);
	//	const oldArray = store.delete(kind);
	//	if (store.IsDB) {
	//		const foo = new StoreDto({ kind: kind, key: 'undefined' });
	//		SqlAcionFactory.EnqueueSqlAction
	//			(EAction.Delete, table, foo);

	//	}
			
	//	return store.getType(kind);
	//}
	
	//setItem(table: string, kind: string, key: string, item: StoreDto) : StoreDto {// Array<ItemStoreDto> {
	//	let store = GetMapSore(table);//.setItem(kind, key, that);
	//	let old = store.setItem(kind, key, item);
	//	if (!item) {
	//		return this.removeItem(table, kind, key);
	//	}

	//	if (store.IsDB) {
	//		if (!old) {
	//			SqlAcionFactory.EnqueueSqlAction
	//				(EAction.UpsertRow, table, item);
	//		} else {
	//			SqlAcionFactory.EnqueueSqlAction
	//				(EAction.UpsertRow, table, item);

	//		}
			

	//	}
	//	return old;
	//}
	//removeItem(table: string, kind: string, key: string): StoreDto {// Array<ItemStoreDto> {
	//	let store = GetMapSore(table);//.setItem(kind, key, that);
	
	//	let old = store.removeItem(kind, key) ;
	//	if (store.IsDB && old) {
	//		old = old || new StoreDto({ kind: kind, key: key });
	//		const task = new SqlAcionFactory.EnqueueSqlAction
	//			(EAction.DeleteRow, table, old);
	//	}
	//	return old ;

	//}


}

export const Facade: FacadeInternal = new FacadeInternal();

 // the names according to physical  tables , like morror im memory

