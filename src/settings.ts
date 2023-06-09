import {BooleanField, LengthValidator, StringField, Struct} from './struct';

export class Settings {
    firstname: string = '';
    lastname: string = '';
    enabled: boolean = false;
    require_email: boolean = false;
    email: string = '';
}

export class SettingsStruct extends Struct {
    constructor() {
        super([
            new StringField('firstname'),
            new StringField('lastname'),
            new BooleanField('enabled'),
        ], [
            new LengthValidator('firstname', 10, 3),
            new LengthValidator('lastname', 10, 3),
        ]);
    }
}
