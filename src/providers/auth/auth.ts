import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import * as firebase from 'firebase/app'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/debounceTime";

import { Storage } from "@ionic/storage";
import { AlertController } from 'ionic-angular';
import { BehaviorSubject } from "rxjs/BehaviorSubject";


@Injectable()
export class AuthProvider {

  users: AngularFireList<any>;
  isAuthenticated = new Subject<boolean>();
  constructor(
    public http: HttpClient,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private _storage: Storage,
    private _db: AngularFireDatabase
  ) {
    this.users = _db.list('users/')
    afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.isAuthenticated.next(true)
      } else {
        this.isAuthenticated.next(false)
      }
    })
  }

  displayAlt(alertTitle, alertSub) {
    let theAlert = this.alertCtrl.create({
      title: alertTitle,
      subTitle: alertSub,
      buttons: ['OK']
    });
    theAlert.present();
  }


  signup(user) {
    const promise: Promise<any> = this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
    return Observable.fromPromise(promise);
  }

  signin(user) {
    const promise = this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
    return Observable.fromPromise(promise);
  }


  storageControl(action, key?, value?) {
    if (action === "set") {
      return this._storage.set(key, value);
    }
    if (action === "get") {
      return this._storage.get(key);
    }
    if (action === "delete") {
      if (!key) {
        this.displayAlt('Warning', 'About to delete all user data');
        return this._storage.clear();
      }
      this.displayAlt(key, "Delete this users data");
      return this._storage.remove(key);
    }
  }

  saveNewUser(user) {
    const promise = this.users.push(user);
    Observable.fromPromise(promise)
      .subscribe(res => {
        let userObject: any = {
          name: user.name,
          email: user.email
        }
        userObject.id = res.uid;
        this.activeUser$.next(userObject);
        return this.storageControl('set', 'user', userObject)
      }, error => {

      });
  }

  updateUser(user, id: string) {
    let userObject: any = {
      id: user.uid,
      email: user.email,
      isLoggedIn: true
    }
    const promise: Promise<any> = this._db.object('/users/' + id).update(userObject);
    Observable.fromPromise(promise).subscribe(
      (res: Object) => {
        this.activeUser$.next(userObject);
        return this.storageControl('set', 'user', userObject)
      }, error => {

      });
  }

  signOut(): Observable<any>{
    
    const user= this.activeUser$.getValue();
    user.isLoggedIn = false;
    user.name = 'shamnex1'
    console.log(user);
    const promise: Promise<any> = this._db
      .object('/users/' + user.id).
        update(user);
     return Observable.fromPromise(promise)
        .switchMap(()=> Observable.of(user));
       
  }

  activeUser$: BehaviorSubject<any> = new BehaviorSubject(null);
  getActiveUser(user?): Observable<any> {
    if (user) {
      console.log('user payload')
      this.activeUser$.next(user);
      return Observable.of(user);
    }else {
      console.log('no user payload')  
      let firebaseUser;
      return this.isAuthenticated.switchMap(x => {
        if (x === true) { 
       firebaseUser = firebase.auth().currentUser;
        const promise = this.storageControl('get', 'user');
          return Observable.fromPromise(promise)
         }
      }).switchMap((user)=> {
        const userObj  = {
          email: firebaseUser.email,
          id: firebaseUser.uid,
          isLoggedIn: user.isLoggedIn
        }  
        this.activeUser$.next(userObj);
        return Observable.of(userObj);
      })
    }
  }
}
