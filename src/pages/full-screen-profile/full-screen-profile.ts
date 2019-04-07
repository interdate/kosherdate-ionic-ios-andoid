import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { ApiQuery } from '../../library/api-query';
import { Http } from '@angular/http';

/**
 * Generated class for the FullScreenProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-full-screen-profile',
  templateUrl: 'full-screen-profile.html',
})
export class FullScreenProfilePage {

  user:any;
  myId:any;
  defurl:any; 

  constructor(public toastCtrl:ToastController,
              public navCtrl:NavController,
              public navParams:NavParams,
              public http:Http,
              public api:ApiQuery) {

      this.user = navParams.get('user');

      this.api.storage.get('user_id').then((val) => {

          if (val) {
              this.myId = val;
          }
      });
  }

  goBack() {
      console.log('test');
      this.navCtrl.pop();
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad FullScreenProfilePage');
  }


  toDialog(user) {
      this.navCtrl.push('DialogPage', {
          user: user
      });
  }

    addFavorites(user) {

        if (user.isAddFavorite == false) {
            user.isAddFavorite = true;

            let params = JSON.stringify({
                list: 'Favorite'
            });

            let url = this.api.url + '/user/managelists/favi/1/' + this.user.userId;

        } else {
            user.isAddFavorite = false;

            let params = JSON.stringify({
                list: 'Unfavorite'
            });

            let url = this.api.url + '/user/managelists/favi/0/' + this.user.userId;
        }

        this.http.post(url, params, this.api.setHeaders(true)).subscribe(data => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            toast.present();
            //this.events.publish('statistics:updated');
        });
    }

  addLike(user) {
      user.isAddLike = true;
      let toast = this.toastCtrl.create({
          message: ' עשית לייק ל' + user.username,
          duration: 2000
      });

      toast.present();

      let params = JSON.stringify({
          toUser: user.id,
      });

      this.http.post(this.api.url + '/api/v1/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
          console.log(data);
      }, err => {
          console.log("Oops!");
      });
  }

  ionViewWillEnter() {
      this.api.pageName = 'FullScreenProfilePage';
  }

}
