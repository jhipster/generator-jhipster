import { TranslateLoader } from 'ng2-translate/ng2-translate';
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";

export class TranslatePartialLoader implements TranslateLoader {
    private locations: string[];

    constructor(private http: Http, private prefix: string = 'i18n', private suffix: string = ".json") {
    }

    public setLocations(locations: string[]) {
        this.locations = locations;
    }

    public getTranslation(lang: string): Observable<any> {
        var combinedObject = new Object();
        var oldObsevers;
        var newObserver;
        this.locations.forEach((value) => {
            newObserver = this.getPartFile(value, combinedObject, lang);
            if (oldObsevers == null) {
                oldObsevers = newObserver;
            }
            else {
                oldObsevers = oldObsevers.merge(newObserver);
            }
        });
        return oldObsevers;
    }

    private getPartFile(part, combinedObject, lang: string) {
        return Observable.create(observer => {
            this.http.get(`${this.prefix}/${lang}/${part}${this.suffix}`).subscribe((res) => {
                let responseObj = res.json();
                Object.keys(responseObj).forEach(key=>{
                    combinedObject[key] = responseObj[key];
                });
                observer.next(combinedObject);
                //call complete to close this stream (like a promise)
                observer.complete();
            });
        });
    }
}

export function createTranslatePartialLoader() {
    return {
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslatePartialLoader(http, 'i18n', '.json'),
        deps: [Http]
    }
}
