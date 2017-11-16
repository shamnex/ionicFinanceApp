import { Component, OnInit, AfterContentInit } from '@angular/core';
import { IonicPage, NavController,LoadingController, NavParams, MenuController } from 'ionic-angular';
import { AuthProvider, User } from '../../providers/auth/auth';
import 'rxjs/Rx'
import { Observable } from 'rxjs/Observable';

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
export class DashboardPage implements OnInit, AfterContentInit {

  ngAfterContentInit(): void {
    this.menu.enable(true, 'menu');
    
  }

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private _auth: AuthProvider,
    private _loading: LoadingController,
    public menu: MenuController) {
      menu.enable(true, 'menu');
      this._auth.getUser().take(1).subscribe(user => {
        this.currentUser = user;
      })
  }

  currentUser;
  user: Observable<User>

  ngOnInit() {
    
    this._auth.isAuthenticated.subscribe((isIt)=> {
      return isIt === false? this.navCtrl.setRoot('LoginPash'): false;
    })
this._auth.signin('finger').subscribe(x=> this.currentUser = x);

  //  this._auth.user$.subscribe(user => {
  //    console.log(user)
  //  });
    
  }

  openMenu() {
    this.menu.enable(true, 'menu');   
    this.menu.open()
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
