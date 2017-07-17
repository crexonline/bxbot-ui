import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {AppComponent} from "../../app.component";
import {BotDataPromiseService} from "./bot-data-promise.service";
import {Bot} from "./bot.model";

// Don't forget this else you get runtime error:
// zone.js:355 Unhandled Promise rejection: this.http.get(...).toPromise is not a function
import 'rxjs/add/operator/toPromise';

/**
 * HTTP implementation of the Bot Data Service.
 *
 * It demonstrates use of Promises in call responses.
 *
 * We chain the toPromise operator to the Observable result of http.get. It converts the Observable into a Promise
 * which is passed back to the caller.
 *
 * Converting to a promise is a good choice when asking http.get to fetch a single chunk of data - when we receive the
 * data, we're done. A single result in the form of a promise is easy for the calling component to understand/consume.
 *
 * @author gazbert
 */
@Injectable()
export class BotHttpDataPromiseService implements BotDataPromiseService {

    private botUrl = AppComponent.REST_API_BASE_URL + 'bots';
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {
    }

    getBots(): Promise<Bot[]> {
        return this.http.get(this.botUrl)
            .toPromise()
            .then(response => response.json().data as Bot[])
            .catch(this.handleError);
    }

    getBot(id: string): Promise<Bot> {
        return this.http.get(this.botUrl + '/' + id)
            .toPromise()
            .then(response => response.json().data as Bot)
            .catch(this.handleError);
    }

    update(bot: Bot): Promise<Bot> {
        const url = `${this.botUrl}/${bot.id}`;
        return this.http
            .put(url, JSON.stringify(bot), {headers: this.headers})
            .toPromise()
            .then(response => response.json().data as Bot)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}