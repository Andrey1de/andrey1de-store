/*
 * GET home page.
 */
import express = require('express');
import { GetMapSore, MapStore } from '../common/mapStore';
import { Facade } from '../Dal/dal-facade';
//import { MapStore } from '../common/mapStore';

const router = express.Router();
class Pair {
    kind: string;
    size : number

}

const MemoryMapStore = GetMapSore("memory");
function getMap(): any[]{
    let arr : Pair[] = [];
    for (let key of MemoryMapStore.keys()) {
        let item : Pair =  { kind: key, size: MemoryMapStore.get(key).size };
        arr.push(item);
    }
    return arr;
}

router.get('/', (req: express.Request, res: express.Response) => {

    var rows : Pair [] = getMap();
    res.render('index', { title: 'Express', rows: rows});
});

export default router;