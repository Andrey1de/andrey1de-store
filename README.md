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


