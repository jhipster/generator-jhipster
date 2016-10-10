import { Directive, ElementRef, Input, Renderer, TemplateRef } from '@angular/core';


@Directive({
  selector: '[jhiTranslate]',
  exportAs: 'jhiTranslate'
})
export class JhiTranslate {

  private _jhiTranslate: string | TemplateRef<any>;

  constructor(private el: ElementRef, private renderer: Renderer) { }

  @Input()
  set jhiTranslate(value: string | TemplateRef<any>) {
      this._jhiTranslate = value;
      this.setTranslatedValue();
  }

  setTranslatedValue() {
    if (this._jhiTranslate ) {
        if ( this._jhiTranslate != 'err-no-translation-found') {
            this.el.nativeElement.innerHTML = this._jhiTranslate;
        }
      }
  }

}
