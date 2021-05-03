import { StoreDto } from "../dtos/store.dto";
import * as S from '../common/http-status';
import { Guid } from "guid-typescript";
import { noop, Subject } from "rxjs";
import { GetMapSore, MapStore } from "../common/mapStore";
import { EAction } from "../common/e-actions";
//const console.log: debug.IDebugger = debug('asynctask');
export abstract class AsyncAction<T> {
    readonly Store: MapStore;
    protected _done: boolean = false;;
    public get Done() { return this._done;}
    public setDone(that : T) {
        if (!this._done) {
            this._done = true;
            this.Ready.next(that);
		}
      
    }

    protected _data: Array<StoreDto> = [];
    public get Data(): Array<StoreDto> {
        return this._data;//?.map(p=>p.jdata);
    }
    public get JData(): Array<StoreDto> {
        const arr = this._data?.map(p => p.jdata) || [];
        return arr;
    }
    public Error: Error = undefined;

    public Status: number = S.OK;
      public readonly Guid: Guid;
    public readonly Ready: Subject<T> = new Subject<T>();

    constructor(readonly table: string ) {
        this.Guid = Guid.create();
        this.Store = GetMapSore(this.table);

	    this.Status = S.OK;
        this.Error = undefined;
    }



   



}


