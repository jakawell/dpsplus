import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule, MatSidenavModule, MatCardModule, MatProgressSpinnerModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSnackBarModule, MatSelectModule, MatTableModule, MatIconModule, MatAutocompleteModule, MatDialogModule, MatCheckboxModule } from '@angular/material';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { DataService, DpsPlusService, StorageService } from './shared/services';
import { PokemonInputComponent } from './shared/components/pokemon-input/pokemon-input.component';
import { DocsComponent } from './docs/docs.component';
import { SettingsComponent } from './settings/settings.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'docs', component: DocsComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PokemonInputComponent,
    DocsComponent,
    SettingsComponent
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
    MatDialogModule,
    MatCheckboxModule,
  ],
  entryComponents: [
    SettingsComponent,
  ],
  providers: [
    DataService,
    DpsPlusService,
    StorageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
