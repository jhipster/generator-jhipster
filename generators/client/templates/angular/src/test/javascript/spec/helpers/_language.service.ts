import {SpyObject} from "./spyobject";
import {<%=jhiPrefixCapitalized%>LanguageService} from "ng-jhipster";

export class MockLanguageService extends SpyObject {

    constructor(){
        super(<%=jhiPrefixCapitalized%>LanguageService)
    }

    init() {

    }

    changeLanguage(languageKey:string){

    }

    setLocations(locations:string[]) {

    }

    addLocation(location:string) {

    }

    reload() {

    }

    getCurrent():Promise<any> {
        return Promise.resolve('<%= nativeLanguage %>');
    }
}
