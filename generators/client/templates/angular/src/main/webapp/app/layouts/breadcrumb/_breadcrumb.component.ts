import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET } from '@angular/router';
import 'rxjs/add/operator/filter';

interface IBreadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: '<%=jhiPrefix%>-breadcrumb',
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {

  public breadcrumbs: IBreadcrumb[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    // subscribe to the NavigationEnd event
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {

      // set breadcrumbs
      let root: ActivatedRoute = this.activatedRoute.root;
      this.breadcrumbs = this.getBreadcrumbs(root);
    });
  }

  private getBreadcrumbs(route: ActivatedRoute, url= '', breadcrumbs: IBreadcrumb[]= []): IBreadcrumb[] {
    // get the child routes
    let children: ActivatedRoute[] = route.children;
    const BREADCRUMB_NAME = 'pageTitle';
    const BREADCRUMB_DISPLAY = 'breadcrumb';

    // iterate over each children
    if (children.length > 0) {
        for (let child of children) {
        // verify primary route
        if (child.outlet !== PRIMARY_OUTLET) {
            continue;
        }

        // get the route's URL segment
        let routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
        let display: boolean = !child.snapshot.data.hasOwnProperty(BREADCRUMB_DISPLAY) || child.snapshot.data[BREADCRUMB_DISPLAY];

        // verify the custom data property "breadcrumb" is specified on the route
        if (display && child.snapshot.data.hasOwnProperty(BREADCRUMB_NAME) && child.component !== undefined) {

            // append route URL to URL
            url += `/${routeURL}`;

            // add breadcrumb
            let breadcrumb: IBreadcrumb = {
            label: child.snapshot.data[BREADCRUMB_NAME],
            url: url
            };

            breadcrumbs.push(breadcrumb);
        }

        return this.getBreadcrumbs(child, url, breadcrumbs);
        }
    }

    return breadcrumbs;
  }

}
