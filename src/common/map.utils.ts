import { IDto } from '../dtos/IDto';

export class PairKeyBody {
    constructor(public key: string, public body: IDto) {

    }

}

export function Assign2(that: any, what: any){
    if(that && what){
        for (const prop in (that as any)) {
            if (that.hasOwnProperty(prop) &&
                what.hasOwnProperty(prop))
                that[prop] = what[prop];
            
        }
    
    }
  
}

//TBD transfer body to string or ???
export const getBody = (map: Map<string, IDto>, key: string)
    : string | undefined => map?.get(key)?.toString();


export function getMapEntries(map: Map<string, IDto> | undefined)
    : Array<PairKeyBody> | undefined {
    let arr: Array<PairKeyBody> = [];
    if (map) {
        for (let [key, body] of map.entries()) {
            let item = new PairKeyBody(key, body );
            arr.push(item);

        }

    }
    return arr;
}