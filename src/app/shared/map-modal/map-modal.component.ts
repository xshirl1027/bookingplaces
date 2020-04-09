import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, Output, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { MapModalService } from './map-modal.service';
@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', {static: null}) mapElementRef: ElementRef;
  @Input() center;
  @Input() selectable = true;
  @Input() closeButtonText="cancel";
  @Input() title = "Pick Location";

  googleMaps;
  clickListener;
  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2,
    private mapModalService: MapModalService) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.mapModalService.getGoogleGeoLocation().subscribe(resData => {
        if (!this.center) {
          if (!resData && !resData['location']) {
            console.error('Cannot get current location');
            return;
          }
          this.center = resData['location'];
        }
        console.log(resData);
        this.getGoogleMaps().then(googleMaps => {
          const mapEl = this.mapElementRef.nativeElement;
          const map = new googleMaps.Map(mapEl, {
            center: this.center,
            zoom: 16
          });

          this.googleMaps = googleMaps.event.addListenerOnce(map, 'idle', () => {
            this.renderer.addClass(mapEl, 'visible');
          });
          if (this.selectable) {
            this.clickListener = map.addListener('click', event => {
              this.center = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              };
              this.modalCtrl.dismiss(this.center);
            });
          } else {
          }
          const marker = new googleMaps.Marker({position: this.center, map, title: 'Picked Location'});
          marker.setMap(map);
        })
      .catch(err => {
        console.log(err);
      });
    });
  }

  onCancel() {
    this.modalCtrl.dismiss(this.center);
  }

  ngOnDestroy() {
    if(this.googleMaps && this.googleMaps.event && this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    };
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps sdk not available.');
        }
      }
    });
  }

}
