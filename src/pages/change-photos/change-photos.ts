import {Component} from "@angular/core";
import {
    IonicPage,
    NavController,
    NavParams,
    ActionSheetController,
    AlertController,
    LoadingController
} from "ionic-angular";
import {Camera} from "@ionic-native/camera";
import {FileTransfer} from "@ionic-native/file-transfer";
import {ImagePicker} from "@ionic-native/image-picker";
import {ApiQuery} from "../../library/api-query";
import {Http} from "@angular/http";
import {Storage} from "@ionic/storage";
import {HomePage} from "../home/home";
import {LoginPage} from "../login/login";


/**
 * Generated class for the ChangePhotosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-change-photos',
    templateUrl: 'change-photos.html',
    providers: [Camera, FileTransfer, ImagePicker]
})
export class ChangePhotosPage {

    image: any;
    photos: any;
    userNotActivated: any;
    imagePath: any;
    username: any = false;
    password: any = false;
    new_user: any = false;
    gender: any;
    dataPage: { noPhoto: any, texts: any, images: Array<{ _id: string, items: {}, url: string, imgValidated: string, main: string}> };
    description: any;

    constructor(public actionSheetCtrl: ActionSheetController,
                public navCtrl: NavController,
                public navParams: NavParams,
                public alertCtrl: AlertController,
                public http: Http,
                public api: ApiQuery,
                public storage: Storage,
                public loadingCtrl: LoadingController,
                public camera: Camera,
                public  fileTransfer: FileTransfer,
                public imagePicker: ImagePicker) {

        if (navParams.get('new_user')) {
            this.new_user = 1;
            this.api.storage.set('new_user', 1);
        }
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });

        this.storage.get('new_user').then((val) => {
            if (val) {
                this.new_user = val;
            } else {
                this.new_user = false;
            }
        });

        if (navParams.get('username') && navParams.get('password')) {
            this.password = navParams.get('password');
            this.username = navParams.get('username');
        }

        this.getPageData();
        this.image = navParams.get('images');
    }

    delete(photo) {
        let confirm = this.alertCtrl.create({
            title: 'האם למחוק את התמונה?',
            buttons: [
                {
                    text: 'לא',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                }, {
                    text: 'כן',
                    handler: () => {
                        this.postPageData('deleteImage', photo);
                    }
                }
            ]
        });
        confirm.present();
    }


    getCount(num) {
        return parseInt(num) + 1;
    }

    getPageData() {

        this.http.get(this.api.url + '/user/images', this.api.setHeaders(true, this.username, this.password)).subscribe(data => {

            this.dataPage = data.json();
            this.description = data.json().texts.description;
            this.photos = data.json().images.items;
            this.gender = data.json().gender;
            this.userNotActivated = data.json().userNotActivated;

        }, err => {
            //alert(JSON.stringify(err));
        });
    }

    getPage(id) {
        this.navCtrl.push('TermsPage', {id: id});
    }

    postPageData(type, params) {//not active
        var data: any;
        if (type == 'setMain') {
            var action = "setMain";
            console.log('Param', params);
            data = JSON.stringify({setMain: params.id});

        } else if ('deletePage') {
            var action = "delete";
            data = JSON.stringify({
                //delete: params.id
            });
        }

        this.http.post(this.api.url + '/user/images/' + action + '/' + params.id, data, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {

            if (type != 'setMain') {
                this.dataPage = data.json();
            } else {
                this.dataPage.images = data.json().images;
            }
            this.photos = data.json().images.items;
            this.getPageData();
        }, err => {
            console.log("Oops!");
        });
    }

    edit(photo) {

        let mainOpt = [];

        if (photo.main == 0) {

            mainOpt.push({
                    text: 'קבע כראשית',
                    icon: 'contact',
                    handler: () => {
                        this.postPageData('setMain', photo);
                    }
                }
            );
        }

        mainOpt.push({
            text: this.dataPage.texts.delete,
            role: 'destructive',
            icon: 'trash',
            handler: () => {
                this.delete(photo);
            }
        });
        mainOpt.push({
            text: this.dataPage.texts.cancel,
            role: 'destructive',
            icon: 'close',
            handler: () => {
                console.log('Cancel clicked');
            }
        });

        var status = photo.isValid == 1 ?
            this.dataPage.texts.approved : this.dataPage.texts.waiting_for_approval;

        let actionSheet = this.actionSheetCtrl.create({
            title: this.dataPage.texts.edit_photo,

            subTitle: this.dataPage.texts.status + ': ' + status,

            buttons: mainOpt
        });
        actionSheet.present();
    }

    add() {

        let actionSheet = this.actionSheetCtrl.create({
            title: this.dataPage.texts.add_photo,
            buttons: [
                {
                    text: this.dataPage.texts.choose_from_camera,
                    icon: 'aperture',
                    handler: () => {
                        this.openCamera();
                    }
                }, {
                    text: this.dataPage.texts.choose_from_gallery,
                    icon: 'photos',
                    handler: () => {
                        this.openGallery();
                    }
                }, {
                    text: this.dataPage.texts.cancel,
                    role: 'destructive',
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    openGallery() {

        let options = {
            maximumImagesCount: 1,
            width: 600,
            height: 600,
            quality: 100
        };

        this.imagePicker.getPictures(options).then(
            (file_uris) => {
                this.uploadPhoto(file_uris[0]);
            },

            (err) => {
                //alert(JSON.stringify(err))
            }
        );
    }

    openCamera() {
        let cameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            saveToPhotoAlbum: true,
            chunkedMode: true,
            correctOrientation: true
        };

        this.camera.getPicture(cameraOptions).then((imageData) => {
            this.uploadPhoto(imageData);
        }, (err) => {
            console.log(err);
        });
    }

    safeHtml(el): any {
        let html = this.description;
        let div: any = document.createElement('div');

        return html.innerHTML;

    }

    uploadPhoto(url) {

        let loading = this.loadingCtrl.create({
            content: 'אנא המתן...'
        });

        loading.present();

        this.storage.get('user_id').then((val) => {

            let options = {
                fileKey: "photo",
                fileName: 'test.jpg',
                chunkedMode: false,
                mimeType: "image/jpg",
                headers: {Authorization: "Basic " + btoa(encodeURIComponent(this.username) + ":" + this.password)}/*@*/
            };

            const filetransfer = this.fileTransfer.create();

            filetransfer.upload(url, this.api.url + '/user/image', options).then((entry) => {
                this.navCtrl.push(ChangePhotosPage, {});
                loading.dismiss();
            }, (err) => {
                loading.dismiss();
            });
        });
    }

    onHomePage() {

        this.http.get(this.api.url + '/user/images', this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
            this.userNotActivated = data.json().userNotActivated;
            if(this.userNotActivated == 1 && this.gender == 1) {
                this.storage.remove('new_user');
                this.api.hideLoad();
                this.api.setHeaders(false, null, null);
                // Removing data storage
                this.storage.remove('status');
                this.storage.remove('password');
                this.storage.remove('user_id');
                this.storage.remove('user_photo');

                let text = "תודה שנרשמתם לאתר קשרים! " + "<br>" +
                    "כעת נשלח לדואל עימו נרשמתם מייל עם קישור לאקטיבציה של החשבון שלכם." + "<br>" +
                    "יש ללחוץ על הקישור במייל כדי להפעיל את חשבונכם." + "<br>" +
                    "במידה ואינכם מוצאים מייל זה, בדקו את תיבת ההודעות החסומות שלכם.";

                let alert = this.alertCtrl.create({
                    subTitle: text,
                    buttons: ['סגור']
                });

                alert.present();

                this.navCtrl.setRoot(LoginPage, ''/*{error:err['_body']}*/);
                this.navCtrl.popToRoot();
            }else{
                this.storage.remove('new_user');
                this.navCtrl.push(HomePage);
            }

        }, err => {
            //alert(JSON.stringify(err));
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ChangePhotosPage');
    }

    ionViewWillEnter() {
        this.api.pageName = 'ChangePhotosPage';
    }
}
