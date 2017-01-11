import { Directive, ElementRef, Input, Renderer, OnInit } from '@angular/core';
import { Principal } from './principal.service';

@Directive({
    selector: '[<%=jhiPrefix%>HasAuthority]'
})
export class HasAuthorityDirective implements OnInit {

    @Input() <%=jhiPrefix%>HasAuthority: string;
    authority: string;

    constructor(private principal: Principal, private el: ElementRef, private renderer: Renderer) {
    }

    ngOnInit() {
        this.authority = this.<%=jhiPrefix%>HasAuthority.replace(/\s+/g, '');

        if (this.authority.length > 0) {
            this.setVisibilityAsync();
        }
        this.principal.getAuthenticationState().subscribe(identity => this.setVisibilitySync());
    }

    private setVisibilitySync() {
      if (this.principal.hasAnyAuthority([this.authority])) {
        this.setVisible();
      } else {
        this.setHidden();
      }
    }

    private setVisible () {
        this.renderer.setElementClass(this.el.nativeElement, 'hidden-xs-up', false);
    }

    private setHidden () {
        this.renderer.setElementClass(this.el.nativeElement, 'hidden-xs-up', true);
    }

    private setVisibilityAsync () {
        this.principal.hasAuthority(this.authority).then(result => {
            if (result) {
                this.setVisible();
            } else {
                this.setHidden();
            }
        });
    }
}
