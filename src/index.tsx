import React, {FormEvent, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Report} from './struct';
import {Settings, SettingsStruct} from './settings';

const Errors = (props: {report: Report, field: string})=>{
    let errors = props.report.getErrors(props.field);
    if (!errors?.length)
        return null;
    return <span style={{color: 'red'}}>
        {errors.map(err=><span key={err}>{err}<br/></span>)}
    </span>;
};

type SettingsFormProps = {
    data?: Settings;
    onSubmit: (data: Partial<Settings>)=>void;
    onCancel: ()=>void;
};
const SettingsForm = (props: SettingsFormProps)=>{
    let [firstname, setFirstname] = useState(props.data?.firstname||'');
    let [lastname, setLastname] = useState(props.data?.lastname||'');

    let settings = new SettingsStruct();
    let report = settings.validate({firstname, lastname});

    let submit = (e: FormEvent)=>{
        e.preventDefault();
        props.onSubmit({firstname, lastname});
    };
    let sRow = {marginBottom: '10px'};
    return <form onSubmit={submit}>
        {!!props.data &&
            <div style={sRow}>
                State: {props.data.enabled ? 'enabled': 'disabled'}
            </div>}
        <div style={sRow}>
            <label>
                First name:<br/>
                <Errors report={report} field="firstname"/>
                <input type="text" name="firstname" value={firstname}
                    onChange={e=>setFirstname(e.currentTarget.value)}/>
            </label>
        </div>
        <div style={sRow}>
            <label>
                Last name:<br/>
                <Errors report={report} field="lastname"/>
                <input type="text" name="lastname" value={lastname}
                    onChange={e=>setLastname(e.currentTarget.value)}/>
            </label>
        </div>
        <div style={sRow}>
            <button type="submit" disabled={!report.isValid()}>
                {props.data ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={props.onCancel}>Cancel</button>
        </div>
    </form>;
};

const MODES = {
    NONE: 'none',
    CREATE: 'create',
    EDIT: 'edit',
};
type SaveOpt = {
    create?: boolean;
};
const Root = ()=>{
    let [inited, setInited] = useState(false);
    let [mode, setMode] = useState(MODES.NONE);
    let [data, setData] = useState<Settings|undefined>();
    let [loading, setLoading] = useState(false);
    useEffect(()=>{
        fetch('/settings').then(async res=>{
            if (res.status==200)
                setData(await res.json());
            setInited(true);
        });
    }, []);

    if (!inited)
        return <p>loading...</p>;

    let sUl:  React.CSSProperties = {display: 'flex', flexDirection: 'row',
        listStyleType: 'none', padding: 0};
    let sIl = {padding: '0 5px'};
    let create = (e: React.MouseEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        setLoading(true);
        fetch('/settings').then(async res=>{
            if (res.status!=204)
                throw new Error('Already created');
            setLoading(false);
            setMode(MODES.CREATE);
        });
    }
    let edit = (e: React.MouseEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        setLoading(true);
        fetch('/settings').then(async res=>{
            if (res.status!=200)
                throw new Error('Failed to load settings');
            setData(await res.json());
            setLoading(false);
            setMode(MODES.EDIT);
        });
    }
    let save = async (upd: Partial<Settings>, opt?: SaveOpt)=>{
        if (opt?.create)
            upd.enabled = true;
        let res = await fetch('/settings', {
            method: opt?.create ? 'POST' : 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(Object.assign({}, data, upd)),
        });
        if (res.status!=200)
            throw new Error('Failed to save settings');
        setData(await res.json());
        setMode(MODES.NONE);
    };
    let remove = async (e: React.MouseEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        let res = await fetch('/settings', {method: 'DELETE'});
        if (res.status!=204)
            throw new Error('Failed to remove settings');
        setData(undefined);
        setMode(MODES.NONE);
    };
    let switchEnable = async (e: React.MouseEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        await save({enabled: !data!.enabled});
    };
    let head, form, loader;

    head = <ul style={sUl}>
        {!data && <li style={sIl}><a href="#" onClick={create}>Create</a></li>}
        {data && <li style={sIl}><a href="#" onClick={edit}>Edit</a></li>}
        {data && !data.enabled && <li style={sIl}>
            <a href="#" onClick={switchEnable}>Turn on</a>
        </li>}
        {data && !!data.enabled && <li style={sIl}>
            <a href="#" onClick={switchEnable}>Turn off</a>
        </li>}
        {data && <li style={sIl}><a href="#" onClick={remove}>Delete</a></li>}
    </ul>;
    if (loading)
        loader = <p>loading...</p>;
    if (mode==MODES.CREATE) {
        form = <SettingsForm onSubmit={data=>save(data, {create: true})}
            onCancel={()=>setMode(MODES.NONE)}/>;
    }
    if (mode==MODES.EDIT) {
        form = <SettingsForm data={data} onSubmit={save}
            onCancel={()=>setMode(MODES.NONE)}/>;
    }
    return <>{head}{loader}{form}</>;
};

createRoot(document.getElementById('root')!).render(<Root/>);
