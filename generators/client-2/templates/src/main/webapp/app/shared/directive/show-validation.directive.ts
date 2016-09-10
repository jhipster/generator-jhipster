import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({ selector: 'form[show-validation]' })
export class ShowValidation {
    constructor(el: ElementRef, renderer: Renderer) {
       $(el.nativeElement).find('.form-group').each(function() {
           var $formGroup = $(this);
           var $inputs = $formGroup.find('input[ng-model],textarea[ng-model],select[ng-model]');

           if ($inputs.length > 0) {
               $inputs.each(function() {
                   var $input = $(this);
                   //TODO this logic needs to be adapted
                   /*scope.$watch(function() {
                       return $input.hasClass('ng-invalid') && $input.hasClass('ng-dirty');
                   }, function(isInvalid) {
                       $formGroup.toggleClass('has-error', isInvalid);
                   });*/
               });
           }
       });
    }
}
