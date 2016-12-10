import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ProdConfig } from './blocks/config/prod.config';
import { <%=angular2AppName%>AppModule } from './app.module';

ProdConfig();

platformBrowserDynamic().bootstrapModule(<%=angular2AppName%>AppModule);
