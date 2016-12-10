import { Directive, ElementRef, Input, Renderer, OnInit } from '@angular/core';
import { Principal } from './principal.service';

@Directive({
    selector: '[has-authority]'
})
export class HasAuthorityDirective implements OnInit {

    @Input('has-authority') hasAuthority: string;
    authority: string;
    element: any;

    constructor(private principal: Principal, el: ElementRef, private renderer: Renderer) {
        this.element = $(el.nativeElement);
    }

    ngOnInit() {
        this.authority = this.hasAuthority.replace(/\s+/g, '');

        if (this.authority.length > 0) {
            this.defineVisibility(true);

            //TODO this needs to be migrated
            /*scope.$watch(function() {
                return Principal.isAuthenticated();
            }, function() {
                defineVisibility(true);
            });*/
        }
    }

    private setVisible () {
        this.element.removeClass('hidden');
    }

    private setHidden () {
        this.element.addClass('hidden');
    }

    private defineVisibility (reset) {

        if (reset) {
            this.setVisible();
        }

        this.principal.hasAuthority(this.authority).then(result => {
            if (result) {
                this.setVisible();
            } else {
                this.setHidden();
            }
        });
    }
}
