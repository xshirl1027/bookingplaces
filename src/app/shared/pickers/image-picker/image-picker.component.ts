import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Platform, ActionSheetController } from '@ionic/angular';
import {
  Plugins,
  Capacitor,
  CameraSource,
  CameraResultType
} from '@capacitor/core';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss']
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker', {static: false}) filePicker: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string>();
  @Input() selectedImage: string;
  usePicker: boolean = true;
  constructor(private platform: Platform, private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    if (this.platform.is("mobile") || this.platform.is("hybrid") || this.platform.is("desktop") ) {
      this.usePicker = true;
      console.log(this.selectedImage);
    }
  }

  onFileChosen(event) {
    const pickedFile = (event.target).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
    };
    fr.readAsDataURL(pickedFile);
  }

  onPickImage() {
    this.actionSheetCtrl
    .create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Choose from file',
          handler: () => {
            this.filePicker.nativeElement.click();
            return;
          }
        },
        {
          text: 'Take Picture',
          handler: () => {
            Plugins.Camera.getPhoto({
              quality: 50,
              source: CameraSource.Prompt,
              correctOrientation: true,
              height: 320,
              width: 200,
              resultType: CameraResultType.DataUrl
            }).then(image => {
                this.selectedImage = image.dataUrl;
                this.imagePick.emit(image.dataUrl);
              }).catch(error => {
                if (this.usePicker) {
                  this.filePicker.nativeElement.click();
                }
                return false;
              });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    });
  }
}
