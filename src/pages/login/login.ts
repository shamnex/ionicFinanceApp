import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider, User } from '../../providers/auth/auth';
import { AlertController } from 'ionic-angular';


import { FingerprintAIO, FingerprintOptions } from "@ionic-native/fingerprint-aio";
import { Observable } from 'rxjs/Observable';


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
  fingerprintOptions: FingerprintOptions
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



  ionViewDidLoad() {
  }

  ngOnInit() {
    const emailControl = this.loginForm.get('email');
    this._auth.storageControl('get', 'user').then(res => {
      if (res !== null) {
        emailControl.setValue(res.email)
        const passInput: HTMLInputElement = this.passwordInput.nativeElement;
        passInput.onfocus = () => {

          if (emailControl.value === res.email) {
            this._auth.storageControl('get', 'user').then((user) => {
              const fingerprintOptions: FingerprintOptions = {
                clientId: user.email,
                clientSecret: user.id,
                disableBackup: true
              }

              this.showFingerprint(user, fingerprintOptions);
            })
          }
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
  //         text: 'Buy',
  //         handler: () => {
  //           console.log('Buy clicked');
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
        this.submit();
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  submit() {
    // const loading = this._loading.create({
    //   content: 'Signing you in...'
    // });
    // loading.present();
    // const signInPayLoad = this.loginForm.getRawValue();
    // this._auth.signin("password", signInPayLoad)
    // .switchMap(
    //   (user: User) =>{ console.log(user); return this._auth.updateUser(user)})
    //   .subscribe(()=> {
    //     this.navCtrl.push('DashboardPage');
    //   }, error => {
    //     loading.dismiss();
    //     this._auth.displayAlt('Error', error);
        
    //   });

    const loading = this._loading.create({
      content: 'Signing you in...'
    });
    loading.present();
    const signInPayLoad = this.loginForm.getRawValue();
    this._auth.signin("password", signInPayLoad)
      .switchMap(user=> {
        return this._auth.updateUser(user)
      }).catch(err => {
        loading.dismiss();
        this._auth.displayAlt('Error', err);
        return Observable.throw(err);
        }).take(1).subscribe(()=> {
          loading.dismiss();
        this.navCtrl.push('DashboardPage');
      });
     
  }
  gotoReg() {
    this.navCtrl.push('RegisterPage');
  }
}
