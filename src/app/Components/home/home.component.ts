import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { DataServiceService } from 'src/app/Services/data-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('mapRef', { static: true }) mapElement: ElementRef;
  @Output() public fileUploaded = new EventEmitter<any>();
  searchWord = '';
  postings;
  pins;
  showPosting = false;
  selectedPosting;
  cursorPosition = {
    x: 0,
    y: 0,
  };

  isActive = 'map';
  minPrice = 0;
  maxPrice = 0;

  constructor(public data: DataServiceService, private zone: NgZone) {}

  ngOnInit(): void {
    this.showPosting = false;
    this.data
      .getPostings({
        address: this.searchWord,
        minPrice: this.minPrice <= 0 ? 0 : this.minPrice,
        maxPrice: this.maxPrice <= 0 ? 999999999999999 : this.maxPrice,
      })
      .subscribe(
        (response) => {
          console.log('response', response);
          let error = response['error'];
          if (error != undefined) {
            alert(JSON.stringify(error));
          }

          this.postings = response['listings'];
          this.pins = this.postings.map((c) => ({
            Lat: +c.Latitude,
            Lon: +c.Longitude,
          }));
          //console.log('this.postings', this.postings);
          console.log('this.pins', this.pins);
          let sat = { lat: 43.879706541362246, lon: -79.02653983220056 };
          this.renderMap(sat.lat, sat.lon);
        },
        (error: HttpErrorResponse) => {}
      );
  }

  renderMap(lat, lon) {
    window['initMap'] = () => {
      var map = new window['google'].maps.Map(this.mapElement.nativeElement, {
        center: { lat: lat, lng: lon },
        zoom: 9,
      });

      for (let pin of this.pins) {
        var newPin = new window['google'].maps.Marker({
          position: { lat: +pin.Lat, lng: +pin.Lon },
          map: map,
          draggable: false,
          animation: window['google'].maps.Animation.DROP,
          clickable: true,
          // icon: {
          //   url: '/assets/pin.ico',
          //   scaledSize: new window['google'].maps.Size(50, 50),
          //   origin: new window['google'].maps.Point(0, 0),
          //   anchor: new window['google'].maps.Point(0, 0),
          // },
        });

        window['google'].maps.event.addListener(
          newPin,
          'mouseover',
          (event) => {
            this.zone.run(() => {
              setTimeout(() => {
                this.cursorPosition = { x: event.pixel.x, y: event.pixel.y };
                if (this.showPosting == false) {
                  this.cursorPosition = {
                    x: event.domEvent.clientX,
                    y: event.domEvent.clientY,
                  };
                  console.log('this.cursorPosition', this.cursorPosition);
                  console.log('event', event);
                  this.selectedPosting = this.postings.find(
                    (c) =>
                      +c.Latitude == event.latLng.toJSON().lat &&
                      +c.Longitude == event.latLng.toJSON().lng
                  );
                  console.log('this.selectedPosting', this.selectedPosting);

                  this.showPosting = true;
                }
              }, 100);
            });
          }
        );
        window['google'].maps.event.addListener(newPin, 'mouseout', (event) => {
          this.zone.run(() => {
            this.showPosting = false;
          });
        });
      }
    };

    var map = window.document.createElement('script');
    map.id = 'google-map-script';
    map.type = 'text/javascript';
    map.src =
      'https://maps.googleapis.com/maps/api/js?key=' +
      environment.googleApiKey +
      '&callback=initMap&libraries=&v=weekly';

    window.document.body.appendChild(map);
  }

  search() {
    this.ngOnInit();
  }

  showSelectedPosting() {
    this.isActive = 'posting';
  }

  goBack() {
    this.isActive = 'map';
  }
}
