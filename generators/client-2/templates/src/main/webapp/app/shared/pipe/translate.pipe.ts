import { Pipe, PipeTransform } from '@angular/core';
//TODO dummy translate pipe
@Pipe({
    name: 'translate'
})
export class TranslatePipe implements PipeTransform {
    transform(input: any, filterValue: string, field: string): any {
        return input;
    }
}
