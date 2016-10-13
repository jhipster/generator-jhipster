import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {
    transform(value: Array<any>, predicate: string, reverse:boolean): any {
        value = value.slice(0).sort((a, b) => {
            if (a[predicate] < b[predicate]) {
                return -1;
            } else if ([b[predicate] < a[predicate]]) {
                return 1;
            } else {
                return 0;
            }
        });

        if(reverse) value.reverse();

        return value;
    }
}
