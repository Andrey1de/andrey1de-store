# Andrey1deStore

let pg = require('pg');
if (process.env.DATABASE_URL) {
  pg.defaults.ssl = true;
}

// include an OR statement if you switch between a local dev db and 
// a remote heroku environment

let connString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:localpostgresport/yourlocaldbname';
const { Pool } = require('pg');

const pool = new Pool({
  connectionString : connString
});


C:\WINDOWS\system32>heroku addons:create heroku-postgresql:hobby-dev -a=andrey1de-store
Creating heroku-postgresql:hobby-dev on ? andrey1de-store... free
Database has been created and is available
 ! This database is empty. If upgrading, you can transfer
 ! data from another database with pg:copy
Created postgresql-rectangular-70572 as DATABASE_URL
Use heroku addons:docs heroku-postgresql to view documentation

C:\WINDOWS\system32>heroku config:get DATABASE_URL -a andrey1de-store
postgres://fradqoewkbgcro:c05c99ac0ed330abd3babe1ce364c753d6ae77e9b56a862f2f06a7d79b57168c@ec2-34-225-167-77.compute-1.amazonaws.com:5432/dfah5sk8n7qjva

postgres://
user=fradqoewkbgcro
:
password=c05c99ac0ed330abd3babe1ce364c753d6ae77e9b56a862f2f06a7d79b57168c
@
host=ec2-34-225-167-77.compute-1.amazonaws.com:5432
/
db=dfah5sk8n7qjva


