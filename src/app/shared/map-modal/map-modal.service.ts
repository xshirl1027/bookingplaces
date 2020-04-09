import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable, observable } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlaceLocation, Coordinates } from '../../places/location.model';
import { Capacitor, Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
  })
export class MapModalService {
    constructor(private http: HttpClient, private alertCtrl: AlertController){}
    
    geoLocationReqBody = {
        "considerIp": "true",
        "wifiAccessPoints": [
          {
              "macAddress": "dc:a9:04:83:36:9c",
              "signalStrength": -43,
              "signalToNoiseRatio": 0
          }
        ]
      };


    getGoogleGeoLocation() {
      return this.http
          .post(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${environment.googleMapsAPIKey}`,
            {
              ...this.geoLocationReqBody
            }
          );
    }

    // getGeoLocation(): Coordinates {
    //     if (!Capacitor.isPluginAvailable('GeoLocation')) {
    //       this.alertCtrl.create({header: "Location Unavaiable", message: "GeoLocation is not available"});
    //       return;
    //     }
    //     const coordinates: Coordinates = Plugins.GeoLocation.getCurrentLocation().then((geoPosition) => {
    //       return {
    //         lat: geoPosition.coords.latitude,
    //         lng: geoPosition.coords.longitude
    //       };
    //     }).catch(err => {
    //       this.alertCtrl.create({header: "Location Error", message: "Error fetching Location"});
    //       console.error(err);
    //     });
    //     return coordinates;
    //   }

    getAddress(coord: PlaceLocation): Observable<string> {
        return this.http.get<any>(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.lat},${coord.lng}&key=${
                environment.googleMapsAPIKey
            }`).pipe(map(geoData => {
                if (!geoData || !geoData.results || geoData.results.length === 0) {
                    return;
                } else {
                    return geoData.results[0].formatted_address;
                }
            }));
    }

    getStaticMapImageURL(lat: number, lng: number, zoom: number) {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap&markers=color:red%7Clabel:S%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;
    }
}