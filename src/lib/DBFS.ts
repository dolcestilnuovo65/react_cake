export class DBFSTable{

    name:string="";
    address:string="";
    columnElementsById=[];
    queryPath=[];
    currentPath:string="";
    lastPrimaryKey: number = 0;
    constructor(name) {
        this.address = name;
        this.name = name;
        this.currentPath = this.address;
        this.columnElementsById = new Array();
    }

    addElement(name, isPrimaryKey, isNull, value) {
        this.columnElementsById[this.columnElementsById.length] = new DBFSColumnElement(name, isPrimaryKey, isNull, this.columnElementsById.length, value);


    }

    commit_old() {
        var i = 0;
        var j = 0;
        var z = 0;
        var currentPath = this.address;
        var queryPath = []
	   for (i = 0; i < this.columnElementsById.length; i++)
            if (this.columnElementsById[i].isPrimaryKey) {
                queryPath[queryPath.length] = currentPath + "/" + this.columnElementsById[i].value;
                currentPath = currentPath + "/" + this.columnElementsById[i].value;

            }
            else { /* Devo andare all'indietro fino alla prima chiave primaria */



                /* Devo aggiungere il path all'ultima chiave primaria e a tutte le chiavi non primarie: in questo semplice modello si assume che le chiavi primarie 
                 siano in testa alla tabella 
                 1  Vorrei\acquistare\un appartamento\in provincia di Milano
                 2  Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano
                 3a Vorrei\acquistare\un appartamento\in provincia di Milano\con superfice compresa tra 40 e 80 mq	
                 3b Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con superfice compresa tra 40 e 80 mq
                 4a Vorrei\acquistare\un appartamento\in provincia di Milano\con prezzo compreso tra 40000 e 70000 euro
                 4b Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con prezzo compreso tra 40000 e 70000 euro
                 4c Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con superfice compresa tra 40 e 80 mq\con prezzo compreso tra 40000 e 70000 euro
                */



                /* Devo ciclare dalla chiave j alla fine attuale del vettore i-1 ? la primary key */
                var k = 0;
                var n = 0;
                var len = queryPath.length;
                /* Ciclo sugli elementi: ad ogni elemento a partire dalla primary key devo aggiungere tutte le combinazioni degli elementi		*/
                for (k = i - 1; k < len; k++)
                    /* Ciclo sulle colonne: devo aggiungere solo alla root della primary */
                    for (z = i; z < this.columnElementsById.length; z++) {
                        var found = false;
                        for (n = 0; n < queryPath[queryPath.length]; n++) {
                            if (queryPath[n] == queryPath[k] + "/" + this.columnElementsById[z].value)
                                found = true;
                            break;
                        }
                        if (!found)
                            queryPath[queryPath.length] = queryPath[k] + "/" + this.columnElementsById[z].value;
                    }





            }

        return queryPath;


    }

    commit() {
        var j = 0;
        var z = 0;


        if (this.columnElementsById[this.columnElementsById.length - 1].isPrimaryKey) {
            this.queryPath[this.queryPath.length] = this.currentPath + "/" + this.columnElementsById[this.columnElementsById.length - 1].value;
            this.currentPath = this.queryPath[this.queryPath.length - 1];
            this.lastPrimaryKey = this.queryPath.length - 1;
        }
        else { /* Devo andare all'indietro fino alla prima chiave primaria */



            /* Devo aggiungere il path all'ultima chiave primaria e a tutte le chiavi non primarie: in questo semplice modello si assume che le chiavi primarie 
             siano in testa alla tabella 
             1  Vorrei\acquistare\un appartamento\in provincia di Milano
             2  Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano
             3a Vorrei\acquistare\un appartamento\in provincia di Milano\con superfice compresa tra 40 e 80 mq	
             3b Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con superfice compresa tra 40 e 80 mq
             4a Vorrei\acquistare\un appartamento\in provincia di Milano\con prezzo compreso tra 40000 e 70000 euro
             4b Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con prezzo compreso tra 40000 e 70000 euro
             4c Vorrei\acquistare\un appartamento\in provincia di Milano\nel comune di Rozzano\con superfice compresa tra 40 e 80 mq\con prezzo compreso tra 40000 e 70000 euro
            */




            /* Devo ciclare dalla chiave j alla fine attuale del vettore i-1 ? la primary key */
            var k = 0;
            var n = 0;
            var len = this.queryPath.length;
            /* Ciclo sugli elementi: ad ogni elemento a partire dalla primary key: devo aggiungere tutte le combinazioni degli elementi	*/
            /* Devo */
            for (z = this.lastPrimaryKey; z < len; z++) {
                this.queryPath[this.queryPath.length] = this.queryPath[z] + "/" + this.columnElementsById[this.columnElementsById.length - 1].value;
            }





        }

        return this.queryPath;

    }

    removeLastElementAfter(tag, direct) {


        var colIdx = 0;
        if (direct)
            colIdx = this.columnElementsById.length - 2;
        else
            colIdx = this.columnElementsById.length - 1;

        for (; colIdx >= 0; colIdx--) {

            if (this.columnElementsById[colIdx].name == tag) {
                if (direct)
                    this.columnElementsById.splice(colIdx + 1, this.columnElementsById.length - 1 - colIdx);
                else
                    this.columnElementsById.splice(colIdx, this.columnElementsById.length - colIdx);

                return;
            }
        }

    }

    commitLoop() {
        var colIdx = 0;
        var z = 0;
        this.currentPath = this.address;
        this.queryPath = new Array();
        this.lastPrimaryKey = 0;
        for (colIdx = 0; colIdx < this.columnElementsById.length; colIdx++) {

            if (this.columnElementsById[colIdx].isPrimaryKey) {
                this.queryPath[this.queryPath.length] = this.currentPath + "/" + this.columnElementsById[colIdx].value;
                this.currentPath = this.queryPath[this.queryPath.length - 1];
                this.lastPrimaryKey = this.queryPath.length - 1;
            }
            else { /* Devo andare all'indietro fino alla prima chiave primaria */




                /* Devo ciclare dalla chiave j alla fine attuale del vettore i-1 ? la primary key */
                var k = 0;
                var n = 0;
                var len = this.queryPath.length;
                /* Ciclo sugli elementi: ad ogni elemento a partire dalla primary key: devo aggiungere tutte le combinazioni degli elementi	*/
                for (z = this.lastPrimaryKey; z < len; z++) {
                    /*var found=false;
                    for(n=0; n < this.queryPath[this.queryPath.length] ;n++){
                        if(this.queryPath[n] == this.queryPath[k] + "/" + this.columnElementsById[z].value)
                          found = true;
                          break;
                    }	  
                    if(!found) */
                    this.queryPath[this.queryPath.length] = this.queryPath[z] + "/" + this.columnElementsById[colIdx].value;
                }





            }
        }

        var txt = "";
        var i = 0;
        var array = [];
        var res = this.queryPath;
        for (i = 0; i < res.length; i++)
            array[i] = res[i] + ";";
        array = array.sort(function (a, b) {return a.split("/").length - b.split("/").length });
        array = array.sort(function (a, b) {return a.length - b.length });

        for (i = 0; i < res.length; i++)
            txt = txt + array[i];


        return txt;

    }







}

class DBFSColumnElement {

    name:string="";
    isPrimaryKey: boolean = false;
    isNull: boolean = false;
    idx: number = 0;
    value:string="";
    constructor(name, isPrimaryKey, isNull, idx, value) {
        this.name = name;
        this.isPrimaryKey = isPrimaryKey;
        this.isNull = isNull;
        this.idx = idx;
        this.value = value;
    }

}



 