import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, DatabaseQuery, AngularFireList } from 'angularfire2/database';
import * as firebase from 'firebase/app'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


import "rxjs/Rx"


import { Storage } from "@ionic/storage";
import { AlertController } from 'ionic-angular';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

export interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn?: boolean;
  fingerprint?: string;
  
}

@Injectable()
export class AuthProvider {
  
  user$: BehaviorSubject<any> = new BehaviorSubject(null);
  users: AngularFireList<any>;
  isAuthenticated = new Subject<boolean>();
  constructor(
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private _storage: Storage,
    private _db: AngularFireDatabase,
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

  get user (): Observable<User> {
    return this.user$.asObservable();
  }

  setUser(user) {
    this.user$.next(user);
  }

  getUser(userId?: string): Observable<any> {
    if(this.isAuthenticated) {
      let user: User;
      return this._db.object('users')
        .valueChanges().take(1).switchMap(res => {
          user = res[userId];
          return Observable.of(user)
        })
        
    }
  }

  saveUser(user) {
    const payload= {
      user: user.name,
      email: user.email,
      isLoggedIn: true,
      id: user.id,
    }
    
    const promise = this.users.push(payload);
    Observable.fromPromise(promise)
      .switchMap(res => {
        this.setUser(payload);
        return this.storageControl('set', 'user', payload)
      });
  }

  updateUser(user: User): Observable<any> {

    console.log(user);
    user.isLoggedIn = true;
    this.storageControl('set', 'user', user);
    const promise = this._db.object('users/' + user.id).update(user);
    return Observable.fromPromise(promise)
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
    const promise: Promise<any> = this.afAuth.auth
    .createUserWithEmailAndPassword(user.email, user.password);
    return Observable.fromPromise(promise);
  }

  getUserStorage():Observable<any> {
    const promise = this.storageControl('get', 'user');
    return Observable.fromPromise(promise);
  }

  signin(action, user){
    if(action === "fingerprint") { 
      this.getUserStorage().switchMap(user => {
        return this.getUser(user.uid)});
    }
    const promise = this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
    return Observable.fromPromise(promise).switchMap(res => this.getUser(res.uid));
  }
  

  signOut(): Observable<any> {
    let user: User;
    return this.getUserStorage().switchMap(res => {
      user = res;
      user.isLoggedIn = false;
      const promise: Promise<any> = this._db
        .object('/users/' + user.id).
        update(user);
      return Observable.fromPromise(promise)
    })
    .switchMap(() => Observable.of(user));
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

}
