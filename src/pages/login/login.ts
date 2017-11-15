import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

import { FingerprintAIO, FingerprintOptions } from "@ionic-native/fingerprint-aio";


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
    private _loading: LoadingController,
    private _alertCtrl: AlertController,
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
    const passControl = this.loginForm.get('password');
    const emailControl = this.loginForm.get('email');

    this._auth.storageControl('get', 'user').then(res => {
      if (res !== null) {
        emailControl.setValue(res.email)
        const passInput: HTMLInputElement = this.passwordInput.nativeElement;
        passInput.onfocus = () => {

          if (emailControl.value === res.email) {
            console.log('use fingerprint');
          }
        };
      }
    })
  }

  async showFingerprint() {
    try {
      await this.platform.ready();
      const available = await this._fingerPrint.isAvailable();
      console.log(available);
    }
    catch (e) {
      console.log(e)
    }
  }

  submit() {

    const loading = this._loading.create({
      content: 'Signing you in...'
    });

    loading.present();

    const user = this.loginForm.getRawValue();
    this._auth.signin(user).subscribe(
      res => {
        const userId = res.uid
        this._auth.updateUser(res, userId);

        this.navCtrl.push('DashboardPage');
        loading.dismiss();

      },
      error => {
        this._auth.displayAlt('Error', error);
        loading.dismiss();
      });
  }
  gotoReg() {
    this.navCtrl.push('RegisterPage')
  }
}
