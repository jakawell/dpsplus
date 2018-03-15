import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule, MatSidenavModule, MatCardModule, MatProgressSpinnerModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSnackBarModule, MatSelectModule, MatTableModule, MatIconModule, MatAutocompleteModule } from '@angular/material';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { DataService } from './shared/services/data.service';
import { DpsPlusService } from './shared/services/dpsplus.service';
import { PokemonInputComponent } from './shared/components/pokemon-input/pokemon-input.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PokemonInputComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    FlexLayoutModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  providers: [
    DataService,
    DpsPlusService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
