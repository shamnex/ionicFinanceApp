import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider, User } from '../../providers/auth/auth';
import { AlertController } from 'ionic-angular';


import { FingerprintAIO, FingerprintOptions } from "@ionic-native/fingerprint-aio";
import { Observable } from 'rxjs/Observable';
import "rxjs/Rx"



/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  regPage: any = 'RegisterPage';
  @ViewChild('passwordInput') passwordInput: ElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private _fb: FormBuilder,
    private _auth: AuthProvider,
    private _alertCtrl: AlertController,
    private _loading: LoadingController,
    private _fingerPrint: FingerprintAIO
  ) {

    this.loginForm = this._fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required]
    })


  }

  user;
  
  initFingerprint(){
    this._auth.storageControl('get', 'user').then((user) => {
      this.showFingerprint(user, this.fingerprintOptions(user));
    })
  }
  
  fingerprintOptions(user): FingerprintOptions {
    return  {
      clientId: user.email,
      clientSecret: user.id,
      disableBackup: true
    }
  }
  ionViewDidLoad() {
  }

  ngOnInit() {

    this.user = this._auth.user;
    const passInput: HTMLInputElement = this.passwordInput.nativeElement;
    const emailControl = this.loginForm.get('email');
    this._auth.storageControl('get', 'user').then(res => {
      if (res !== null) {
        emailControl.setValue(res.email)
        passInput.onfocus = () => {
          emailControl.value === res.email ? this.initFingerprint() : null
        };
      }
    })
  }
  
  // prompt() {
  //   let alert = this._alertCtrl.create({
  //     title: 'Finge Print',
  //     message: 'Use Fingerprint to sign in next time',
  //     buttons: [
  //       {
  //         text: 'Yes',
  //         role: 'cancel',
  //         handler: () => {

  //         }
  //       },
  //       {
  //         text: 'No',
  //         handler: () => {
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }


  async showFingerprint(user, options) {
    try {
      await this.platform.ready();
      const available = await this._fingerPrint.isAvailable();
      console.log(available);
      if (available === "OK") {
        const result = await this._fingerPrint.show(options);
        const fingerprint = result.withFingerprint;
        this.submit('finger');
      }
    }
    catch (e) {
      console.log(e)
    }
  }


  submit(action?) {
    const loading = this._loading.create({
      content: 'Signing you in...'
    });
    loading.present();
    const signInPayLoad = this.loginForm.getRawValue();

        this._auth.signin(action?action:"password", signInPayLoad)
        .switchMap(user=> {
          console.log(user);
          return this._auth.updateUser(user).withLatestFrom()
        }).subscribe(()=> {
            loading.dismiss();
          this.navCtrl.setRoot('DashboardPage');
           
        },err => {
          loading.dismiss();
          this._auth.displayAlt('Error', err);
          });
  }
  gotoReg() {
    this.navCtrl.push('RegisterPage');
  }
}
