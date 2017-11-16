import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController,LoadingController, NavParams, MenuController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import 'rxjs/Rx'

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage implements OnInit {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private _auth: AuthProvider,
    private _loading: LoadingController,
    public menu: MenuController) {
      menu.enable(true);
      this._auth.getUser().take(1).subscribe(user => {
        this.currentUser = user;
      })
  }

  currentUser;

  ngOnInit() {
    this.menu.enable(true);
    
    this._auth.isAuthenticated.subscribe((isIt)=> {
      return isIt? this.navCtrl.setRoot('DashboardPage'): this.navCtrl.setRoot('LoginPage');
    })

  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad DashboardPage');
  }


  SignOut() {
    const loading = this._loading.create({
      content: 'Signing Out..'
    });

    loading.present();
    this._auth.signOut().subscribe((user)=> {
      console.log(user);
      this._auth.storageControl('set', 'user', user);
      this.menu.close();
      this.navCtrl.goToRoot(null);
      setTimeout(() => {
        loading.dismiss();
      }, 300)
    });

  }

}
