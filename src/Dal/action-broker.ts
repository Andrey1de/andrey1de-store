//import { DalAbstractStoreDtoask } from './abstract/dal-abstract-task';

import * as S from '../common/http-status';
import { Env } from '../env/env.controller';

//import { MapStore} from '../common/mapStore';
import { StoreDto } from '../dtos/store.dto';
import { SqlAction } from '../sql/sql-action';
import { Subject } from 'rxjs';
import { EAction } from '../common/e-actions';
import { resolve } from 'node:dns';


class ActionBrokerClass {

	protected static Broker: Subject<SqlAction> = new Subject<SqlAction>();
	constructor() {
		ActionBrokerClass.Broker.subscribe(async (task) => {
			const ret = await task.Do();
		})
	}

	CreateAction(eAction: EAction,
		table: string,
		row: StoreDto,
		where: string = undefined
	): SqlAction {
		const action =
			new SqlAction(eAction, table, row, where);

		//	this.validateAction(action);
		//throw `this.Error`;
		return action;

	}
	Error: string = '';


	EnqueueSqlAction(
		eAction: EAction,
		table: string,
		row: StoreDto,
		where: string = undefined
	) {
		const action =
			new SqlAction(eAction, table, row, where);


		ActionBrokerClass.Broker.next(action);
	}

	DoSqlAction(eAction: EAction,
		table: string,
		row: StoreDto,
		where: string = undefined
	): Promise<SqlAction> {
		const action =
			(new SqlAction(eAction, table, row, where));

		const promise: Promise<SqlAction> = action.Do();
			//action.Do().then( action => {
			//					return action;
			//					},
			//				err => {
			//					return undefined;
			//				}
			//).catch(  reason => {
			//			return reason;
			//		})


		return promise;

	}



}

export const SqlAcionFactory: ActionBrokerClass
	= new ActionBrokerClass();


