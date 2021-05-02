import * as  pg from 'pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv'

class EnvInternal {

	readonly IS_HEROKU: boolean = false;
	readonly DB_CONNECTION_STRING: string = '';
	readonly Pool: Pool;
	readonly DB_SCHEMA;


	constructor() {
		dotenv.config();
		this.DB_SCHEMA = process.env.DB_SCHEMA || 'public';
		this.IS_HEROKU = (process.env['IS_HEROKU'] || '').toUpperCase() == 'TRUE';
		this.DB_CONNECTION_STRING = (this.IS_HEROKU) ? process.env.DATABASE_URL :
			process.env.LOCAL_POSTGRESS_CONNECTION_STRING;
			//'postgresql://postgres:1q1q@127.0.0.1:5432/clouddata';
		if (this.DB_CONNECTION_STRING) {
			if (this.IS_HEROKU) {
				pg.defaults.ssl = true;
			}

			this.Pool = new Pool({
				connectionString: this.DB_CONNECTION_STRING,
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 20000,
			});
			console.log(`Connection Pool is set to \n${this.DB_CONNECTION_STRING}`);
		}
	}

}

export const Env: EnvInternal = new EnvInternal();

