import { SpyObject } from './spyobject';
import { JhiLanguageService } from 'ng-jhipster';

export class MockLanguageService extends SpyObject {

    constructor() {
        super(JhiLanguageService);
    }

    init() {}

    changeLanguage(languageKey: string) {}

    setLocations(locations: string[]) {}

    addLocation(location: string) {}

    reload() {}

    getCurrent(): Promise<any> {
        return Promise.resolve('<%= nativeLanguage %>');
    }
}
