import { StoreDto } from "../dtos/store.dto";

export class PackageSync {
	readonly Created: Date = new Date();
	constructor(
		public readonly  Table: string,
		public readonly Kind: string,
		public readonly NewArr: StoreDto[] = [],
		public readonly SetArr: StoreDto[] = [],
		public readonly DelArr: StoreDto[] = []
	) { }
	get IsEmpty() {
		return this.NewArr.length == 0 &&
			this.SetArr.length == 0 &&
			this.DelArr.length == 0;
	}

}
