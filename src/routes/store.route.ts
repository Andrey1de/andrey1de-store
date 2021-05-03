/*
 * GET users listing.
 */
import express = require('express');

import { AsyncRouter } from "express-async-router";
import { Request, Response } from 'express';
import * as S from '../common/http-status';

//import { debug } from 'debug';
import * as M from '../common/map.utils';
//const console.log: debug.IDebugger = debug('store');

import { StoreDto } from '../dtos/store.dto';

import { EAction } from '../common/e-actions';
import { GetMapSore, MapStore } from '../common/mapStore';
import { Facade } from '../Dal/dal-facade';
import { AsyncAction } from '../Dal/async-action';

const router = express.Router();//AsyncRouter();///

enum EGuard {
	Zero = 0,
	Kind = 1,
	Key = 2,
	Body = 4



}
class GuardParams {
	readonly mapRet: MapStore = undefined;
	readonly queue: string = undefined;
	readonly kind: string = undefined;
	readonly key: string = undefined;
	readonly body: any = undefined; //= (req.body.item || req.body);
	readonly mapStore: MapStore;

	private error: string = '';
	get Error(): string { return this.error; }
	private status: number = S.OK;
	get Status(): number { return this.status; }

	constructor(private req: Request, private res: Response,
		private flags: EGuard = EGuard.Zero) {
		let queue = req?.params?.queue.toString() || 'memory';
		this.mapStore = GetMapSore(queue);
		this.queue = this.mapStore.Qname;
		this.kind = req?.params?.kind;
		this.key = req?.params?.key;
		this.body = req?.body?.item ;

		this.status = this.validate();

	}
	get OK(): boolean { return this.status == S.OK };

	private validate(): number {
		let strr = '';
		// ever tested
		if (!this.queue) {
			this.error += `Bad parameter : db`;
			this.status = S.BAD_REQUEST;
		}
	
		if ((this.flags & EGuard.Kind) && !this.kind) {//(this.flags & EGuard.Type) && this.kind
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: kind`;
			this.error = `Bad parameter:kind `;
			this.status = S.BAD_REQUEST;

		}

		if ((this.flags & EGuard.Key) && !this.key) {
			this.status = S.BAD_REQUEST;
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: key `;

		}

		if ((this.flags & EGuard.Body) && !this.body) {
			this.status = S.PRECONDITION_FAILED;
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: body `;

		}


		if (!this.OK) {
			console.log(strr);
			this.res.send(strr).status(this.status).end();
		}

		return this.status;

	}

}

///get/:queue/:kind This gets cache only
router.get('/:queue/:kind', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}

	let retArray = Facade.getKind(p.queue, p.kind);

	if (!retArray) {
		res.send({ 'queue': p.queue, 'kind': p.kind, 'items': [] }).status(S.NOT_FOUND).end();
		return;

	//return res.sendStatus(S.NOT_FOUND).end();
	}
	let retItems = retArray.map(p => p.jdata);

//	console.table(retArray);
	res.send({ 'queue': p.queue, 'kind': p.kind, 'items': retItems }).status(S.OK).end();

});

///get/:queue/:kind/:key This gets cache only
router.get('/:queue/:kind/:key', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}

	let mapItem = Facade.getItem(p.queue, p.kind, p.key)
	if (!mapItem) {
		let strr = `Not found kind:${p.kind} in store ${p.queue}`;
		console.log(strr);
		return res.send(strr).status(S.NO_CONTENT).end();

	} else {
		//let json = JSON.stringify(ret);
		return res.send({
			'queue': p.queue, 'kind': p.kind,
			'key': p.key, 'item': mapItem.jdata
		}).status(S.OK).end();

	}

});

///:queue/:kind/type/key updsert one database record
router.post('/:queue/:kind/:key', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key | EGuard.Body);

	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}
	const body = p.body.data || p.body;
	if (!body.jdata) {
		res.send('the content not present').status(S.NO_CONTENT).end();
		return;

	}
	const item = new StoreDto({ kind: p.kind, key: p.key, jdata: body.jdata });
	const ret = Facade.setItem(p.queue, p.kind, item);
	return res.send({
		'queue': p.queue, 'kind': p.kind,
		'key': p.key, 'item': ret.jdata
	}).status(S.OK).end();



});
///:queue/:kind Retrieve the database records
router.put('/:queue/:kind', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind);


	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}

		const strTab = `$[${p.queue}/${p.kind}]{_task.Guid}`;
		const _task = Facade.synchronizeKind(p.queue, p.kind);
		const subsc = _task.Ready.subscribe(action => {
			
				console.log(`'END retrieve ${strTab} ]`);
				console.log(`New Added Items table`);
				console.table(action.Data);

				console.log(`All conent of [${p.queue}/${p.kind}]`);
				const all = action.Store.getKind(action.kind)|| [];
				console.table(all.map(p=>p));
				subsc?.unsubscribe();


			},
			error => {
				console.log(`'${strTab} : ERROR ${error}`);
				subsc?.unsubscribe();
			}
		);

		let load: any = {};
		load.guid = _task.Guid.toString();
		load.table = p.queue;
		load.kind = p.kind;
		
		console.log(`'${_task.Guid} : BEGIN retrieve ${strTab} `);


		res.send ("BEGIN" + JSON.stringify(load)).status(S.OK).end();

});


///delete/:queue/:kind/:key
router.delete('/:queue/:kind', (req: Request, res: Response) => {
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key);
	if (!p.OK) {
		return;
	}
	var old = Facade.removeItems(p.queue, p.kind ,undefined)|| [];

	let status = (old.length > 0) ? S.OK : S.NOT_FOUND;


	return res.sendStatus(status).end();
	
});

///delete/:queue/:kind/:key
router.delete('/:queue/:kind/:key', (req: Request, res: Response) => {
	let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key);
	if (!p.OK) {
		return;
	}
	var old = Facade.removeItem(p.queue, p.kind, p.key);

	let status = (old) ? S.OK : S.NOT_FOUND;

	return res.sendStatus(status).end();

});




export const storeRouter = router;

/////new/:queue/:kind/:key - use set 
//router.post('/new/:queue/:kind/:key', (req: Request, res: Response) => {
//	let p: GuardParams = new GuardParams(req, res, EGuard.Key);
//	if (!p.OK) {
//		res.send(p.Status).status(S.BAD_REQUEST).end();
//		return;
//	}
//	var item = new StoreDto(undefined);
//	item.kind = p.kind;
//	item.key = p.key;
//	//item.id = item.hashCode;
//	item.stored = new Date();
//	item.store_to = new Date('2100-01-01');
//	item.jdata = p.body;

//	var old = Facade.setItem(p.queue, p.kind, p.key, item);



//	let status = (!old) ? S.CREATED : S.OK;

//	return res.send(item).status(status).end();

//});
