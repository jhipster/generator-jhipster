import { Directive, ElementRef, Input, Renderer, OnInit } from '@angular/core';
import { Principal } from './principal.service';

@Directive({
    selector: '[<%=jhiPrefix%>HasAnyAuthority]'
})
export class HasAnyAuthorityDirective implements OnInit {

    @Input() <%=jhiPrefix%>HasAnyAuthority: string;
    authority: string[];

    constructor(private principal: Principal, private el: ElementRef, private renderer: Renderer) {
    }

    ngOnInit() {
        this.authority = this.<%=jhiPrefix%>HasAnyAuthority.replace(/\s+/g, '').split(',');

        if (this.authority.length > 0) {
            this.setVisibilitySync();
        }
        this.principal.getAuthenticationState().subscribe(identity => this.setVisibilitySync());
    }

    private setVisible () {
        this.renderer.setElementClass(this.el.nativeElement, 'hidden-xs-up', false);
    }

    private setHidden () {
        this.renderer.setElementClass(this.el.nativeElement, 'hidden-xs-up', true);
    }

    private setVisibilitySync () {

        let result = this.principal.hasAnyAuthority(this.authority);
        if (result) {
            this.setVisible();
        } else {
            this.setHidden();
        }
    }
}
