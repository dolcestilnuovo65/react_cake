/// <reference path="./IRemoteData.ts" />
/// <reference path="./DBFS.ts" />
import * as Backbone from 'backbone';
import { DBFSTable } from './DBFS';
import { IRemoteData } from './IRemoteData';


//
// InstanceDBFS
//          - DATABASE
//                      - StorageClass(TABLE)
// c:\DBFS\MyAPP\CAMPER           
//
// InstanceDBFS
//          - DATABASE
//                      - StorageClass(TABLE)
// c:\DBFS\MyAPP\CAMPER          
//Backbone.emulateHTTP = true;
//Backbone.emulateJSON = true;


let urlBackbone: string = "";
let DBFSInstancePath: string = "";
let DBFSDatabase: string = "";

function setUrlBackbone(url: string) {
    urlBackbone = url;
}


function setVirtualDB(instance: string,database:string) {
    DBFSInstancePath = instance;
    DBFSDatabase = database;

}


Backbone.Model.prototype.parse = function (resp, xhr) {
    if (resp.type && (resp.type == "create")) {
        return {
            "id": resp.data.id
        }
    } else if (resp.type && (resp.type == "update")) { } else {
        return resp;
    }
}




interface IRemoteDataFactory {
    newObject(): RemoteData;
    newObject(id?: string): RemoteData;
    newObject(id?: string, desc?: string): RemoteData;


}





function generateGuid(): string {
    var result: string, i, j;
    result = '';
    for (j = 0; j < 32; j++) {
        if (j == 8 || j == 12 || j == 16 || j == 20)
            result = result + '-';
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
    }
    return result
}

function generateOperationTkn(): string {
    var result: string, i, j;
    result = '';
    for (j = 0; j < 32; j++) {
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
    }
    return result
}

function functionName(obj) {
    var name = /\W*function\s+([\w\$]+)\(/.exec(obj);
    if (!name) return 'Anonymous';
    return name[1];
}


function getInheritanceChain(obj: any) {
    var parent = obj.constructor;
    var inheritanceChain = new Array();

    inheritanceChain.push(functionName(parent));
    parent = parent.constructor;

    inheritanceChain.push(functionName(parent));
    parent = parent.constructor;


    inheritanceChain.push(parent); //this is the Object superclass

    return inheritanceChain.join(", ");
}


function getObjectClass(obj): string {
    if (obj && obj.constructor && obj.constructor.toString()) {

        /*
         *  for browsers which have name property in the constructor
         *  of the object,such as chrome 
         */
        if (obj.constructor.name) {
            return obj.constructor.name;
        }
        var str = obj.constructor.toString();
        /*
         * executed if the return of object.constructor.toString() is 
         * "[object objectClass]"
         */

        if (str.charAt(0) == '[') {
            var arr = str.match(/\[\w+\s*(\w+)\]/);
        } else {
            /*
             * executed if the return of object.constructor.toString() is 
             * "function objectClass () {}"
             * for IE Firefox
             */
            var arr = str.match(/function\s*(\w+)/);
        }
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }
    return '';
};

interface Printable {
    print(): void;
}




//class RemoteCollection__ extends Backbone.Collection {
//    private isBackboneCollection: boolean = true;
//    constructor(rmdata: RemoteData) {
//        super();
//        this.model = rmdata;
//    }

//    private saveSingleItem(m: RemoteData) {
//        m.save();
//    }

//}


interface fetchParams {
    filter?: string;
    page?: number;
    ordeBy?: string;
}

//  public fetchData(): void;
//    public fetchData(id ?: string): void;
//    public fetchData(id ?: IFetchParams): void;
//    public fetchData(id ?: string, virtualPath ?: IFetchParams): void;
//    public fetchData(id ?: string, virtualPath ?: string): void;
//    public fetchData(id ?: string, virtualPath ?: string, param ?: IFetchParams): void {
//    let localId: string = "";
//    let filter: string = "";
//    let page: number = 1;
//    let itemsPerPage = 0;
//    let orderBy: string = '';

               
//    if(id === undefined)
//            localId = this.id;
//    else {
//        if(typeof (id) === 'string')
//    localId = id;
//    else if (typeof (id) === 'IFetchParams') {
//    filter = (<IFetchParams>id).filter;
//}

//        }



        
//if (page === undefined)
//    page = 1;
////if (this.virtualPath === null)
////    this.virtualPath = getInheritanceChain(this);                                                // @pm mancava lo slash         

//let vpath = virtualPath === undefined ? ((this.virtualPath === null || this.virtualPath === '') ? "/" + this.classStorageName : this.virtualPath) : virtualPath;




//super.fetch(
//    {
//        async: false,
//        data: { id: localId, instance: this.instance, database: this.database, virtualPath: vpath, filter: filter, session: RemoteData.session },
//        success: (() => this.fetchedSuccessfully(page, itemsPerPage, filter, orderBy)),
//        error: ((e) => this.fetchedWithErrors(e)),

//    });
 
//    }


export default class RemoteData extends Backbone.Model implements IRemoteData {
//    urlRoot = "http://localhost/lab/TS/php/genericitemEx.php";

    public exclude: string[] = new Array();
    public excludeFromDBFS: string[] = new Array();
    public instance: string = DBFSInstancePath;
    public database: string = DBFSDatabase;
    public classStorageName: string = getObjectClass(this); // Setto il nome della classe
    public virtualPath: string = "";
    public __dbfs!: DBFSTable ;
    public __isDBFS: boolean = true;
    public __isPrimaryKey: string[] = new Array();
    public parentId:string = "";
    id: string = "";
    public isBackboneModel: boolean = true;
    public isArray: boolean = false;
    public isArrayElement: boolean = false;
    public isCollection: boolean = false;
 //   public isLinkedCollection: boolean = false; @pm occhio che ad aggiungere elementi si perde la compatibilità con l DB!!!!!

    public isContainer: boolean = false; // crea una directory contenitore
//    public isContained: boolean = false; // nel caso sia un array non fa creare la directory contenitore
    public JSONString: string = '';
    public remoteDataFactory!: IRemoteDataFactory;
    public static session: string = "";
    public sessionTkn: string = "";
    public static onHTTPError: Function; // Una funzione globale per gestire gli errori HTTP



    
 
    //sync(method, model, options) {
    //    _.defaults(options || (options = {}), {
    //        crossDomain: true
    //    });

    //    return Backbone.sync.call(this, method, model, options);
    //}

    constructor(id?: string,data?:string) {
        super(data !== undefined ? data : null);

        this.initialize(urlBackbone);
        if (id !== undefined)
            this.id = id;
        else
            this.id = generateGuid();
        this.exclude["cid"] = true;
        this.exclude["attributes"] = true;
        this.exclude["_changing"] = true;
        this.exclude["_previousAttributes"] = true;
        this.exclude["changed"] = true;
        this.exclude["_pending"] = true;
        this.exclude["_events"] = true;
        this.exclude["_collection"] = true;
        this.exclude["urlRoot"] = true;
        this.exclude["url"] = true;
        this.exclude["exclude"] = true;
        this.exclude["JSONString"] = true;
        this.exclude["remoteDataFactory"] = true;
        this.exclude["excludeFromDBFS"] = true;
        this.exclude["validationError"] = true;
        this.excludeFromDBFS["validationError"] = true;
        this.excludeFromDBFS["url"] = true;
        this.excludeFromDBFS["parentId"] = true;
        this.excludeFromDBFS["remoteDataFactory"] = true;
        this.excludeFromDBFS["excludeFromDBFS"] = true;
        this.excludeFromDBFS["isBackboneModel"] = true;
        this.excludeFromDBFS["isArray"] = true;
        this.excludeFromDBFS["isArrayElement"] = true;
        this.excludeFromDBFS["isCollection"] = true;
        this.excludeFromDBFS["isLinkedCollection"] = true;
        this.excludeFromDBFS["isContainer"] = true;
        this.excludeFromDBFS["instance"] = true;
        this.excludeFromDBFS["database"] = true;
        this.excludeFromDBFS["classStorageName"] = true;
        this.excludeFromDBFS["virtualPath"] = true;
        this.excludeFromDBFS["id"] = true;
        this.excludeFromDBFS["__isDBFS"] = true;

        this.sessionTkn = RemoteData.session;



    }

   
        initialize(url) {
            this.url = url;
        }



        rmToJson(): string {

            // estraggo i membri della classe
            var all = Object.getOwnPropertyNames(this);


            //        var arrayNames: String = getInheritanceChain(this);
            //        alert(arrayNames);

            // DBFS
            if (this.__dbfs == null)
                this.__dbfs = new DBFSTable(this.classStorageName);

            let str = '';
            for (var elem in all) {
                var element = all[elem];

                if (!this.excludeFromDBFS[element] && !this.exclude[element] && element.indexOf("__") < 0 && element.indexOf("collection") < 0) { // ciclo di esclusione dei membri di backbone

                    if (this[element]['isBackboneModel'] === undefined && !this[element]['isBackboneModel']) {
                        if (str.length === 0)
                            str =  '{' + element + ':' + this[element];
                        else
                            str =  str + ',' + element + ':' + this[element];
                   }

                }
            }
            return str + '}';
        }

        private processClass(init: boolean);
        private processClass(init?:boolean,complete?: Function);
        private processClass(init?: boolean, complete?: Function, nested?: boolean)
        private processClass(init?: boolean, complete?: Function, nested?: boolean, sessionTkn?: string): void 
        private processClass(init?: boolean, complete?: Function, nested?: boolean, sessionTkn?:string,dummy?: void): void {

        // estraggo i membri della classe
            var all = Object.getOwnPropertyNames(this);


            // Se è un oggetto linkato (cioè un riferimento a tabella) allora 
            //if (this.isLinkedCollection)
            //    return;


        //        var arrayNames: String = getInheritanceChain(this);
        //        alert(arrayNames);

        // DBFS
        if (this.__dbfs == null)
            this.__dbfs = new DBFSTable(this.classStorageName);

        console.log("Saving " + this.classStorageName + ' id: ' + this.id + ' virtualPath: ' + this.virtualPath);
        if (sessionTkn === undefined)
            sessionTkn = '';

        this.sessionTkn = sessionTkn;

        // Questo è il ciclo di recursione sui sotto elementi
                
        for (var elem in all) {
            var element = all[elem];

            if (!this.exclude[element] && element.indexOf("__") < 0 && element.indexOf("collection") < 0) { // ciclo di esclusione dei membri di backbone

                // devo vedere se è una collezione in quel caso
                // 1) Devo creare la dir con il nome della collezione
                // 2) devo salvare l'oggetto collezione nell'oggetto padre
                // 3) a questo punto posso estrarre l'array e trattarlo come array 
                // ogni oggetto ha il suo contesto e path virtuale 
                // camper/engine/piston per il pistone di un motore di un camper
                // car/engine/piston di una macchina
                // ma dal punto di vista di un venditore di pistoni
                // piston/sold/engine/camper o piston/sold/engine/car                          
                // devo mettere tutto sotto ciclo al limite se non è un array lo faccio solo una volta

                var elementIndex = 1;
                var savedArray = this[element];
                var isArray: boolean = false;
                //if (this[element]["isCollection"]) {
                //    //qui devo eseguire una set di una remote collection   
                //    var rc: RemoteCollection<string> = new RemoteCollection<string>();
                //    rc.save();
                //}

                if (this[element] instanceof Array) { // devo inserire un ciclo su tutti gli elementi dell'array

                    // salvo il valore isArray nella classe contenitore
                    this[element]["isArray"] = true;
                    elementIndex = this[element].length;
                    isArray = true;

                } 


                // Questo è il ciclo generale che nel caso di un array è maggiore di uno  

                //

                for (var i = 0; i < elementIndex; i++) {

                    if (isArray) { // devo sostituire l'elemento corrente con l'array corrente


                        this[element] = savedArray[i];
                        if (this[element] === null)
                            console.log("Object referred by member " + this[element] + " must be initialized");


                        // salvo il tipo nella classe contenuta
                        this[element]["isArrayElement"] = isArray;
                        this[element]["isArray"] = isArray;


                    }


                    if (this[element] === null || this[element] === undefined) {
                        console.log("Object referred by member " + element + " must be initialized");
                        let x = 1;
                        x = x;
                    }

                    if (this[element]['isBackboneCollection'] && !this[element]['isBackboneModel']) {
                        this[element]['forEach'](this[element]['saveSingleItem'], this[element]);

                    }

                    if (this[element]['isBackboneModel']) {

                        if (element == 'virtualPath') {
                            // setto il virtual path : se è un container allora creo la dir contenitore
                            if (this.virtualPath.indexOf(this.classStorageName) < 0) {
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName;

                                if (this.isContainer)
                                    this.virtualPath = this.virtualPath + '/' + this.id;

                            }


                            this[element] = this.virtualPath;

                        }


                        //                if (eval('this.' + element + '.isBackboneModel') === true) {
                        // Devo salvare l'id e la classe per consentire la fetch
                        // è qui che devo intervenire per mettere il virtual path
                        // l'indirizzo di default è quello del virtual path 
                        // ma niente impedisce al server di mettere un altro indirizzo
                        // riferito ad un server esterno
                        // questo nell'ottica di mischiare le carte e sparpagliare i dati
                        // sui servers 
                        //"{id:"  + this[element]['id'] + ",url:'',virtualPath:" + this.virtualPath +  "}" 

                        //                    this['set'](element, this[element]['id']);

                        // Qui ci va un  test sulla tipologia di oggetto: se  è un array
                        // non devo mettere l'id del figlio ma quello del padre
                        // in più devo comunicare alla parte server che è un array
                        // questo si realizza inserendo il campo isArray nella classe
                        // e questa deve creare un directory dove salvare gli elementi
                        // questo significa che il virtual path di ogni elemento dell'array va cambiato

                        var parentId = this.id;

                        let vpath: string = '';

                        //if (this.isContainer)
                        //    vpath = !this[element]['isArray'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath;
                        //else


                        // se è un array ed è un container allore non metto il parentId ma direttamente l'id
                        // questo eviterà di creare una dir contenitore che non serve a nulla
                        // e ogni elemento dell'array crerà una dir contenitore con tutti i dati dentro

                        vpath = !this[element]['isArray'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this[element].isContainer ? this.virtualPath + '/' + this[element].id : this.virtualPath + '/' + parentId;

                        //if (!this[element]['isArray'] && !this[element].isContainer) //Se non è un array e non è un container
                        //    vpath = this.virtualPath + '/' + this[element]["classStorageName"]; // allora solo la classe
                        //else if (!this[element]['isArray'] && this[element].isContainer) //Se non è un array ma è un container
                        //    vpath = this.virtualPath + '/' + this[element]["classStorageName"] + '/' + this[element].id; // allora classe + id
                        //else if (this[element]['isArray'] && this[element].isContainer) // Se array e container allora solo id 
                        //    vpath = this.virtualPath + '/' + this[element].id;
                        //else if (this[element]['isArray'] && !this[element].isContainer && !this[element].isContained) // Se array ma non container allora parentId 
                        //    vpath = this.virtualPath + '/' + parentId;
                        //else if (this[element]['isArray'] && !this[element].isContainer && this[element].isContained)
                        //    vpath = this.virtualPath; // Se array non container ma conteined nessuna dir



                        var remoteObject = {
                            id: this[element]['id'],
                            isArray: this[element]['isArray'],                                                                      // gli metto il nome della collezione
                            virtualPath: vpath
                        };

                        this['set'](element, remoteObject);

                        if (this.JSONString === '')
                            this.JSONString = "{" + element + ":" + remoteObject;
                        else
                            this.JSONString = this.JSONString + "," + element + ":" + remoteObject;


                        if (element == 'JSONString' && !this.isArray)
                            this[element] = this.JSONString;

                        // passo la session  nella classe contenuta: 
                //        this[element]["sessionTkn"] = this.sessionTkn;



                        // salvo il virtual path nella classe contenuta: 
                        this[element]["virtualPath"] = vpath;

                        this[element]["parentId"] = this.id


                        // salvo il dbfs classe contenuta
                        this[element]["__dbfs"] = this.__dbfs;

                        // Eseguo la funzione sulla classe contenuta

                        this[element]["processClass"](init, complete, nested, sessionTkn);


                    } // if (this[element]['isBackboneModel'])
                    else
                    { // if !(this[element]['isBackboneModel'])
                        // Qui si esamina se l'elemento è il virtualPath del remoteData corrente
                        // Se è il virtual path di un remotePath semplice allora aggiungo classStorageName al path
                        if (element == 'virtualPath' && !this.isArray) {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0) {
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName;
                            }
                            // se è un container  devo cambiare il path e inserire il container
                            if (this.isContainer)
                                this.virtualPath = this.virtualPath + '/' + this.id;

                            this[element] = this.virtualPath;


                        } // else not backbone model

                        // se è un container  devo cambiare il path anche se è un array
                        //else if (element == 'virtualPath' && this.isContainer) {
                        //    this.virtualPath = this.virtualPath + '/' + this.id;
                        //    this[element] = this.virtualPath;

                        //}



                        if (!this.excludeFromDBFS[element] && this.__isDBFS) {

                            if (String(this[element]).length > 0) {
                                if (this.__isPrimaryKey[element])
                                    this.__dbfs.addElement(element, true, false, element + '-' + this[element]);
                                else
                                    this.__dbfs.addElement(element, false, true, element + '-' + this[element]);
                            }
                        }

                        // Piantata la sessione nel di dietro
                        //if (element === 'sessionTkn')
                        //    this[element] = RemoteData.session;


                        this['set'](element, this[element]);

                        if (this.JSONString === '')
                            this.JSONString = "{" + element +  ":"  + this[element];
                        else
                            this.JSONString = this.JSONString + "," + element + ":" + this[element];


                        if (element == 'JSONString' && !this.isArray)
                            this[element] = this.JSONString;


                        //this.__dbfs.addElement(this[element],

                    } // if !(this[element]['isBackboneModel'])

                }  // for (var i = 0; i < elementIndex; i++) {
                if (isArray)
                    this[element] = savedArray;

            } // if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0)
        } //for (var elem in all)



        if (!init) {
            super.save(null, {
                type: 'POST', async: complete === undefined ? false : true, success: (() => this.savedSuccessfully()),
                //error: ((e) => this.savedWithErrors(e))
                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }
            });
        if (complete !== undefined && nested === undefined)
            complete();
        this.JSONString = this.JSONString + "}";
              
        }

    }

        public getPublicMember(): string[] {
            let exclude: string[] = new Array(100);
            exclude["cid"] = true;
            exclude["remoteDataFactory"] = true;
            exclude["attributes"] = true;
            exclude["_changing"] = true;
            exclude["_previousAttributes"] = true;
            exclude["changed"] = true;
            exclude["_pending"] = true;
            exclude["_events"] = true;
            exclude["_collection"] = true;
            exclude["urlRoot"] = true;
            exclude["exclude"] = true;
            exclude["JSONString"] = true;

            exclude["exlude"] = true;
            exclude["isBackboneModel"] = true;
            exclude["isArray"] = true;
            exclude["isArrayElement"] = true;
            exclude["isCollection"] = true;
            exclude["isContainer"] = true;
            exclude["instance"] = true;
            exclude["database"] = true;
            exclude["classStorageName"] = true;
            exclude["virtualPath"] = true;
            exclude["id"] = true;
            exclude["__isDBFS"] = true;
            exclude["key"] = true;
            exclude["desc"] = true;
            exclude["parentId"] = true;
            exclude["excludeFromDBFS"] = true;
            exclude["collectionPrototype"] = true;
                // estraggo i membri della classe
            var all = Object.getOwnPropertyNames(this);
            var result: string[] = new Array(100); 


 

            for (var elem in all) {
                var element = all[elem];

                if (!exclude[element] && element.indexOf("__") < 0 ) { // ciclo di esclusione e

                    result.push(element);
                }
 

            }
            return result;
     }


        public clone(): RemoteData {
            let exclude: string[] = new Array(100);
            exclude["cid"] = true;
            exclude["remoteDataFactory"] = true;
            exclude["attributes"] = true;
            exclude["_changing"] = true;
            exclude["_previousAttributes"] = true;
            exclude["changed"] = true;
            exclude["_pending"] = true;
            exclude["_events"] = true;
            exclude["_collection"] = true;
            exclude["urlRoot"] = true;
            exclude["exclude"] = true;
            exclude["JSONString"] = true;

            exclude["exlude"] = true;
            exclude["isBackboneModel"] = true;
            exclude["isArray"] = true;
            exclude["isArrayElement"] = true;
            exclude["isCollection"] = true;
            exclude["isContainer"] = true;
            exclude["instance"] = true;
            exclude["database"] = true;
            exclude["classStorageName"] = true;
            exclude["virtualPath"] = true;
            exclude["id"] = true;
            exclude["__isDBFS"] = true;
            exclude["key"] = true;
            exclude["desc"] = true;
            exclude["parentId"] = true;
            exclude["excludeFromDBFS"] = true;
            exclude["collectionPrototype"] = true;
            // estraggo i membri della classe
            let all = Object.getOwnPropertyNames(this);

            let rmData: RemoteData = new RemoteData(this.id);



            for (let elem in all) {
                let element = all[elem];

                if (!exclude[element] && element.indexOf("__") < 0) { // ciclo di esclusione e

                   rmData[element] = this[element];
                }


            }
            return rmData;
        }


        public init_old(): void {
        // estraggo i membri della classe
        var all = Object.getOwnPropertyNames(this);


        //        var arrayNames: String = getInheritanceChain(this);
        //        alert(arrayNames);

        // DBFS
        if (this.__dbfs == null)
            this.__dbfs = new DBFSTable(this.classStorageName);


        for (var elem in all) {
            var element = all[elem];

            if (!this.exclude[element] && element.indexOf("__") < 0 && element.indexOf("collection") < 0) { // ciclo di esclusione dei membri di backbone

                // devo vedere se è una collezione in quel caso
                // 1) Devo creare la dir con il nome della collezione
                // 2) devo salvare l'oggetto collezione nell'oggetto padre
                // 3) a questo punto posso estrarre l'array e trattarlo come array 
                // ogni oggetto ha il suo contesto e path virtuale 
                // camper/engine/piston per il pistone di un motore di un camper
                // car/engine/piston di una macchina
                // ma dal punto di vista di un venditore di pistoni
                // piston/sold/engine/camper o piston/sold/engine/car                          
                // devo mettere tutto sotto ciclo al limite se non è un array lo faccio solo una volta

                var elementIndex = 1;
                var savedArray = this[element];
                var isArray: boolean = false;
                //if (this[element]["isCollection"]) {
                //    //qui devo eseguire una set di una remote collection   
                //    var rc: RemoteCollection<string> = new RemoteCollection<string>();
                //    rc.save();
                //}

                if (this[element] instanceof Array) { // devo inserire un ciclo su tutti gli elementi dell'array

                    // salvo il valore isArray nella classe contenitore
                    this[element]["isArray"] = true;
                    elementIndex = this[element].length;
                    isArray = true;

                } 


                // Questo è il ciclo generale che nel caso di un array è maggiore di uno  

                //
                var parentId = this.id;

                for (var i = 0; i < elementIndex; i++) {

                    if (isArray) { // devo sostituire l'elemento corrente con l'array corrente

                        this[element] = savedArray[i];
                        // salvo il tipo nella classe contenuta
                        this[element]["isArrayElement"] = isArray;
                        this[element]["isArray"] = isArray;


                    }


                    if (this[element]['isBackboneCollection'] && !this[element]['isBackboneModel']) {
                        this[element]['forEach'](this[element]['saveSingleItem'], this[element]);

                    }
                    if (this[element]['isBackboneModel']) {
                        this.parentId = this.id;
                        if (element == 'virtualPath') {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        //                if (eval('this.' + element + '.isBackboneModel') === true) {
                        // Devo salvare l'id e la classe per consentire la fetch
                        // è qui che devo intervenire per mettere il virtual path
                        // l'indirizzo di default è quello del virtual path 
                        // ma niente impedisce al server di mettere un altro indirizzo
                        // riferito ad un server esterno
                        // questo nell'ottica di mischiare le carte e sparpagliare i dati
                        // sui servers 
                        //"{id:"  + this[element]['id'] + ",url:'',virtualPath:" + this.virtualPath +  "}" 

                        //                    this['set'](element, this[element]['id']);

                        // Qui ci va un  test sulla tipologia di oggetto: se  è un array
                        // non devo mettere l'id del figlio ma quello del padre
                        // in più devo comunicare alla parte server che è un array
                        // questo si realizza inserendo il campo isArray nella classe
                        // e questa deve creare un directory dove salvare gli elementi
                        // questo significa che il virtual path di ogni elemento dell'array va cambiato


                        var remoteObject = {
                            id: this[element]['id'],
                            isArray: this[element]['isArray'],
                            virtualPath: !this[element]['isArray'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + parentId
                        };

                        this['set'](element, remoteObject);

                        // salvo il virtual path nella classe contenuta: 
                        this[element]["virtualPath"] = !this[element]['isArrayElement'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + parentId;



                        // salvo il dbfs classe contenuta
                        this[element]["__dbfs"] = this.__dbfs;

                        // Eseguo la init sulla classe contenuta 
                        this[element]["init"]();

                        //eval('this.' + element + '.saveData();');
                    }
                    else {
                        if (element == 'virtualPath' && !this.isArray) {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        if (!this.excludeFromDBFS[element] && this.__isDBFS) {

                            if (String(this[element]).length > 0) {
                                if (this.__isPrimaryKey[element])
                                    this.__dbfs.addElement(element, true, false, element + '-' + this[element]);
                                else
                                    this.__dbfs.addElement(element, false, true, element + '-' + this[element]);
                            }
                        }
                        this['set'](element, this[element]);
                        //this.__dbfs.addElement(this[element],

                    }
                }  // for (var i = 0; i < elementIndex; i++) {
                if (isArray)
                    this[element] = savedArray;

            } // if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0)
        } //for (var elem in all)


        }

    public init(): void {
        this.processClass(true);

    }
    public setPrimaryKey(key: string): void {
        this.__isPrimaryKey[key] = true;

    }

    public getDbfsRows(): string {
        return this.__dbfs.commitLoop();
    }
    public save();
    public save(command?: string);
    public save(command?: string, session?: string, complete?: Function);
    public save(command?: string, session?: string, complete?: Function, nested?: boolean): string {
        command === undefined ? command = "" : command = command;

        let operationaTkn = generateOperationTkn();

        if (session !== undefined)
            operationaTkn = session.substr(0, session.indexOf('-'));


        let finalToken = operationaTkn + '-' + RemoteData.session;  

 

        
        this.processClass(false, complete, nested, finalToken);

        if (!(this instanceof RemoteCommand)) {
            let rc: saveCompleted = new saveCompleted(operationaTkn,command);
            rc.save();
        }

        return finalToken;
        
    }

    public saveSession();
    public saveSession(command?: string);
    public saveSession(command?: string, session?: string, endSession?:boolean,complete?: Function);
    public saveSession(command?: string, session?: string, endSession?: boolean, complete?: Function, nested?: boolean): string {
        command === undefined ? command = "" : command = command;

        let operationaTkn = generateOperationTkn();

        if (session !== undefined)
            operationaTkn = session.substr(0, session.indexOf('-'));

        if (endSession === undefined)
            endSession = false;


        let finalToken = operationaTkn + '-' + command + '-' + RemoteData.session;


        this.processClass(false, complete, nested, finalToken);


        

        if (!(this instanceof RemoteCommand) && endSession) {  // se non è la save stessa
            let rc: saveSessionCompleted = new saveSessionCompleted(operationaTkn, command);
            rc.save();
        }

        return finalToken;

    }
    public save_old(complete?: Function,nested?: boolean ): void {
        // estraggo i membri della classe
        var all = Object.getOwnPropertyNames(this);


        //        var arrayNames: String = getInheritanceChain(this);
        //        alert(arrayNames);

        // DBFS
        if (this.__dbfs == null)
            this.__dbfs = new DBFSTable(this.classStorageName);


        for (var elem in all) {
            var element = all[elem];

            if (!this.exclude[element] && element.indexOf("__") < 0 && element.indexOf("collection") < 0) { // ciclo di esclusione dei membri di backbone

                // devo vedere se è una collezione in quel caso
                // 1) Devo creare la dir con il nome della collezione
                // 2) devo salvare l'oggetto collezione nell'oggetto padre
                // 3) a questo punto posso estrarre l'array e trattarlo come array 
                // ogni oggetto ha il suo contesto e path virtuale 
                // camper/engine/piston per il pistone di un motore di un camper
                // car/engine/piston di una macchina
                // ma dal punto di vista di un venditore di pistoni
                // piston/sold/engine/camper o piston/sold/engine/car                          
                // devo mettere tutto sotto ciclo al limite se non è un array lo faccio solo una volta

                var elementIndex = 1;
                var savedArray = this[element];
                var isArray: boolean = false;
                //if (this[element]["isCollection"]) {
                //    //qui devo eseguire una set di una remote collection   
                //    var rc: RemoteCollection<string> = new RemoteCollection<string>();
                //    rc.save();
                //}


                if (this[element] instanceof Array) { // devo inserire un ciclo su tutti gli elementi dell'array

                    // salvo il valore isArray nella classe contenitore
                    this[element]["isArray"] = true;
                    elementIndex = this[element].length;
                    isArray = true;

                } 


                // Questo è il ciclo generale che nel caso di un array è maggiore di uno  

                //
                var parentId = this.id;

                for (var i = 0; i < elementIndex; i++) {

                    if (isArray) { // devo sostituire l'elemento corrente con l'array corrente

                        this[element] = savedArray[i];
                        // salvo il tipo nella classe contenuta
                        this[element]["isArrayElement"] = isArray;
                        this[element]["isArray"] = isArray;


                    }

                    if (this[element] === null || this[element] === undefined) 
                        console.log("Object referred by member " + element + " must be initialized");

                    if (this[element]['isBackboneCollection'] && !this[element]['isBackboneModel']) {
                        this[element]['forEach'](this[element]['saveSingleItem'], this[element]);

                    }
                    if (this[element]['isBackboneModel']) {
                        if (element == 'virtualPath') {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        //                if (eval('this.' + element + '.isBackboneModel') === true) {
                        // Devo salvare l'id e la classe per consentire la fetch
                        // è qui che devo intervenire per mettere il virtual path
                        // l'indirizzo di default è quello del virtual path 
                        // ma niente impedisce al server di mettere un altro indirizzo
                        // riferito ad un server esterno
                        // questo nell'ottica di mischiare le carte e sparpagliare i dati
                        // sui servers 
                        //"{id:"  + this[element]['id'] + ",url:'',virtualPath:" + this.virtualPath +  "}" 

                        //                    this['set'](element, this[element]['id']);

                        // Qui ci va un  test sulla tipologia di oggetto: se  è un array
                        // non devo mettere l'id del figlio ma quello del padre
                        // in più devo comunicare alla parte server che è un array
                        // questo si realizza inserendo il campo isArray nella classe
                        // e questa deve creare un directory dove salvare gli elementi
                        // questo significa che il virtual path di ogni elemento dell'array va cambiato


                        var remoteObject = {
                            id: this[element]['id'],
                            isArray: this[element]['isArray'],
                            virtualPath: !this[element]['isArray'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + parentId
                        };

                        this['set'](element, remoteObject);

                        // salvo il virtual path nella classe contenuta: 
                        this[element]["virtualPath"] = !this[element]['isArrayElement'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + parentId;



                        // salvo il dbfs classe contenuta
                        this[element]["__dbfs"] = this.__dbfs;

                        // Eseguo la save sulla classe contenuta 
                        this[element]["save"](complete,true);

                        //eval('this.' + element + '.saveData();');
                    }
                    else {
                        if (element == 'virtualPath' && !this.isArray) {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        if (!this.excludeFromDBFS[element] && this.__isDBFS) {

                            if (String(this[element]).length > 0) {
                                if (this.__isPrimaryKey[element])
                                    this.__dbfs.addElement(element, true, false, element + '-' + this[element]);
                                else
                                    this.__dbfs.addElement(element, false, true, element + '-' + this[element]);
                            }
                        }
                        this['set'](element, this[element]);
                        //this.__dbfs.addElement(this[element],

                    }
                }  // for (var i = 0; i < elementIndex; i++) {
                if (isArray) // Qui ripristino l'array dove element = items sono gli elementi dell'array
                    this[element] = savedArray;

            } // if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0)
        } //for (var elem in all)


        super.save(null, { async:complete===undefined?false:true, success: (() => this.savedSuccessfully()), error: ((e) => this.savedWithErrors(e)) });
        if (complete !== undefined && nested === undefined)
           complete();
             //alert('save end');
    }
    public save_array(): void {
        // estraggo i membri della classe
        var all = Object.getOwnPropertyNames(this);


        //        var arrayNames: String = getInheritanceChain(this);
        //        alert(arrayNames);

        // DBFS
        if (this.__dbfs == null)
            this.__dbfs = new DBFSTable(this.classStorageName);


        for (var elem in all) {
            var element = all[elem];

            if (!this.exclude[element] && element.indexOf("__") < 0 && element.indexOf("collection") < 0) { // ciclo di esclusione dei membri di backbone

                // devo mettere tutto sotto ciclo al limite se non è un array lo faccio solo una volta

                var elementIndex = 1;
                var savedArray = this[element];
                var isArray: boolean = false;
                if (this[element] instanceof Array) { // devo inserire un ciclo su tutti gli elementi dell'array

                    // salvo il valore isArray nella classe contenitore
                    this[element]["isArray"] = true;
                    elementIndex = this[element].length;
                    isArray = true;

                } 


                // Questo è il ciclo generale che nel caso di un array è maggiore di uno  

                //
                var parentId = this.id;

                for (var i = 0; i < elementIndex; i++) {

                    if (isArray) { // devo sostituire l'elemento corrente con l'array corrente

                        if (i == 0)
                            // è qui che devo creare la directory contenitore con il nome del parent
                            // devo usare un comando php apposito       
                            this[element] = this[element][i];
                        else {

                            this[element] = savedArray;
                            this[element] = this[element][i];

                        }
                        // salvo il tipo nella classe contenuta
                        this[element]["isArrayElement"] = isArray;
                        this[element]["isArray"] = isArray;

                    }


                    if (this[element]['isBackboneCollection'] && !this[element]['isBackboneModel']) {
                        this[element]['forEach'](this[element]['saveSingleItem'], this[element]);

                    }
                    if (this[element]['isBackboneModel']) {
                        if (element == 'virtualPath') {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        //                if (eval('this.' + element + '.isBackboneModel') === true) {
                        // Devo salvare l'id e la classe per consentire la fetch
                        // è qui che devo intervenire per mettere il virtual path
                        // l'indirizzo di default è quello del virtual path 
                        // ma niente impedisce al server di mettere un altro indirizzo
                        // riferito ad un server esterno
                        // questo nell'ottica di mischiare le carte e sparpagliare i dati
                        // sui servers 
                        //"{id:"  + this[element]['id'] + ",url:'',virtualPath:" + this.virtualPath +  "}" 

                        //                    this['set'](element, this[element]['id']);

                        // Qui ci va un  test sulla tipologia di oggetto: se  è un array
                        // non devo mettere l'id del figlio ma quello del padre
                        // in più devo comunicare alla parte server che è un array
                        // questo si realizza inserendo il campo isArray nella classe
                        // e questa deve creare un directory dove salvare gli elementi
                        // questo significa che il virtual path di ogni elemento dell'array va cambiato


                        var remoteObject = {
                            id: this[element]['id'],
                            isArray: this[element]['isArray'],
                            virtualPath: !this[element]['isArray'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + this[element]["classStorageName"] + '/' + parentId
                        };

                        this['set'](element, remoteObject);

                        // salvo il virtual path nella classe contenuta: 
                        this[element]["virtualPath"] = !this[element]['isArrayElement'] ? this.virtualPath + '/' + this[element]["classStorageName"] : this.virtualPath + '/' + this[element]["classStorageName"] + '/' + parentId;



                        // salvo il dbfs classe contenuta
                        this[element]["__dbfs"] = this.__dbfs;

                        // Eseguo la save sulla classe contenuta 
                        this[element]["save"]();

                        //eval('this.' + element + '.saveData();');
                    }
                    else {
                        if (element == 'virtualPath') {
                            // setto il virtual path
                            if (this.virtualPath.indexOf(this.classStorageName) < 0)
                                this.virtualPath = this.virtualPath + '/' + this.classStorageName
                            this[element] = this.virtualPath;

                        }
                        if (!this.excludeFromDBFS[element] && this.__isDBFS) {

                            if (String(this[element]).length > 0) {
                                if (this.__isPrimaryKey[element])
                                    this.__dbfs.addElement(element, true, false, element + '-' + this[element]);
                                else
                                    this.__dbfs.addElement(element, false, true, element + '-' + this[element]);
                            }
                        }
                        this['set'](element, this[element]);
                        //this.__dbfs.addElement(this[element],

                    }
                }  // for (var i = 0; i < elementIndex; i++) {  
            } // if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0)
        } //for (var elem in all)

        super.save(null, { async: false, success: (() => this.savedSuccessfully()), error: ((e) => this.savedWithErrors(e)) });


    }





    private savedSuccessfully() {

        //alert("saved");
    }

    private savedWithErrors(e) {
        // alert("error");
        alert(e);
    }


    private fetchedSuccessfully(page: number, itemsPerPage: number,filter,level, orderBy: string) {
        // estraggo i membri della classe
        let all = Object.getOwnPropertyNames(this);
        let test: string = 'text';
        test = test + 'a';


        for (var elem in all) {
            if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0) { // ciclo di esclusione dei membri di backbone
                // Se  è  un modello di backbone 
                // Se è null l'oggetto lo instanzio
                if (this[all[elem]] === null || this[all[elem]] === undefined) {
                    console.log("Object referred by member " + all[elem] + " must be initialized");

                //    if (all[elem].charAtIsUpper(0))
                //        // non funziona this[all[elem]] = window[all[elem]];
                //        throw new ExceptionInformation("");
                }

                if (this[all[elem]]['isBackboneModel'] || this[all[elem]] instanceof Array) {
                    //if (eval('this.' + all[elem] + '.isBackboneModel') === true) {
                    // recupero la struttura dati 
                    var remoteObject = this["get"](all[elem]); // Nel caso sia un array vuoto

                    let id: number=-1;
                    let virtualPath:string;

                    if (this[all[elem]] instanceof Array && remoteObject === undefined) { // se l'array è vuoto allora 
                        virtualPath = this.virtualPath + '/' + this.id;                  // prendo il virtual path dall'oggetto'
                                                                         // @pm ci devo aggiungere l'd ???????????????
                                                                         // come ha potuto funzionare per mesi????                           
                                                                         

                    }

                    else {

                         id = remoteObject.id;
                         virtualPath = remoteObject.virtualPath;
                    }
                                       // qui devo vedere se l'oggetto che sto trattando è una collezione
                    //if (this[all[elem]]['isCollection']) {
                    //    //quando salvo una collezione il virtual path deve 
                    //    // contenere l'ID della directory contenitore
                    //    // la collezione stessa deve essere serializzata
                    //    // in un file JSON
                    //    // prima devo recuperare l'oggetto collezione
                    //    // che deve contenere il numero di items
                    //    // e poi con quello eseguire una fetch dei primi dieci elementi  
                    //    var arrayRes = new Array("93DA6593-6678-77C7-863B-472D9A2028BD", "B2746EB7-E0F0-10C3-3629-B6259357D29B", "D64AE831-F4B8-214D-D522-A962B5258B06", "EE2A6E20-2D09-B8CA-B8C2-35A48ED95B03");
                    //    for (var elem1 in arrayRes) {
                    //        var test = elem1;
                    //        var remoteData = this[all[elem]]["GetItems"]()[0]; // in pratica l'array deve contenere almeno un oggetto che serve come protoripo
                    //        remoteData.virtualPath = buffer.virtualPath;
                    //        remoteData.fetchData(arrayRes[elem1], buffer.virtualPath);
                    //        this[all[elem]][elem1] = remoteData;

                    //    }

                    //}

                    // qui devo vedere se l'oggetto che sto trattando è un  array
                    // in questo caso dovrei fare un list della directory 
                    // e farmi restituire  i primi dieci elementi 
                    // in ogni caso qui va inserita la logica di richiamo 
                    // degli ultimi dieci elementi in ordine temporale etc
                    if (this[all[elem]] instanceof Array) {
                        var rmServer = new RemoteServer();
                        var remPath: string = this.instance + '/' + this.database + this.virtualPath + '/' + this.id;
                        var arrayRes: string[] = rmServer.getDirsList(this.instance, this.database, remPath, page, itemsPerPage, orderBy, filter);

                        let j = 0;

                        // Viene forzato un array di risultati: il risultato viene parsificato 
                        //  Es cognome-nome-matricola badge-tipo

                        if (level === '1') {
                            for (let elem1 in arrayRes)
                                this[all[elem]][elem1] = this['remoteDataFactory'].newObject(arrayRes[elem1].substring(0, arrayRes[elem1].indexOf('.dat')));
                            return;
                        }                        
  
                        for (var elem1 in arrayRes) {
 
                            var remoteData = this['remoteDataFactory'].newObject(); // 
                            remoteData.virtualPath = virtualPath;
                            if(level === '1')
                                remoteData.fetchFinalData(arrayRes[elem1].substring(0, arrayRes[elem1].indexOf(".")), virtualPath);
                            else
                                remoteData.fetchData(arrayRes[elem1].substring(0, arrayRes[elem1].indexOf(".")), virtualPath);

                            this[all[elem]][elem1] = remoteData;

                        }
                        // list della directory
                        // ciclo di for su tutti gli item
                        // faccio la fetch dell'elemento
                        // lo assegno all'array 
                        //  this[all[elem]][i]
                    }
                    else
                        this[all[elem]]["fetchData"](id, virtualPath,page,itemsPerPage,filter,orderBy);


                }
                else {
                    try {
                        var buffer = this["get"](all[elem]);
                        if (Object.prototype.toString.call(this[all[elem]]) === "[object Date]")  // @pm questa è una data                        
                            this[all[elem]] = new Date(buffer);

                        else if (Object.prototype.toString.call(this[all[elem]]) === "[object Boolean]") {  // @pm questa è una data                        
                            let check: boolean;
                            if (buffer === '0' || buffer === 'false')
                                check = false
                            else if (buffer === '1' || buffer === 'true')
                                check = true;
                            else
                                check = buffer;      

                            this[all[elem]] = check;    
                                               
                        }
                        else
                          this[all[elem]] = buffer;
                    }
                    catch (e) {
                        let i = 0;
                        i++;
                    }

                    }
            }
        }


        //alert("fetched succesfully");
    }

    private fetchedSuccessfully_ori() {
        // estraggo i membri della classe
        var all = Object.getOwnPropertyNames(this);

        for (var elem in all) {
            if (!this.exclude[all[elem]] && all[elem].indexOf("__") < 0) { // ciclo di esclusione dei membri di backbone
                // Se  è  un modello di backbone 
                if (this[all[elem]]['isBackboneModel']) {
                    //if (eval('this.' + all[elem] + '.isBackboneModel') === true) {
                    // recupero la struttura dati 
                    //                    var id: string = eval("this.get(\"" + all[elem] + "\")");
                    var remoteObject = this["get"](all[elem]);
                    //                    eval('this.' + all[elem] + ".fetchData(\"" + id + "\")");
                    var id = remoteObject.id;
                    var virtualPath = remoteObject.virtualPath;
                    this[all[elem]]["fetchData"](id, virtualPath);
                }
                else {
                    //                var str = "this." + all[elem] + "=" + "this.get(\"" + all[elem] + "\")";
                    this[all[elem]] = this["get"](all[elem]);
                    //    eval(str);
                }
            }
        }


        //alert("fetched succesfully");
    }

    fetchedWithErrors(e: any) {
        alert("fetched with error");
    }

    public getPage(page?: number);
    public getPage(page?: number, itemsPerPage?: number) {
        this.fetchData(this.id,undefined,page, itemsPerPage);
    }

    public fetchData(): void;
    public fetchData(id?: string): void;
    public fetchData(id?: string, virtualPath?: string): void;
    public fetchData(id?: string, virtualPath?: string, page?: number): void
    public fetchData(id?: string, virtualPath?: string, page?: number, itemsPerPage?: number): void
    public fetchData(id?: string, virtualPath?: string, page?: number, itemsPerPage?: number, orderBy?: string): void {
        let localId: string = "";
        let filter: string = "";
        let level: string = "";
        let asyncMode: boolean = false;
        function parseUrl(url): Object {
            let regex: RegExp = /[?&]([^=#]+)=([^&#]*)/g;
            let params: Object = {};
            let match: RegExpExecArray;
            while (match = regex.exec(url)) {
                params[match[1]] = match[2];

            }
            return params;

        }
               
        if (id === undefined)
            localId = this.id;
         else {
            if (id.indexOf('&') === 0) {
                localId = this.id;
                let parms = parseUrl(id);
                filter = parms['filter']; 
                level = parms['level'];
                asyncMode = parms['asyncMode'];

//                filter = id.replace('&filter=', '');
            }
            else if (id.indexOf('&') > 0) {
                localId = id.substring(0,id.indexOf('&'));
                let parms = parseUrl(id.substring(id.indexOf('&'), id.length));
                filter = parms['filter'];
                level = parms['level'];
                asyncMode = parms['asyncMode'];

            }
            else if (id.indexOf('&') < 0) {
                localId = id;
                filter = '';
            }



        }

        if (asyncMode === undefined)
            asyncMode = false;

        if (page === undefined)
            page = 1;
        //if (this.virtualPath === null)
        //    this.virtualPath = getInheritanceChain(this);                                                // @pm mancava lo slash         

           let vpath = virtualPath === undefined ? ((this.virtualPath === null || this.virtualPath === '') ? "/" + this.classStorageName : this.virtualPath) : virtualPath;


           
 

            super.fetch(
                {
                    async: asyncMode,
                    data: { id: localId, instance: this.instance, database: this.database, virtualPath: vpath, filter: filter, level: level, session: RemoteData.session },
                    success: (() => this.fetchedSuccessfully(page,itemsPerPage,filter,level,orderBy)),
                    error: function (model, response) {
                        RemoteData.onHTTPError(response.responseText);
                    }

                });
 
    }

    public fetchFinalData(): void;
    public fetchFinalData(id?: string): void;
    public fetchFinalData(id?: string, virtualPath?: string): void;
    public fetchFinalData(id?: string, virtualPath?: string, page?: number): void
    public fetchFinalData(id?: string, virtualPath?: string, page?: number, itemsPerPage?: number): void
    public fetchFinalData(id?: string, virtualPath?: string, page?: number, itemsPerPage?: number, orderBy?: string): void {
        let localId: string = "";
        let filter: string = "";
        let level: string = "";
        let asyncMode: boolean = false;

        function parseUrl(url): Object {
            let regex: RegExp = /[?&]([^=#]+)=([^&#]*)/g;
            let params: Object = {};
            let match: RegExpExecArray = null;
            while (match = regex.exec(url)) {
                params[match[1]] = match[2];

            }
            return params;

        }

        if (id === undefined)
            localId = this.id;
        else {
            if (id.indexOf('&') === 0) {
                localId = this.id;
                let parms = parseUrl(id);
                filter = parms['filter'];
                level = parms['level'];
                asyncMode = parms['asyncMode'];

                //                filter = id.replace('&filter=', '');
            }
            else if (id.indexOf('&') > 0) {
                localId = id.substring(0, id.indexOf('&'));
                let parms = parseUrl(id.substring(id.indexOf('&'), id.length));
                filter = parms['filter'];
                level = parms['level'];
                asyncMode = parms['asyncMode'];

            }
            else if (id.indexOf('&') < 0) {
                localId = id;
                filter = '';
            }



        }
        if (page === undefined)
            page = 1;
        //if (this.virtualPath === null)
        //    this.virtualPath = getInheritanceChain(this);                                                // @pm mancava lo slash         

        let vpath = virtualPath === undefined ? ((this.virtualPath === null || this.virtualPath === '') ? "/" + this.classStorageName : this.virtualPath) : virtualPath;




        super.fetch(
            {
                async: asyncMode,
                data: { id: localId, instance: this.instance, database: this.database, virtualPath: vpath, filter: filter, level: level, session: RemoteData.session },
                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }

            });

    }


    public fetchCommand(cmd: string[]) {

    }

}


//The sync() method reads and fetched the model data
//Backbone.sync = function (method, model) {
//    document.write("The state of the model is:");
//    document.write("<br>");

//    //The 'method' specifies state of the model
//    document.write(method + ": " + JSON.stringify(model));
//};



class LocalData extends RemoteData {
    storageName: string = "default";
    localStorage = new Store('prova');
    constructor(id: string) {
        super(id);
    }
    

}

class DBFSFile extends RemoteData {
    private payload: string = "";
    private remoteId: string = "";
    
    constructor(remoteId: string, payload: string) {
        super();
        this.payload = payload;
        this.remoteId = remoteId;
        this.excludeFromDBFS[remoteId];
    }
}


class RemoteCommand extends RemoteData {
    command: string = "";
    target: string = "";
    action: string = "";


}

class saveCompleted extends RemoteCommand {
    constructor(operationalTkn: string, command: string) {
        super();
        this.action = "saveCompleted";
        this.target = operationalTkn;
        this.command = command;
    }
}


class saveSessionCompleted extends RemoteCommand {
    constructor(operationalTkn: string, command: string) {
        super();
        this.action = "saveSessionCompleted";
        this.target = operationalTkn;
        this.command = command;
    }
}



class saveSessionPartial extends RemoteCommand {
    constructor(operationalTkn: string, command: string) {
        super();
        this.action = "saveSessionPartial";
        this.target = operationalTkn;
        this.command = command;
    }
}


/// <reference path="../../lib/backbone.localstorage.d.ts" />

//Backbone.emulateHTTP = true;
//Backbone.emulateJSON = true;
//let urlBackbone: string = "http://localhost/lab/TS/php/genericitemEx.php";


interface IRemoteCollection<T> extends IRemoteData {

    // Get the collection as an array
    GetItems();

    // Get a specific item from a collection given it's index
    GetItem(index: number);

    GetItemByKey(key: string): T;

    RemoveItem(index: number): void;


    RemovItemByKey(key: string): boolean;



    RemoveItemByLastKey(key: string): boolean;


    // Length of the collection
    Count();

    // Add an object to the collection
    Add(item: T);
    Add(item?: T, key?: string, dummy?: string);


    addByKey(item: T, key: string);


    // Delete an object from the collection
    Delete(itemIndex: number);

    // Find the index of a given object in a collection
    IndexOfItem(obj: T, fromIndex?: number): number;
}

//class RemoteBackBoneCollection extends Backbone.Collection<RemoteData> {
//    model = RemoteData;
//    url: "http://localhost:8080/ESecure/ESecure";

//    constructor(remoteData: Object[]) {
//        super(remoteData);

//    }


//}

//class RemoteBackBoneLocalCollection extends RemoteBackBoneCollection {
//    model = RemoteData;
//    localStorage = new Backbone.LocalStorage('prova');


//}





class RemoteCollection<T> extends RemoteData implements IRemoteCollection<T> {

    //constructor(classStorageName: string);
    //constructor(classStorageName: string, id?: string);
    constructor(classStorageName: string, id?: string, remoteDataFactory?: IRemoteDataFactory) {
        //   constructor(classStorageName: string, id?: string, remoteDataFactory?: IRemoteDataFactory, dummy?: any) {

        super(id !== undefined && id !== null && id !== '' ? id : undefined); //@pm
        this.initialize(urlBackbone);
        this.isCollection = true;
        this.classStorageName = classStorageName;
        this.sessionTkn = RemoteData.session;

        if (remoteDataFactory !== undefined)
            this.remoteDataFactory = remoteDataFactory;
    }


    // The underlying array data structure of the collection
    public items: Array<any> = [];

    // Get the collection as an array
    public GetItems() {

        return this.items;
    }

   

    // Get a specific item from a collection given it's index
    public GetItem(index: number): T {
        return this.items[index];
    }

    // Get a specific item from a collection given it's index
    public RemoveItem(index: number): void {
        this.items.splice(index, 1);
    }

    public GetItemByKey(key: string): T {

        let i = 0;
        for (; i < this.items.length; i++) {
            let rmData: RemoteData = this.items[i];
            if ((rmData.id === key) || rmData.id.substring(0, rmData.id.indexOf('-')) === key) {
                return this.items[i];
            }
        }
        // Se non esiste nella collezione la wilcard la aggiungo
        if (key === '^') {
            let res = <any>this.remoteDataFactory.newObject();
            let ret = <RemoteData>res;
            ret.id = "^";
            this.items.push(ret);
            return res;
        }


        return null;
    }


    public GetItemByPropValue(prop: string,val:string): T {

        let i = 0;
        for (; i < this.items.length; i++) {
            let rmData: RemoteData = this.items[i];
            if (rmData[prop] === val) {
                return this.items[i];
            }
        }

        return null;
    }

    public RemovItemByKey(key: string): boolean {
        let i = 0;
        for (; i < this.items.length; i++) {
            let rmData: RemoteData = this.items[i];
            if ((rmData.id === key) || rmData.id.substring(0, rmData.id.indexOf('-')) === key) {
                this.items.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public RemovAllItemy(): boolean {
        this.items.splice(0, this.items.length);
        return true;
    }


    public RemoveItemByLastKey(key: string): boolean {
        let i = 0;
        for (; i < this.items.length; i++) {
            let rmData: RemoteData = this.items[i];
            if ((rmData.id === key) || rmData.id.substring(rmData.id.lastIndexOf('-') + 1, rmData.id.length) === key) {
                this.items.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public GetItemByLastKey(key: string): T {
        let i = 0;
        for (; i < this.items.length; i++) {
            let rmData: RemoteData = this.items[i];
            if ((rmData.id === key) || rmData.id.substring(rmData.id.lastIndexOf('-') + 1, rmData.id.length) === key) {
                return this.items[i];
            }
        }
        return null;
    }

    // Length of the collection
    public Count() { return this.items.length; }

    // Add an object to the collection
    public Add(item: T): T;
    public Add(item?: T, key?: string, dummy?: string): T {
        if (key !== null && key !== undefined && key !== "")
            this.items.push([key, item]);
        else
            this.items.push(item);
        return item;
    }


    addByKey(item: T, key: string) {
        if (key !== null && key !== undefined && key !== "")
            this.items.push([key, item]);
        else
            this.items.push(item);

    }

    // Delete an object from the collection
    public Delete(itemIndex: number) {
        this.items.splice(itemIndex, 1);
    }

    // Find the index of a given object in a collection
    public IndexOfItem(obj: T, fromIndex?: number): number {
        if (fromIndex == null) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.items.length + fromIndex);
        }
        for (var i = fromIndex, j = this.items.length; i < j; i++) {
            if (this.items[i] === obj)
                return i;
        }
        return -1;
    }
}

class RemoteLinkedCollection<T> extends RemoteCollection<T> {
    constructor(classStorageName: string, id?: string, remoteDataFactory?: IRemoteDataFactory) {
        super(classStorageName, id, remoteDataFactory);

    } 
} 


class RemoteServer extends Backbone.Model {

    constructor() {
        super();
        this.initialize(urlBackbone);
    }
    initialize(url) {
        this.url = url;
    }

    public getDirsList(database: string, instance: string, virtualPath: string, page: number, itemsPerPage: number, orderBy: string);
    public getDirsList(database: string, instance: string, virtualPath: string, page: number, itemsPerPage: number, orderBy: string, filter?: string);
    public getDirsList(database: string, instance: string, virtualPath: string, page: number, itemsPerPage: number, orderBy: string, filter?: string, dummy?: any): any {
        //static finally command = "";
        var command: string = "readDirList";
        if (filter === undefined)
            filter = '';

        super.fetch(
            {
                async: false,
                data: { database: database, instance: instance, virtualPath: virtualPath, action: command, page: page, itemsPerPage: itemsPerPage, orderBy: orderBy, filter: filter, session: RemoteData.session },
                success: (() => this.fetchedSuccessfully()),

                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }
            });

        return this.attributes;
    }

    public getDataBlock(process:string, filter: string): any {
        //static finally command = "";
        let command: string = "getDataBlock";


        super.fetch(
            {
                async: false,
                data: { action: command, process: process, filter: filter, session: RemoteData.session },
                success: (() => this.fetchedSuccessfully()),
                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }
            });

        return this.attributes;
    }

    public getData(data: Object, action :string): any {
 
        data['action'] = action;
        data['session'] = RemoteData.session;


        super.fetch(
            {
                async: false,
                data: data,
                success: (() => this.fetchedSuccessfully()),
                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }
            });

        return this.attributes;
    }



    public getFoto(key: string, database: string, instance: string): any {
        //static finally command = "";
        let command: string = "getFoto";


        super.fetch(
            {
                async: false,
                data: { action: command, key: key, database: database, instance: instance, session: RemoteData.session },
                success: (() => this.fetchedSuccessfully()),
                error: function (model, response) {
                    RemoteData.onHTTPError(response.responseText);
                }
            });

        return this.attributes;
    }

    private fetchedSuccessfully() {
        

    }
    private fetchedWithErrors(e: any) {
    }


}

function getURL(url) {
    url = urlBackbone + '?' + url;
    return $.ajax({
        type: "GET",
        url: url,
        cache: false,
        async: false
    }).responseText;
}

function loadjscssfile(filename, filetype) {
    let fileref;
    if (filetype == "js") { //if filename is a external JavaScript file
        fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype == "css") { //if filename is an external CSS file
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
}

