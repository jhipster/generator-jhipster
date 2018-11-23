import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JhipsterSharedModule } from 'app/shared';
import { JhipsterMaterialModule } from 'app/material.module';
import { HOME_ROUTE, HomeComponent } from './';

@NgModule({
    imports: [JhipsterSharedModule, JhipsterMaterialModule, RouterModule.forChild([HOME_ROUTE])],
    declarations: [HomeComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JhipsterHomeModule {}
