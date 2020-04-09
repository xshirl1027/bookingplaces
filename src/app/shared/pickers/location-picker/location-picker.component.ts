import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { MapModalService } from '../../map-modal/map-modal.service';
import { PlaceLocation, Coordinates } from '../../../places/location.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() selectedLocationImage: string;

  constructor(
    private modalCtrl: ModalController,
    private mapModalService: MapModalService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {}

  pickedLocation: PlaceLocation = {address:null, staticMapImageUrl: null, lat: null, lng: null};
  isLoading: boolean = false;

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [{text: 'Auto-Locate', handler: () => {this.locateUsers();} },
                {text: 'Pick on Map', handler: () => {this.openMap();} },
                {text: 'cancel', role: 'cancel'}]
      }).then(actionSheetEl => {
        actionSheetEl.present();
    });

  }

  locateUsers() {
    this.mapModalService.getGoogleGeoLocation().subscribe(geoPosition => {
        if (!geoPosition && !geoPosition['location']) {
          this.alertCtrl.create({header: "Location Error", message: "Error fetching Location"}).then(alertEl => {
            alertEl.present();
          });
          return;
        }
        this.pickedLocation.lat = geoPosition['location'].lat;
        this.pickedLocation.lng = geoPosition['location'].lng;
        this.mapModalService.getAddress(this.pickedLocation).pipe(
          switchMap(address => {
          this.pickedLocation.address = address;
          return of(this.mapModalService.getStaticMapImageURL(this.pickedLocation.lat, this.pickedLocation.lng, 14));
        })).subscribe(staticImageUrl => {
          this.pickedLocation.staticMapImageUrl = staticImageUrl;
          this.selectedLocationImage = staticImageUrl;
          this.isLoading = false;
          this.locationPick.emit(this.pickedLocation);
        });
    });
  }

  openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData || !modalData.data) {
          return;
        }
        this.pickedLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };
        this.isLoading = true;
        this.mapModalService.getAddress(modalData.data).pipe(
          switchMap(address => {
          this.pickedLocation.address = address;
          return of(this.mapModalService.getStaticMapImageURL(this.pickedLocation.lat, this.pickedLocation.lng, 14));
        })).subscribe(staticImageUrl => {
          this.pickedLocation.staticMapImageUrl = staticImageUrl;
          this.selectedLocationImage = staticImageUrl;
          this.isLoading = false;
          this.locationPick.emit(this.pickedLocation);
        });
      });
      modalEl.present();
    });
  }
}
