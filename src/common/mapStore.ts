 //TBD: string => object
// Pseudo singleton
import { type } from 'node:os';
import { remove, stream } from 'winston';
import { StoreDto } from '../dtos/store.dto';


///if store to = 0 -> not persistant, -1 - store infinite, else how many seconds

export class MapStore extends Map < string, Map < string, StoreDto >>
{
	public readonly IsDB: boolean;
	constructor(public readonly Qname: string,
	public store_ms: number = 0) {
		super();
		this.IsDB = this.store_ms != 0 && this.Qname != 'memory';

	}


	hasItem(kind: string, key: string): boolean {
		return this.get(kind)?.has(key);
	}
	getItem(kind: string, key: string): StoreDto {
		return this.get(kind)?.get(key);
	}
	getType(kind: string): Array<StoreDto> {
		return this.has(kind) ? [...this.get(kind).values()] : undefined;
	}

	//returns 1 if created , 0 if set , -1 if deleted
	//Retuens Old vlalues if was
	setItem(kind: string, key: string, item: StoreDto): StoreDto {
		if (!item) {
			return this.removeItem(kind, key);

		} 

		const t = this.getT(kind, true);
		const old = t.get(key);
		t.set(key,item);
		return old;
	}
	 //Returns old deleted items
	removeItem(kind: string, key: string): StoreDto {
		let typeMap = this.getT(kind, false);
		let old = undefined;
		if (typeMap) {
			old = typeMap.get(key);
			if (old) {
				typeMap.delete(key);
			}
			if (typeMap.size <= 0) {
				this.delete(kind);
			}
		}
		return old;

	}
	 //Returns array of old item that exists
	setRange(kind: string, item: StoreDto[]) {
		if (!item || item.length > 0) return[];
		let typeMap = this.getT(kind, true);
		let arr: StoreDto[] = [];
		item.forEach(
			item => {
				const old = typeMap.get(item.key);
				if (!old) {
					arr.push(old);
				}
				typeMap.set(item.key, item);
	   		}
		);

		return arr;
	}
	removeRange(kind: string, item: StoreDto[]): StoreDto[] {
		let arr: StoreDto[] = [];
		if (!item || item.length > 0) return arr;
		let typeMap = this.getT(kind, false);
		if (!typeMap) return arr;
		item.forEach(
			item => {
				let old = typeMap.get(item.key);
				if (old) {
					typeMap.delete(item.key);
					arr.push(old);

				}
				if (typeMap.size <= 0) {
					this.delete(kind)
				}
			}
		);
		
		return arr;
	}
	
	protected getT(kind: string, toCreate ): Map<string, StoreDto>{
		let ret: Map<string, StoreDto> = this.get(kind);
		if (!ret && toCreate) {
			ret = new Map<string, StoreDto>();
			this.set(kind, ret);
		}
		return ret;
	}

}

const MapsGlobal: Map<string, MapStore> = (() => {
	let ret = new Map<string, MapStore>();
	ret.set("store", new MapStore("store", 3600 * 24));
	ret.set("users", new MapStore("users", -1));
	ret.set("actions", new MapStore("actions", 3600 * 1000));
	ret.set("memory", new MapStore("memory", 0));

	return ret;
})();


export function GetMapSore(table: string): MapStore {
	return MapsGlobal.get(table)
		|| MapsGlobal.get('memory');
}


