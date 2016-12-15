import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'findLanguageFromKey'
})
export class FindLanguageFromKeyPipe implements PipeTransform {
    transform(lang: any, args: any[]): any {
        return {
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
            'sv': 'Svenska',
            'ta': 'தமிழ்',
            'tr': 'Türkçe',
            'zh-cn': '中文（简体）',
            'zh-tw': '繁體中文'
        }[lang];
    }
}
