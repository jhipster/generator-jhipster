<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'findLanguageFromKey'})
export class FindLanguageFromKeyPipe implements PipeTransform {
    private languages: any = {
        'ca': { name: 'Català' },
        'cs': { name: 'Český' },
        'da': { name: 'Dansk' },
        'de': { name: 'Deutsch' },
        'el': { name: 'Ελληνικά' },
        'en': { name: 'English' },
        'es': { name: 'Español' },
        'et': { name: 'Eesti' },
        'fa': { name: 'فارسی', rtl: true },
        'fr': { name: 'Français' },
        'gl': { name: 'Galego' },
        'hu': { name: 'Magyar' },
        'hi': { name: 'हिंदी' },
        'hy': { name: 'Հայերեն' },
        'it': { name: 'Italiano' },
        'ja': { name: '日本語' },
        'ko': { name: '한국어' },
        'mr': { name: 'मराठी' },
        'nl': { name: 'Nederlands' },
        'pl': { name: 'Polski' },
        'pt-br': { name: 'Português (Brasil)' },
        'pt-pt': { name: 'Português' },
        'ro': { name: 'Română' },
        'ru': { name: 'Русский' },
        'sk': { name: 'Slovenský' },
        'sr': { name: 'Srpski' },
        'sv': { name: 'Svenska' },
        'ta': { name: 'தமிழ்' },
        'th': { name: 'ไทย' },
        'tr': { name: 'Türkçe' },
        'ua': { name: 'Українська' },
        'vi': { name: 'Tiếng Việt' },
        'zh-cn': { name: '中文（简体）' },
        'zh-tw': { name: '繁體中文' }
    };
    transform(lang: string): string {
        return this.languages[lang].name;
    }
    <%_ if (enableI18nRTL) { _%>
    isRTL(lang: string): boolean {
        return this.languages[lang].rtl;
    }
    <%_ } _%>
}
