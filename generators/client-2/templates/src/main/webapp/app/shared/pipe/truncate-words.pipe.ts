import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'truncateWords'})
export class TruncateWordsPipe implements PipeTransform  {        

    transform(input: string, words: number): string {
        if (isNaN(words)) {
            return input;
        }
        if (words <= 0) {
            return '';
        }
        if (input) {
            let inputWords = input.split(/\s+/);
            if (inputWords.length > words) {
                input = inputWords.slice(0, words).join(' ') + '...';
            }
        }

        return input;
    }
}
