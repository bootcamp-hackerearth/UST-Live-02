import { Injectable } from "@angular/core";

@Injectable({providedIn: "root"})
export class ApiUrl{
    backend_url = '/api';
    //for running in localhost, change backend_url to 'http://localhost:8080'
}
