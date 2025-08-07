import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveTableDocxtemplaterComponent } from './reactive-table-docxtemplater/reactive-table-docxtemplater.component';

@NgModule({
  declarations: [
    AppComponent,
    ReactiveTableDocxtemplaterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
