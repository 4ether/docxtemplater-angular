import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveTableDocxtemplaterComponent } from './reactive-table-docxtemplater/reactive-table-docxtemplater.component';

const routes: Routes = [
  { path: '', redirectTo: '/reactive-table', pathMatch: 'full' },
  { path: 'reactive-table', component: ReactiveTableDocxtemplaterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
