//import { DalAbstractStoreDtoask } from './abstract/dal-abstract-task';

import * as S from '../common/http-status';
import { Env } from '../env/env.controller';

//import { MapStore} from '../common/mapStore';
import { StoreDto } from '../dtos/store.dto';
import { SqlAction } from '../sql/sql-action';
import { Subject } from 'rxjs';
import { EAction } from '../common/e-actions';
import { resolve } from 'node:dns';
import { PackageSync } from './package-sync';
import { Guid } from 'guid-typescript';
import { AsyncAction } from './async-action';


const TO_LOG_ACTION= true;
const TO_LOG_SQL = true;
const TO_LOG_ROWS = true;


class ActionBrokerClass {

	protected static Broker: Subject<SqlAction> = new Subject<SqlAction>();
	constructor() {
		ActionBrokerClass.Broker.subscribe(async (task) => {
			const action = await task.Do();
			if (TO_LOG_ACTION) {
				this.logAction(action);
		

			}
		})
	}

	logAction(action: SqlAction) {
		const strStatus = action.LogStatus();
		console.log(strStatus);
		if (TO_LOG_SQL) {
			console.table(action.Sql);

		}

		if (TO_LOG_ROWS) {
			console.table(action.Data);

		}

	}


	SynchronizeKind(table: string, kind: string): SqlAction {
		const foo: StoreDto = new StoreDto({ kind: kind, key: 'undefined' });
		const action: SqlAction =  new SqlAction(EAction.List, table, foo);
		ActionBrokerClass.Broker.next(action);
		return action;
	}
	AppendPackageSync(sync: PackageSync) {
		if (sync.IsEmpty) return;
		const table = sync.Table;
		const kind = sync.Kind;
		sync.NewArr.forEach(item => {
			const action: SqlAction = new SqlAction(EAction.UpsertRow, table, item);
			ActionBrokerClass.Broker.next(action);

		});
		sync.SetArr.forEach(item => {
			const action: SqlAction = new SqlAction(EAction.UpsertRow, table, item);
			ActionBrokerClass.Broker.next(action);
		});
		sync.DelArr.forEach(item => {
			const action: SqlAction = new SqlAction(EAction.DeleteRow, table, item);
			ActionBrokerClass.Broker.next(action);
		});


		
	}



   	//protected CreateAction(eAction: EAction,
	//	table: string,
	//	row: StoreDto,
	//	where: string = undefined
	//): SqlAction {
	//	const action =
	//		new SqlAction(eAction, table, row, where);

	//	//	this.validateAction(action);
	//	//throw `this.Error`;
	//	return action;

	//}


	//protected EnqueueSqlAction(
	//	eAction: EAction,
	//	table: string,
	//	row: StoreDto,
	//	where: string = undefined
	//): SqlAction {
	//	const action: SqlAction =
	//		new SqlAction(eAction, table, row, where);


	//	ActionBrokerClass.Broker.next(action);
	//	return action;
	//}

}

export const SqlAcionFactory: ActionBrokerClass
	= new ActionBrokerClass();


