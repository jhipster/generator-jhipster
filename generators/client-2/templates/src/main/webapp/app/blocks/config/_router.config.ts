import { Injectable } from "@angular/core";
import { UIRouter, trace, Category, Transition } from "ui-router-ng2";
import { DEBUG_INFO_ENABLED } from "../../app.constants";
import { registerTransitionHooks } from "./register-transition-hooks";

@Injectable()
export class <%=jhiPrefixCapitalized%>RouterConfig {
    constructor(router: UIRouter) {

        if (DEBUG_INFO_ENABLED) {
            trace.enable(Category.TRANSITION);
            var vis = window['ui-router-visualizer'];
            vis.visualizer(router);
        }

        router.urlMatcherFactory.type('boolean', {
            decode: function(val: string): boolean { return val === '1' || val === 'true'; },
            encode: function(val: boolean) { return val ? '1' : '0'; },
            equals: function(a, b) { return this.is(a) && a === b; },
            is: function(val) { return [true,false].indexOf(val) >= 0; },
            pattern: /0|1|true|false/
        });

        registerTransitionHooks(router.transitionService);
    }
}
