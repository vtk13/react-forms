export class Report {
    errors: {[key: string]: string[]} = {};

    report(field: string, error: string) {
        this.errors[field] = this.errors[field]||[];
        this.errors[field].push(error);
    }
    getErrors(field: string) {
        return this.errors[field];
    }
    isValid() {
        return !Object.values(this.errors).some(er=>er.length>0);
    }
}

interface Validator {
    validate(data: any, report: Report): Report;
}

abstract class FieldValidator implements Validator {
    field: string;
    constructor(field: string) {
        this.field = field;
    }
    abstract validate(data: any, report: Report): Report;
}

export class LengthValidator extends FieldValidator {
    max: number;
    min: number;

    constructor(field: string, max: number, min: number = 0) {
        super(field);
        this.max = max;
        this.min = min;
    }
    validate(data: any, report: Report): Report {
        if (this.max && data[this.field].length>this.max)
            report.report(this.field, 'value is too long');
        if (this.min && data[this.field].length<this.min)
            report.report(this.field, 'value is too short');
        return report;
    }
}

abstract class Sanitizer<T> {
    field: string;
    constructor(field: string) {
        this.field = field;
    }
    abstract sanitize(data: any): T;
}
export class StringField extends Sanitizer<string> {
    sanitize(data: any) {
        return String(data[this.field]||'');
    }
}
export class BooleanField extends Sanitizer<boolean> {
    sanitize(data: any) {
        return !!data[this.field];
    }
}

export class Struct {
    sanitizers: Sanitizer<any>[];
    validators: Validator[];

    constructor(sanitizers: Sanitizer<any>[], validators: Validator[]) {
        this.sanitizers = sanitizers;
        this.validators = validators;
    }
    sanitize(data: any): any {
        return this.sanitizers.reduce((acc, sanitizer)=>{
            acc[sanitizer.field] = sanitizer.sanitize(data);
            return acc;
        }, {} as any);
    }
    validate(data: any) {
        data = this.sanitize(data);
        return this.validators.reduce(
            (acc, validator)=>validator.validate(data, acc), new Report());
    }
}
