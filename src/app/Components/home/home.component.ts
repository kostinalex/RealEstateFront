import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('mapRef', { static: true }) mapElement: ElementRef;
  searchWord = '';
  constructor() {}

  ngOnInit(): void {
    //43.879706541362246, -79.02653983220056
    let sat = { lat: 43.879706541362246, lon: -79.02653983220056 };
    this.renderMap(sat.lat, sat.lon);
  }
  loadMap(lat, lon) {
    //
    var map = new window['google'].maps.Map(this.mapElement.nativeElement, {
      center: { lat: lat, lng: lon },
      zoom: 15,
    });

    var pin = new window['google'].maps.Marker({
      position: { lat: lat, lng: lon },
      map: map,
      title: 'Some real estate',
      draggable: false,
      animation: window['google'].maps.Animation.DROP,
    });
  }

  renderMap(lat, lon) {
    window['initMap'] = () => {
      this.loadMap(lat, lon);
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
    if (this.searchWord != '') {
      console.log('searchWord=', this.searchWord);
    }
  }
}
