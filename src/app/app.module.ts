import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AngularFireDatabaseModule } from "angularfire2/database";
import { AngularFireModule} from "angularfire2"
import { AngularFireAuthModule } from "angularfire2/auth";
import { LoginPageModule } from '../pages/login/login.module';
import { ReactiveFormsModule } from '@angular/forms';

export const firebaseConfigg = {
  apiKey: "AIzaSyCDAHorj-wCdDopRZbszLCDKbquuc0OSfs",
  authDomain: "bankingworld-16792.firebaseaapp.com",
  databaseURL: "https://bankingworld-16792.firebaseio.com",
  storageBucket:"bankingworld-16792.appspot.com",
  messagingSenderId: '716104656358'

}

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfigg),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    LoginPageModule, 
    ReactiveFormsModule,


  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
