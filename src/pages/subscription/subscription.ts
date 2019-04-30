import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams, Platform} from "ionic-angular";
import {ApiQuery} from "../../library/api-query";
import {HomePage} from "../home/home";
import {InAppPurchase} from "@ionic-native/in-app-purchase";
import {Http} from "@angular/http";
import {Page} from "../page/page";
import {InAppBrowser} from "@ionic-native/in-app-browser";

/**
 * Generated class for the SubscriptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-subscription',
    templateUrl: 'subscription.html',
})
export class SubscriptionPage {

    public products: any = [];
    public dataPage : any;
    public platform: any = 'ios';

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public plt: Platform,
                public http: Http,
                public iab: InAppBrowser,
                public iap: InAppPurchase,
                public api: ApiQuery) {

        this.getPage();

        this.getRestore();

        //this.navCtrl.push(HomePage);
    }

    goto(product){
        let browser = this.iab.create(product.url,'_blank');

        let that = this;

        let checkStatus = setInterval(
            function(){
                console.log('is paying' + that.api.isPaying);
                if(that.api.isPaying == 1) {
                    clearInterval(checkStatus);
                    console.log('close browser 1');
                    setTimeout(
                        function () {
                            console.log('close browser 2');
                            browser.close();
                        }, 10000
                    )
                }
            }, 3000);
    }

    getPage() {
        this.http.get(this.api.url + '/user/subscriptions', this.api.setHeaders(true)).subscribe(data => {

            this.products = data.json().subscription.payments;
            this.dataPage = data.json().subscription;
            console.log(this.products);
            this.api.hideLoad();
        });
        //this.goto('https://m.kosherdate.co.il/subscription/?&userId=' + val);



        if (this.plt.is('android')) {
            this.platform = 'android';

        } else {

            this.platform = 'ios';


            this.products = ['kosherdate.oneWeek','kosherdate.oneMonth', 'kosherdate.threeMonths','kosherdate.sixMonths', 'kosherdate.oneYear'];

            this.iap
                .getProducts(['kosherdate.oneWeek','kosherdate.oneMonth', 'kosherdate.threeMonths','kosherdate.sixMonths', 'kosherdate.oneYear'])
                .then((products) => {
                    products.forEach(product => {

                        if(product.productId == 'kosherdate.oneWeek'){
                            product.id = 0;
                            product.title = 'מנוי שבועי מתחדש קשרדייט';
                            product.description = 'מנוי מתחדש כל שבוע המאפשר לך לקרוא הודעות ללא הגבלה';
                        }
                        if(product.productId == 'kosherdate.oneMonth'){
                            product.id = 1;
                            //product.title = 'חודשי מתחדש';
                            product.title = 'מנוי חודשי מתחדש קשרדייט';
                            product.description = 'מנוי מתחדש כל חודש המאפשר לך לקרוא הודעות ללא הגבלה';
                        }
                        if(product.productId == 'kosherdate.threeMonths'){
                            product.id = 2;
                            product.title = 'מנוי תלת חודשי מתחדש קשרדייט';
                            product.description = 'מנוי מתחדש כל 3 חודשים המאפשר לך לקרוא הודעות ללא הגבלה';
                        }
                        if(product.productId == 'kosherdate.sixMonths'){
                            product.id = 3;
                            product.title = 'מנוי חצי שנתי מתחדש קשרדייט';
                            product.description = 'מנוי מתחדש כל 6 חודשים המאפשר לך לקרוא הודעות ללא הגבלה';
                        }
                        if(product.productId == 'kosherdate.oneYear'){
                            product.id = 4;
                            product.title = 'מנוי שנתי מתחדש קשרדייט';
                            product.description = 'מנוי מתחדש כל שנה המאפשר לך לקרוא הודעות ללא הגבלה';
                        }

                        this.products[product.id] = product;
                    });

                    //alert(JSON.stringify(this.products));

                    //this.products = products;
                })
                .catch((err) => {
                    console.log('this.iap' + JSON.stringify(err));
                });
        }

    }

    page(pageId) {
        this.navCtrl.push(Page, {pageId: pageId});
    }

    getRestore(){
        var that = this;
        this.iap.restorePurchases().then(function (data) {
            //this.restore = data;
            console.log(data);
            /*
             [{
             transactionId: ...
             productId: ...
             state: ...
             date: ...
             }]
             */

            var purchase = {};

            var timestemp = 0;

            for (var id in data) {

                var dateProd = new Date(data[id].date).getTime();

                if(dateProd > timestemp){

                    timestemp = dateProd;

                    purchase = data[id];
                }
            }

            that.sendSubscribe(purchase);
        }).catch(function (err) {
            console.log('getRestore' + JSON.stringify(err));
        });
    }

    subscribe(product) {

        let monthsNumber;

        switch(product.productId){
            case 'kosherdate.oneWeek':
                 monthsNumber = 0.5;
                break;

            case 'kosherdate.oneMonth':
                 monthsNumber = 1;
                break;

            case 'kosherdate.threeMonths':
                 monthsNumber = 3;
                break;

            case 'kosherdate.sixMonths':
                 monthsNumber = 6;
                break;

            case 'kosherdate.oneYear':
                 monthsNumber = 12;
                break;
        }
        this.iap
            .subscribe(product.productId)
            .then((data)=> {
                if(parseInt(data.transactionId) > 0){
                    //this.api.presentToast('Congratulations on your purchase of a paid subscription to richdate.co.il', 10000);
                    this.http.post(this.api.url + '/user/subscription/monthsNumber:' + monthsNumber, data, this.api.setHeaders(true)).subscribe(data => {
                        this.navCtrl.push(HomePage);
                    }, err => {
                        console.log('this.iap.subscribe ajax' + JSON.stringify(err));
                    });
                }
                this.api.hideLoad();
            })
            .catch((err)=> {
                console.log('this.iap.subscribe' + JSON.stringify(err));
                this.api.hideLoad();
            });
    }

    sendSubscribe(history){
        this.http.post(this.api.url + '/user/restore', JSON.stringify(history), this.api.setHeaders(true)).subscribe(data => {
            if(data.json().payment == 1) {
                this.navCtrl.push(HomePage);
            }
        });
    }

    ionViewDidLoad() {
        this.api.pageName = 'SubscriptionPage';
        console.log('ionViewDidLoad SubscriptionPage');
    }

}
