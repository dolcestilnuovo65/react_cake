import RemoteData from '../lib/backbone';
import Backbone from 'backbone';
import { IRemoteDataFactory } from '../lib/backbone';
import { support } from 'jquery';


export class Cake extends RemoteData{

    
    constructor(id, public title:string='',recipt:string='',fotoUrl=''){
        super(id);
    }
}


export class CakeFactory implements IRemoteDataFactory {
    newObject(): Cake {
        return new Cake(-1,'', '');
    }
}
Backbone.emulateJSON = true;