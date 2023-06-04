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

export class Struct implements Validator {
    validators: Validator[];

    constructor(validators: Validator[]) {
        this.validators = validators;
    }
    validate(data: any) {
        return this.validators.reduce(
            (acc, field)=>field.validate(data, acc), new Report());
    }
}
