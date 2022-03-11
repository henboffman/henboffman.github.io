export class LocalStorageService{
    public getKey(key:string){
        return localStorage.getItem(key);
    }

    public setKey(key:string, value:any){
        localStorage.setItem(key, JSON.stringify(value));
    }
}