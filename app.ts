import * as express from 'express';
import { Request, Response } from 'express';
import { AddressInfo } from "net";
import { debug } from 'debug';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import * as cors from 'cors'
import * as path from 'path';
import * as S from './src/common/http-status';


import routes from './src/routes/index.route';
import users from './src/routes/store.route';
import { fork } from 'node:child_process';

//const debug = require('debug')('my express app');
const app = express();

//const task = new TaskRetrieve('user');

//const ret = task.DoSync();

//const console.log: debug.IDebugger = debug('app');

// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));
function getUri(req: Request){
    return req.protocol + '://' + req.get('host') + req.originalUrl;

}
console.log('DE QD');
//app.use((req : Request, resp : Response, next) => {
//    let c = req.get('Content-Type');
//    let uri = getUri(req);
//    let strr = `Content-Type:${c} of ${uri} `;
//    console.log(strr);
//    console.log(strr);
//    next();
//});
app.use(express.text());
//app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(express.urlencoded({ extended: true }));
app.use(cors());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/store', users);

app.use('/enviro/get/:key?', (req: Request, res: Response) => {

    res.setHeader('content-kind', 'text.plain');
    const key = req?.params?.key?.toString() || 'all';
    if (key != 'all') {
        let val = process.env[key]
        let str = `${key}=${val}`;
        console.log(str);
        res.send(str).status((val) ? S.OK : S.NOT_FOUND).end();

    } else {
          let obj: any = {};
        const env = process.env;
        let str = '';

        Object.keys(env).forEach(function (key) {
            str += `${key}=${env[key]}\n`;


        })
        console.log(str);

        res.send(str).status(S.OK).end();

    }

});
app.use('/enviro/set/:key/:val?', (req: Request, res: Response) => {
    res.setHeader('content-kind', 'text/plain');

    const key = req?.params?.key?.toString() || '';
    let val = req?.params?.val?.toString() || '';
    if (key) {
        process.env[key] = val;
        if (val) {
            val = process.env[key];

		}
        let str = `${key}=${val}`;
        console.log(str);

        res.send(`${key}=${val}`).status((val) ? S.OK : S.IM_A_TEAPOT).end();


    } else {
        res.sendStatus(S.BAD_REQUEST).end();
	}
   

});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err[ 'status' ] = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(err[ 'status' ] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    let addr = server.address() as AddressInfo;
    console.log(`Express server listening on ${addr.family}://${addr.address}:${addr.port}`);
});