import express from 'express';
import bodyParser from 'body-parser';

function valueCrud() {
    let value: any = null;
    let router = express.Router();
    router.get('/', (req, res)=>{
        if (!value)
            return void res.sendStatus(204);
        res.json(value);
    });
    router.post('/', (req, res)=>{
        value = req.body;
        res.json(value);
    });
    router.put('/', (req, res)=>{
        value = req.body;
        res.json(value);
    });
    router.delete('/', (req, res)=>{
        value = null;
        res.sendStatus(204);
    });
    return router;
}

const app = express();
app.use(bodyParser.json());
app.use('/settings', valueCrud());
app.use(express.static('build/pub'));
app.listen(3000, ()=>console.log('Listening on http://localhost:3000/'));
