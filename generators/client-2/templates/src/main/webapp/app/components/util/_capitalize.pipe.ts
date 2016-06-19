import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform  {        

    transform(input: string): string {
        if (input !== null) {
            input = input.toLowerCase();
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }
}
