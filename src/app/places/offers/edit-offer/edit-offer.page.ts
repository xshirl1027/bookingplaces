import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  LoadingController,
  AlertController,
  ModalController,
  IonDatetime
} from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { PlaceLocation } from '../../../places/location.model';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { MapModalService } from 'src/app/shared/map-modal/map-modal.service';
import { switchMap } from 'rxjs/operators';
import { ISODateString } from '@capacitor/core';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss']
})
export class EditOfferPage implements OnInit, OnDestroy, AfterViewInit {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  @ViewChild('dateFrom', { static: false }) private dateFrom: ElementRef<IonDatetime>;
  @ViewChild('dateTo', { static: false }) private dateTo: ElementRef<IonDatetime>;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngAfterViewInit(){

    // this.dateFrom.nativeElement.value = this.place.availableFrom.toISOString().toString();
    // this.dateTo.nativeElement.value = this.place.availableTo.toISOString().toString();
    
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(
          place => {
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              description: new FormControl(this.place.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)]
              }),
              price: new FormControl(this.place.price, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.min(1)]
              }),
              dateFrom: new FormControl(this.place.availableFrom.toISOString(), {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              dateTo: new FormControl(this.place.availableTo.toISOString(), {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              location: new FormControl(this.place.location, {
                updateOn: 'blur',
                validators: [Validators.required]
              })
            });
            this.isLoading = false;
          },
          error => {
            this.alertCtrl
              .create({
                header: 'An error occurred!',
                message: 'Place could not be fetched. Please try again later.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/places/tabs/offers']);
                    }
                  }
                ]
              })
              .then(alertEl => {
                alertEl.present();
              });
          }
        );
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      console.error("invalid form");
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Updating place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.place.title = this.form.value.title;
        this.place.availableFrom = new Date(this.form.value.dateFrom);
        this.place.availableTo = new Date(this.form.value.dateTo);
        this.place.price = this.form.value.price;
        this.place.location = this.form.value.location;
        this.place.description = this.form.value.description;
        console.log('edited place ' + this.place);
        this.placesService
          .updatePlace(
            this.place
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({ location: location });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
