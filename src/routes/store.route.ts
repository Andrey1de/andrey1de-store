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
	Type = 1,
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
		this.kind = req?.params?.kind?.toUpperCase();
		this.key = req?.params?.key?.toUpperCase();
		this.body = (req?.body?.item || req?.body);

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
		// // ever tested
		if (!this.kind) {//(this.flags & EGuard.Type) && this.kind
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

///:queue/:kind This gets cache only
router.get('/:queue/:kind', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Type);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}

	let retArray = Facade.getType(p.queue, p.kind);

	if (!retArray) {
		return res.sendStatus(S.NO_CONTENT).end();
	}
	let retItems = retArray.map(p => p.jdata);

	console.table(retArray);
	res.send({ 'kind': p.kind, 'items': retItems }).status(S.OK).end();

});

///:queue/:kind/:key This gets cache only
router.get('/:queue/:kind/:key', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Type | EGuard.Key);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}

	let mapItem = Facade.getItem(p.queue, p.kind, p.key)
	if (!mapItem) {
		let strr = `Not found kind:${p.kind} in store`;
		console.log(strr);
		return res.send(strr).status(S.NO_CONTENT).end();

	} else {
		//let json = JSON.stringify(ret);
		return res.send({ 'kind': p.kind, 'key': p.key, 'item': mapItem.jdata }).status(S.OK).end();

	}

});

///:queue/:kind/:keyNew Item
router.post('/:queue/:kind/:key', (req: Request, res: Response) => {
	let p: GuardParams = new GuardParams(req, res, EGuard.Key);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}
	var item = new StoreDto(undefined);
	item.kind = p.kind;
	item.key = p.key;
	//item.id = item.hashCode;
	item.stored = new Date();
	item.store_to = new Date('2100-01-01');
	item.jdata = p.body;

	var old = Facade.setItem(p.queue, p.kind, p.key, item);



	let status = (!old) ? S.CREATED : S.OK;

	return res.send(item).status(status).end();

});

///:queue/:kind Retrieve the database records
router.put('/:queue/:kind', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Type);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}
	try {
		const task = Facade.retrieveType$(p.kind, undefined)
			.then(
				arr => {
					const arrJson = arr.map(p => p.jdata);
					if (arr || arr.length <= 0) {
						res.sendStatus(S.NOT_FOUND);
					} else {
						res.send(arrJson).status(S.NOT_FOUND);

					}
				},
				err => {
					res.send(err).status(S.CONFLICT);

				}
			).catch(err => {
				res.send(err).status(S.CONFLICT);

			});

	} catch (err) {
		res.send(err).status(S.CONFLICT);

	}





});
///:queue/:kind Retrieve one database record
router.put('/:queue/:kind/type/key', (req: Request, res: Response) => {
	res.setHeader('content-kind', 'application/json');
	let p: GuardParams = new GuardParams(req, res, EGuard.Type);
	if (!p.OK) {
		res.send(p.Status).status(S.BAD_REQUEST).end();
		return;
	}
	try {
		const task = Facade.retrieveItem$(p.kind,p.key, undefined)
			.then(
				arr => {
					const arrJson = arr.map(p => p.jdata);
					if (arr || arr.length <= 0) {
						res.sendStatus(S.NOT_FOUND);
					} else {
						res.send(arrJson).status(S.NOT_FOUND);

					}
				},
				err => {
					res.send(err).status(S.CONFLICT);

				}
			).catch(err => {
				res.send(err).status(S.CONFLICT);

			});

	} catch (err) {
		res.send(err).status(S.CONFLICT);

	}



});
///:queue/:kind
router.delete('/:queue/:kind', (req: Request, res: Response) => {
	let p: GuardParams = new GuardParams(req, res, EGuard.Type | EGuard.Key);
	if (!p.OK) {
		return;
	}
	var old = Facade.deleteType(p.queue, p.kind, p.key) || [];

	let status = (old.length > 0) ? S.OK : S.NOT_FOUND;


	return res.sendStatus(status).end();
	
});

//:queue/:kind/:key
router.delete('/:queue/:kind/:key', (req: Request, res: Response) => {
	let p: GuardParams = new GuardParams(req, res, EGuard.Type | EGuard.Key);
	if (!p.OK) {
		return;
	}
	var old = Facade.removeItem(p.queue, p.kind, p.key);

	let status = (old) ? S.OK : S.NOT_FOUND;

	return res.sendStatus(status).end();

});




export default router;

