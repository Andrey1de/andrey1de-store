import { StoreDto } from "../dtos/store.dto";
import * as S from '../common/http-status';

//const console.log: debug.IDebugger = debug('asynctask');
export abstract class AsyncAction {
    abstract Do(): Promise<AsyncAction>;//F ex S.OK , S,CREATED
 
    protected _done: boolean = false;;
    public get Dond() { return this._done; }
    protected _data: Array<StoreDto> = [];
    public get Data(): Array<StoreDto> {
        return this._data;//?.map(p=>p.jdata);
    }
    public get JData(): Array<StoreDto> {
        return this._data?.map(p=>p.jdata) || [];
    }
    public Error: any = undefined;

    public Status: number = S.OK;
    public StrStatus: string = 'OK';

   



}


