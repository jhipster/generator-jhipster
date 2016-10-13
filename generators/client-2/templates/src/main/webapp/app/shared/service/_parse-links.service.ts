import { Injectable } from '@angular/core';

@Injectable()
export class ParseLinks {

    parse(header: string) {
        if (header.length === 0) {
            throw new Error('input must not be of zero length');
        }

        // Split parts by comma
        let parts: string[] = header.split(',');
        let links: any = {};
        // Parse each part into a named link
        parts.forEach( (p) => {
            let section: string[] = p.split(';');
            if (section.length !== 2) {
                throw new Error('section could not be split on ";"');
            }
            let url: string = section[0].replace(/<(.*)>/, '$1').trim();
            let queryString: any = {};
            url.replace(
                new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
                ($0, $1, $2, $3) => { return queryString[$1] = $3; }
            );
            let page: any = queryString.page;
            if ( typeof page === "string") {
                page = parseInt(page);
            }
            let name: string = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = page;
        });
        return links;
    }
}
