export interface IRemoteData {


    fetchData():void;
    fetchData(id?: string); 
    fetchData(id?: string, virtualPath?: string):void;
    fetchData(id?: string, virtualPath?: string, page?: number):void; 
    
    getDbfsRows(): string;
    save(): void;
    setPrimaryKey(key: string): void;
    fetchCommand(cmd: string[]);




}