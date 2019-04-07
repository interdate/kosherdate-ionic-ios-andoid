import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams, LoadingController, ToastController, Platform} from "ionic-angular";
import {HomePage} from "../home/home";
import {ApiQuery} from "../../library/api-query";
import {Storage} from "@ionic/storage";
import {FingerprintAIO} from "@ionic-native/fingerprint-aio";
import {Http, Headers, RequestOptions, Response} from "@angular/http";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import {RegisterPage} from "../register/register";
import * as $ from "jquery";

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
export class LoginPage {

    form: { errors: any, login: any } = {errors: {}, login: {username: {label: ''}, password: {label: ''}}};
    errors: any;
    header: RequestOptions;
    user: any = {id: '', name: ''};
    fingerAuth: any;
    enableFingerAuth: any;
    disableFingerAuthInit: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public api: ApiQuery,
                public storage: Storage,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                private faio: FingerprintAIO,
                private platform: Platform) {

        this.http.get(api.url + '/user/form/login/', api.setHeaders(false)).subscribe(data => {
            this.form = data.json();

            this.storage.get('fingerAuth').then((val) => {
                this.faio.isAvailable().then(result => {
                    if (val.status) {
                        this.fingerAuth = true;
                    }
                });
            });

            this.storage.get('username').then((username) => {
                this.form.login.username.value = username;
                this.user.name = username;
            });

           /* this.storage.remove('fingerAuth');
             this.storage.remove('enableFingerAuth');
             this.storage.remove('disableFingerAuthInit');*/



        });

        this.storage = storage;

        if (navParams.get('page') && navParams.get('page')._id == "logout") {

            this.api.setHeaders(false, null, null);
            // Removing data storage
            this.storage.remove('status');
            this.storage.remove('password');
            this.storage.remove('user_id');
            this.storage.remove('user_photo');
        }

        if(navParams.get('error')){
            this.errors = '';//navParams.get('error');
        }
    }

    formSubmit() {
        this.form.login.username.value = this.user.name;
        let username = encodeURIComponent(this.form.login.username.value);
        let password = encodeURIComponent(this.form.login.password.value);

        //alert(encodeURIComponent(this.form.login.username.value));

        if (username == "") {
            username = "nologin";
        }

        if (password == "") {
            password = "nopassword";
        }


        this.http.post(this.api.url + '/user/login/', '', this.setHeaders()).map((res: Response) => res.json()).subscribe(data => { //.map((res: Response) => res.json())


            setTimeout(function () {
                this.errors = 'משתמש זה נחסם על ידי הנהלת האתר';
            }, 300);

            this.validate(data);

        }, err => {
            //console.log(err.status);
            this.errors = err.text();
        });
    }

    checkBlur(){
        setTimeout(function () {
            $('.btn-focus').show();
        },10);
    }

    checkFocus(){
        setTimeout(function () {
            $('.btn-focus').hide();
        },10);
    }

    setHeaders() {
        let myHeaders: Headers = new Headers;
        myHeaders.append('Content-type', 'application/json');
        myHeaders.append('Accept', '*/*');
        myHeaders.append('Access-Control-Allow-Origin', '*');
        myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.form.login.username.value) + ':' + encodeURIComponent(this.form.login.password.value)));

        this.header = new RequestOptions({
            headers: myHeaders
        });
        return this.header;
    }

    fingerAuthentication() {

        this.faio.show({
            clientId: 'com.interdate.kosherdate',
            //clientSecret: 'password', //Only necessary for Android
            clientSecret: 'password', //Only necessary for Android
            disableBackup:true,  //Only for Android(optional)
            localizedFallbackTitle: 'Use Pin', //Only for iOS
            localizedReason: 'כניסה לשידייט באמצעות טביעת אצבע' //Only for iOS
        })
            .then((result: any) => {
                if (result) {

                    this.storage.get('fingerAuth').then((val) => {


                        if (val.status) {
                            this.form.login.username.value = val.username;
                            this.form.login.password.value = val.password;
                            this.formSubmit();
                        }
                    });

                }
            })
            .catch((error: any) => console.log(error));

    }
    validate(response) {
        if (response.status != "not_activated") {
            this.storage.set('username', this.form.login.username.value);
            this.storage.set('password', this.form.login.password.value);
            this.storage.set('status', response.status);
            this.storage.set('user_id', response.id);
            this.storage.set('user_photo', response.photo);

            this.api.setHeaders(true, this.form.login.username.value, this.form.login.password.value);
        }
        if (response.status == "login") {
            let data = {
                status: 'init',
                username: this.form.login.username.value,
                password: this.form.login.password.value
            };

            this.storage.set('fingerAuth', data);

            this.storage.set('user_photo', response.photo);
            this.navCtrl.setRoot(HomePage, {
                params: 'login',
                username: this.form.login.username.value,
                password: this.form.login.password.value
            });

        } else if (response.status == "no_photo") {
            this.user.id = response.id;

            let toast = this.toastCtrl.create({
                message: response.texts.photoMessage,
                showCloseButton: true,
                closeButtonText: 'אישור'
            });

            toast.present();
            this.navCtrl.push('RegistrationPage', {
                user: this.user,
                username: this.form.login.username.value,
                password: this.form.login.password.value
            });
        } else if (response.status == "not_activated") {
            let toast = this.toastCtrl.create({
                message: response.texts.notActiveMessage,
                showCloseButton: true,
                closeButtonText: 'אישור'
            });
            toast.present();
            this.navCtrl.push(LoginPage);
        }

        this.storage.get('deviceToken').then((deviceToken) => {
            this.api.sendPhoneId(deviceToken);
        });
    }

    onRegistrationPage() {
        this.navCtrl.push(RegisterPage);
    }

    onPasswordRecoveryPage() {
        this.navCtrl.push('PasswordRecoveryPage');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }

    ionViewWillEnter() {
        this.api.pageName = 'LoginPage';
        $('.back-btn').hide();
    }

}
