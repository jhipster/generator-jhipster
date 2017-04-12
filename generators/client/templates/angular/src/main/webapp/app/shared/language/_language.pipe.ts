<%#
 Copyright 2013-2017 the original author or authors.

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
        'ca': 'Català',
        'cs': 'Český',
        'da': 'Dansk',
        'de': 'Deutsch',
        'el': 'Ελληνικά',
        'en': 'English',
        'es': 'Español',
        'et': 'Eesti',
        'fr': 'Français',
        'gl': 'Galego',
        'hu': 'Magyar',
        'hi': 'हिंदी',
        'hy': 'Հայերեն',
        'it': 'Italiano',
        'ja': '日本語',
        'ko': '한국어',
        'mr': 'मराठी',
        'nl': 'Nederlands',
        'pl': 'Polski',
        'pt-br': 'Português (Brasil)',
        'pt-pt': 'Português',
        'ro': 'Română',
        'ru': 'Русский',
        'sk': 'Slovenský',
        'sr': 'Srpski',
        'sv': 'Svenska',
        'ta': 'தமிழ்',
        'th': 'ไทย',
        'tr': 'Türkçe',
        'vi': 'Tiếng Việt',
        'zh-cn': '中文（简体）',
        'zh-tw': '繁體中文'
    };
    transform(lang: string): string {
        return this.languages[lang];
    }
}
