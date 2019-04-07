import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Http} from '@angular/http';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

/**
 * Generated class for the ActivationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-activation',
  templateUrl: 'activation.html',
})
export class ActivationPage {

  form: { errorMessage: any, res: any, description: any, success: any, submit: any, phone: { label: any, value: any }, code: { label: any, value: any } } =
  {
      errorMessage: '',
      res: false,
      description: '',
      success: '',
      submit: false,
      phone: {label: '', value: ''},
      code: {label: '', value: ''}
  };

  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              public navParams: NavParams,
              public api: ApiQuery,
              public http: Http) {

      this.getForm();
  }

  getForm(data = '') {

      let loading = this.loadingCtrl.create({
          content: 'אנא המתן...'
      });

      loading.present();

      this.http.post(this.api.url + '/api/v1/activations', data, this.api.setHeaders(true)).subscribe(resp => {
          this.form = resp.json().form;
          this.form.res = resp.json().code;
          this.form.errorMessage = resp.json().errorMessage;

          loading.dismiss();

          if (this.form.res) {
              this.api.status = 'login';
              this.api.setStorageData({label: 'status', value: 'login'});
              //this.navCtrl.push(RegistrationFourPage, {new_user: resp.json().register_end_button});
              this.navCtrl.push(HomePage);
          }

      }, err => {
          this.navCtrl.push(LoginPage);
      });
  }

  formSubmit() {
      let params = '';
      if (this.form.submit == 'Activate') {
          params = JSON.stringify({
              code: this.form.code.value
          });
      } else {
          params = JSON.stringify({
              phone: this.form.phone.value
          });
      }
      this.getForm(params);
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad ActivationPage');
  }

}
