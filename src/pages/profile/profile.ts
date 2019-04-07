import {Component, ViewChild} from "@angular/core";
import { NavController, NavParams, Nav, ToastController, Content, LoadingController} from "ionic-angular";
import {Http} from "@angular/http";
import {ApiQuery} from "../../library/api-query";
import {Storage} from "@ionic/storage";
declare var $: any;
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html',
})
export class ProfilePage {
    @ViewChild(Content) content: Content;
    @ViewChild(Nav) nav: Nav;

    isAbuseOpen: any = false;

    user: any = {};

    texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

    formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
    {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

    myId: any = false;

    imageClick: boolean = false;


    constructor(public toastCtrl: ToastController,
                public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public loadingCtrl: LoadingController,
                public api: ApiQuery,
                public storage: Storage) {

        this.storage = storage;

        let loading = this.loadingCtrl.create({
            content: 'אנא המתן...'
        });

        //loading.present();

        var user = navParams.get('user');

        if (user) {

            this.user = user;


            this.http.get(api.url + '/user/profile/' + this.user.id, api.setHeaders(true)).subscribe(data => {
                this.user = data.json();
                this.formReportAbuse = data.json().formReportAbuse;
                this.texts = data.json().texts;
                loading.dismiss();
                this.imageClick = true;
            });
        } else {

            this.storage.get('user_id').then((val) => {
                //alert(val);
                if (val) {
                    this.myId = val;
                    this.http.get(api.url + '/user/profile/' + this.myId, api.setHeaders(true)).subscribe(data => {
                        this.user = data.json();
                        this.formReportAbuse = data.json().formReportAbuse;
                        this.texts = data.json().texts;
                        loading.dismiss();
                        this.imageClick = true;
                    });
                }
            });
        }

    }

    setHtml(id, html) {
        if ($('#' + id).html() == '' && html != '') {
            let div: any = document.createElement('div');
            div.innerHTML = html;/*
            [].forEach.call(div.getElementsByTagName("a"), (a) => {
                var pageHref = a.getAttribute('onclick');
                if (pageHref) {
                    a.removeAttribute('onclick');
                    a.onclick = () => this.getPage(pageHref);
                }
            });*/
            $('#' + id).append(div);
        }
    }

    scrollToBottom() {
        this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 300);
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

    blockSubmit() {
        var action;
        if (this.user.isAddBlackListed == true) {
            this.user.isAddBlackListed = false;
            action = 'delete';
        } else {
            this.user.isAddBlackListed = true;
            action = 'create';
        }

        let params = JSON.stringify({
            list: 'BlackList',
            action: action
        });

        var act = this.user.isAddBlackListed == 1 ? 1 : 0;

        this.http.post(this.api.url + '/user/managelists/black/' + act + '/' + this.user.userId, params, this.api.setHeaders(true)).subscribe(data => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            toast.present();

        });
    }

    addLike(user) {
        user.isAddLike = true;
        let toast = this.toastCtrl.create({
            message: ' עשית לייק ל' + user.nickName,
            duration: 2000
        });

        toast.present();

        let params = JSON.stringify({
            toUser: user.userId,
        });


        this.http.post(this.api.url + '/user/like/' + user.userId, params, this.api.setHeaders(true)).subscribe(data => {
            console.log(data);
        }, err => {
            console.log("Oops!");
        });

    }

    fullPagePhotos() {

        //alert(JSON.stringify(this.user.photos[0].usr));

        if(this.user.photos[0].url != 'http://www.shedate.co.il/images/users/small/0.jpg') {
            this.navCtrl.push('FullScreenProfilePage', {
                user: this.user
            });
        }
    }

    toDialog(user) {
        this.navCtrl.push('DialogPage', {
            user: user
        });
    }

    reportAbuseShow() {
        this.isAbuseOpen = true;
        this.scrollToBottom();
    }

    reportAbuseClose() {
        this.isAbuseOpen = false;
        this.formReportAbuse.text.value = "";
    }

    abuseSubmit() {

        let params = JSON.stringify({
            text: this.formReportAbuse.text.value,
        });

        this.http.post(this.api.url + '/user/abuse/' + this.user.userId, params, this.api.setHeaders(true)).subscribe(data => {

            let toast = this.toastCtrl.create({
                message: 'הודעתך נשלחה בהצלחה להנהלת האתר',
                duration: 2000
            });

            toast.present();
        }, err => {
            console.log("Oops!");
        });
        this.reportAbuseClose();
    }

    ionViewDidLoad() {
        //console.log(this.user);
    }

    ionViewWillLeave() {
        $('.back-btn').hide();
    }

    ionViewWillEnter() {
        this.api.pageName = 'ProfilePage';
        $('.back-btn').show();
    }

}
