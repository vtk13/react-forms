import express from 'express';
import bodyParser from 'body-parser';
import {Settings, SettingsStruct} from './settings';

function valueCrud() {
    let settings: Settings|null = null;
    let struct = new SettingsStruct();
    let router = express.Router();
    router.get('/', (req, res)=>{
        if (!settings)
            return void res.sendStatus(204);
        res.json(settings);
    });
    router.post('/', (req, res)=>{
        let report = struct.validate(req.body);
        if (!report.isValid())
            return void res.status(400).json(report.errors);
        settings = struct.sanitize(req.body);
        console.log('POST', settings);
        res.json(settings);
    });
    router.put('/', (req, res)=>{
        let report = struct.validate(req.body);
        if (!report.isValid())
            return void res.status(400).json(report.errors);
        settings = struct.sanitize(req.body);
        console.log('PUT', settings);
        res.json(settings);
    });
    router.delete('/', (req, res)=>{
        settings = null;
        res.sendStatus(204);
    });
    return router;
}

const app = express();
app.use(bodyParser.json());
app.use('/settings', valueCrud());
app.use(express.static('build/pub'));
app.listen(3000, ()=>console.log('Listening on http://localhost:3000/'));
