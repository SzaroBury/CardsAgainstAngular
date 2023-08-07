import { Injectable } from '@angular/core';

@Injectable()
export class AppConfig 
{
    private _config: { [key: string]: string };
    
    constructor() 
    {
        this._config = 
        { 
            PathAPI: 'http://localhost:5105/api/' 
        };
    }

    get setting() : { [key: string]: string } 
    {
        return this._config;
    }

    get(key: string) 
    {
        return this._config[key];
    }
};