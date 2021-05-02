/*
 * GET home page.
 */
import express = require('express');
import { GetMapSore, MapStore } from '../common/mapStore';
//import { Facade } from '../Dal/dal-facade';
import * as S from '../common/http-status'
import { Dictionary } from 'express-serve-static-core';
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

    var rows: Pair[] = getMap();
    res.render('index', { title: 'Express', rows: rows });
})

router.get('/env', (req: express.Request, res: express.Response) => {
    const name = req?.params?.name;
    const ret = (name) ? `${name}=${process.env[name]}` : '';
    const status = (ret) ? S.OK : S.NOT_FOUND;
    res.send(ret).status(status);
});
router.get('/env/get/:name?', (req: express.Request, res: express.Response) => {
    const name = req?.params?.name || '';
    if (!name) {

        let strRet: string;
        let env: any = process.env;
        Object.keys(env).forEach((key) => {
            let str = `${key}=${process.env[key]}`;
            strRet += str + '\n;'
            console.log(str);
        });

        res.send(strRet).status(S.OK).end();

    } else if (name) {
        const ret = (name) ? `${name}=${process.env[name]}` : '';
        console.log(ret);
        const status = (ret) ? S.OK : S.NOT_FOUND;
        res.send(ret).status(status).end();
    } else {
        res.sendStatus(S.BAD_REQUEST);
    }
});

router.get('/env/set/:name/:val', (req: express.Request, res: express.Response) => {
    const name = req?.params?.name || '';
    const val = req?.params?.val || '';
    if (name && val) {
        process.env[name] = val;

        const ret = (name) ? `${name}=${process.env[name]}` : '';
        const status = (ret) ? S.OK : S.NOT_FOUND;
        res.send(ret).status(status).end();
    } else {
        res.sendStatus(S.BAD_REQUEST);
	}

});

export default router;