import {Component} from "@angular/core";
import {Headers, RequestOptions, Http} from "@angular/http";
import {AlertController, LoadingController, Platform, ModalController, ToastController} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {DomSanitizer} from "@angular/platform-browser";
import {Geolocation} from "@ionic-native/geolocation";
import {Keyboard} from "@ionic-native/keyboard";


@Component({
    templateUrl: 'api.html'
})
export class ApiQuery {

    public err: any = {
        'notActivated' : "חשבונך טרם הופעל. אנא בדוק את הדוא\"ל שלך לצורך הפעלת החשבון"
    };
    public url: any;
    public header: RequestOptions;
    public response: any;
    public username: any;
    public password: any;
    public status: any = '';
    public back: any = false;
    public isPaying: any;
    public storageRes: any;
    public footer: any = true;
    public pageName: any = false;
    public loading: any;
    public signupData: {  username: any, password: any };

    constructor(public storage: Storage,
                public alertCtrl: AlertController,
                public http: Http,
                public toastCtrl: ToastController,
                public loadingCtrl: LoadingController,
                private sanitizer: DomSanitizer,
                private geolocation: Geolocation,
                public keyboard: Keyboard,
                public modalCtrl: ModalController,
                public plt: Platform) {
       //this.url = 'http://10.0.0.12:8100';
       this.url = 'http://localhost:8101';
        //this.url = 'http://m.kosherdate.co.il/api/v6/index.php';
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
    }

    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    clearLocalStorage() {
        this.setHeaders(false, null, null);
        // Removing data storage
        this.storage.remove('status');
        this.storage.remove('password');
        this.storage.remove('user_id');
        this.storage.remove('user_photo');
    }

    sendPhoneId(idPhone) {
        let data = JSON.stringify({deviceId: idPhone});
        let os = (this.plt.is('Android')) ? 'Android' : 'iOS';
        this.storage.get('username').then((username) => {
            this.storage.get('password').then((password) => {
                if(password) {
                    this.http.post(this.url + '/user/deviceId/OS:' + os, data, this.setHeaders(true, username, password)).subscribe(res => {
                        //alert('TEST: ' + JSON.stringify(res));
                    }, (error)=> {
                       // alert('Error: ' + JSON.stringify(error));
                    });
                }
            });
        });

    }

    presentToast(txt, duration = 3000) {
        let toast = this.toastCtrl.create({
            message: txt,
            duration: duration,
        });

        toast.present();
    }

    setUserData(data) {
        this.setStorageData({label: 'username', value: data.username});
        this.setStorageData({label: 'password', value: data.password});
    }

    /**
     *  Set User's Current Location
     */
    setLocation() {

        this.geolocation.getCurrentPosition().then((pos) => {
            var params = JSON.stringify({
                latitude: ''+pos.coords.latitude+'',
                longitude: ''+pos.coords.longitude+''
            });

            this.http.post(this.url + '/user/location', params, this.setHeaders(true)).subscribe(data => {
            });
        });
    }

    setStorageData(data) {
        this.storage.set(data.label, data.value);
    }

    showLoad(txt = 'אנא המתן...') {

        this.loading = this.loadingCtrl.create({
         content: txt
         });

         this.loading.present();
    }

    functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    hideLoad() {
        if (!this.isLoaderUndefined())
            this.loading.dismiss();
        this.loading = undefined;
    }

    isLoaderUndefined(): boolean {
        return (this.loading == null || this.loading == undefined);
    }

    getUserData() {
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
        return {username: this.username, password: this.password}
    }

    setHeaders(is_auth = false, username = false, password = false, register = "0") {

        if (username != false) {
            this.username = username;
        }

        if (password != false) {
            this.password = password;
        }

        let myHeaders: Headers = new Headers;

        myHeaders.append('Content-type', 'application/json');
        myHeaders.append('Accept', '*/*');
        myHeaders.append('Access-Control-Allow-Origin', '*');

        if (is_auth == true) {
            myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password)));
            /*@encodeURIComponent(this.username)*/
        }
        this.header = new RequestOptions({
            headers: myHeaders
        });
        return this.header;
    }

    ngAfterViewInit() {
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
    }
}
