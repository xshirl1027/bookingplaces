import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';

@NgModule({
    entryComponents: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
    imports: [
        CommonModule,
        IonicModule
      ],
    declarations: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
    exports: [LocationPickerComponent, MapModalComponent, ImagePickerComponent]
})
export class SharedModule {}