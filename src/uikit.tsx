import React, {PropsWithChildren} from 'react';
import {Report} from './struct';

export const FormRow = (props: PropsWithChildren<{}>)=>{
    return <div style={{marginBottom: '10px'}}>{props.children}</div>;
}

const Errors = (props: {report: Report, field: string})=>{
    let errors = props.report.getErrors(props.field);
    if (!errors?.length)
        return null;
    return <span style={{color: 'red'}}>
        {errors.map(err=><span key={err}>{err}<br/></span>)}
    </span>;
};

export const FieldWrap = (props: PropsWithChildren<{
    name: string;
    label: string;
    report: Report;
}>)=>{
    return <label>
        {props.label}:<br/>
        <Errors report={props.report} field={props.name}/>
        {props.children}
    </label>;
}
