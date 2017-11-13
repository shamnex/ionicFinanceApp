import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DashboardPage } from '../dashboard/dashboard';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app'

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage(
  { name: 'RegisterPage' }
)
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  loginPage: any;
  dashPage: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _fb: FormBuilder,
    public alertCtrl: AlertController,
    private afAuth: AngularFireAuth
  ) {
    this.dashPage = "DashboardPage"
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }
  ngOnInit(): void {
    this.registerForm = this._fb.group({
      name:["", Validators.required],
      email:["", Validators.required],
      password:["", Validators.required],
      confirmPassword:["", Validators.required]
    })
  }

  display(alertTitle, alertSub) {
    let theAlert = this.alertCtrl.create({
      title:alertTitle,
      subTitle: alertSub,
      buttons: ['OK']
    });
    theAlert.present();
  }
  submit() {
  }
}
