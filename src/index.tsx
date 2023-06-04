import React, {FormEvent, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Settings, SettingsStruct} from './settings';
import {FieldWrap, FormRow} from './uikit';

const SettingsForm = (props: {
    settings?: Settings;
    onSubmit: (data: Partial<Settings>)=>void;
    onCancel: ()=>void;
})=>{
    let [firstname, setFirstname] = useState(props.settings?.firstname||'');
    let [lastname, setLastname] = useState(props.settings?.lastname||'');

    let settings = new SettingsStruct();
    let report = settings.validate({firstname, lastname});

    let submit = (e: FormEvent)=>{
        e.preventDefault();
        props.onSubmit({firstname, lastname});
    };
    return <form onSubmit={submit}>
        {!!props.settings && <FormRow>
            State: {props.settings.enabled ? 'enabled': 'disabled'}
        </FormRow>}
        <FormRow>
            <FieldWrap name="firstname" label="First name" report={report}>
                <input type="text" name="firstname" value={firstname}
                    onChange={e=>setFirstname(e.currentTarget.value)}/>
            </FieldWrap>
        </FormRow>
        <FormRow>
            <FieldWrap name="lastname" label="Last name" report={report}>
                <input type="text" name="lastname" value={lastname}
                    onChange={e=>setLastname(e.currentTarget.value)}/>
            </FieldWrap>
        </FormRow>
        <FormRow>
            <button type="submit" disabled={!report.isValid()}>
                {props.settings ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={props.onCancel}>Cancel</button>
        </FormRow>
    </form>;
};

const Controls = (props: {
    settings?: Settings;
    create: ()=>void;
    edit: ()=>void;
    remove: ()=>void;
    switchEnable: ()=>void;
})=>{
    let sUl:  React.CSSProperties = {display: 'flex', flexDirection: 'row',
        listStyleType: 'none', padding: 0};
    let sIl = {padding: '0 5px', cursor: 'pointer',
        textDecoration: 'underline'};
    if (!props.settings)
        return <ul style={sUl}>
            <li style={sIl} onClick={props.create}>Create</li>
        </ul>;
    return <ul style={sUl}>
        <li style={sIl} onClick={props.edit}>Edit</li>
        <li style={sIl} onClick={props.switchEnable}>
            {props.settings.enabled ? 'Turn off' : 'Turn on'}
        </li>
        <li style={sIl} onClick={props.remove}>Delete</li>
    </ul>;
};

const Root = ()=>{
    let [inited, setInited] = useState(false);
    let [showForm, setShowForm] = useState(false);
    let [settings, setSettings] = useState<Settings|undefined>();
    let [loading, setLoading] = useState(false);
    useEffect(()=>{
        fetch('/settings').then(async res=>{
            if (res.status==200)
                setSettings(await res.json());
            setInited(true);
        });
    }, []);

    if (!inited)
        return <p>loading...</p>;

    let create = ()=>{
        setLoading(true);
        fetch('/settings').then(async res=>{
            if (res.status!=204)
                throw new Error('Already created');
            setLoading(false);
            setShowForm(true);
        });
    }
    let edit = ()=>{
        setLoading(true);
        fetch('/settings').then(async res=>{
            if (res.status!=200)
                throw new Error('Failed to load settings');
            setSettings(await res.json());
            setLoading(false);
            setShowForm(true);
        });
    }
    let save = async (upd: Partial<Settings>)=>{
        if (!settings)
            upd.enabled = true;
        let res = await fetch('/settings', {
            method: settings ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(Object.assign({}, settings, upd)),
        });
        if (res.status!=200)
            throw new Error('Failed to save settings');
        setSettings(await res.json());
        setShowForm(false);
    };
    let remove = async ()=>{
        let res = await fetch('/settings', {method: 'DELETE'});
        if (res.status!=204)
            throw new Error('Failed to remove settings');
        setSettings(undefined);
        setShowForm(false);
    };
    let switchEnable = async ()=>{
        await save({enabled: !settings!.enabled});
    };

    return <>
        <Controls settings={settings} create={create} edit={edit}
            remove={remove} switchEnable={switchEnable}/>
        {loading && <p>loading...</p>}
        {showForm && <SettingsForm settings={settings} onSubmit={save}
            onCancel={()=>setShowForm(false)}/>}
    </>;
};

createRoot(document.getElementById('root')!).render(<Root/>);
