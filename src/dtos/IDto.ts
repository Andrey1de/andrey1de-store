import { Assign2 } from '../common/map.utils'
export interface IDto {
	
	kind: string;
	key: string;
	stored: Date | undefined;
	store_to: Date | undefined;
	jdata: string;
	status: number;
//	getTable(): string;
	fromAny(that: any);

	//SqlList(tableDB:string, where: string): string;
	//SqlDelete(tableDB: string, where: string): string;
	//SqlGetRow(tableDB: string): string;
	//SqlInsertRow(table: string): string;
	//SqlUpdateRow(table: string): string;
	//SqlDeleteRow(table: string): string;
	//SqlDeleteRow(table: string): string;


}