import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { transform } from 'lodash';
import styles from './FlightTracker.module.css';
import * as d3 from 'd3';
import CoquimboURL from './Coquimbo.geojson';
import ValparaisoURL from './Valparaiso.geojson';
import AtacamaURL from './Atacama.geojson';
import Button from 'components/GeneralPurpose/Button/Button';
import TelescopeURL from './telescope.svg';
import { ReactComponent as Map } from './Map200.svg';

export default class MapFlightTracker extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    // didMount
  };

  componentWillUnmount = () => {};

  cordsPlaneInMap(latitude, longitude) {
    const width = 400;
    const height = 400;
    const projection = d3
      .geoMercator()
      .center([-70.73709442008416, -30.240476801377167])
      .scale(width * 13)
      .translate([width / 2, height / 2]);

    return projection([latitude, longitude]);
  }

  getRegionSvg() {
    const width = 500;
    const height = 500;
    const telescopeCoords = [-70.73709442008416, -30.240476801377167];

    const projection = d3
      .geoMercator()
      .center(telescopeCoords)
      .scale(width * 13) // scale; 13 - 200 km,  16.05 -160 km and 25.2 -100 km.
      .translate([width / 2, height / 2 + 15]);

    let geoGenerator = d3.geoPath().projection(projection);

    const url_coquimbo = CoquimboURL;
    const url_valparaiso = ValparaisoURL;
    const url_atacama = AtacamaURL;

    d3.json(url_coquimbo).then(function (Coquimbo) {
      d3.json(url_valparaiso).then(function (Valparaiso) {
        d3.json(url_atacama).then(function (Atacama) {
          d3.select('#TelescopeDiv #Paths').selectAll('*').remove();

          const svg = d3
            .select('#TelescopeDiv #Paths')
            .attr('width', width)
            .attr('height', height)
            .classed(styles.circle, true);

          Coquimbo.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .style('fill', '#2e3e47')
              .style('stroke', '#4c606a');
          });

          Atacama.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .style('fill', '#2e3e47')
              .style('stroke', '#4c606a');
          });

          Valparaiso.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .style('fill', '#2e3e47')
              .style('stroke', '#4c606a');
          });

          // first zone : 200 km area.
          // const long_lat_1 = [-69.72640645677438, -28.671508190008392,]
          // const coords_1 = projection(long_lat_1)
          // console.log(coords_1) //returns [364.65891235520394, 60.57129669433607]
          // const radius_1 = 221.42696271805653 with Euclidian distance.

          const mask = svg.append('mask').attr('id', 'Mask');
          mask.append('rect').attr('width', '500').attr('height', '500').attr('fill', 'white');
          mask
            .append('circle')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', ' 220') // this radius let encloses the last radius in map. For scales (222, 220).
            .attr('fill', 'black');

          svg
            .append('rect')
            .attr('mask', 'url(#Mask)')
            .classed(styles.rect, true)
            .attr('width', `${width}`)
            .attr('height', `${height}`);

          // second zone : 160 km area.
          // const long_lat_2 = [-69.79391230365658, -29.057079010258132]
          // const coords_2 = projection(long_lat_2)
          // console.log(coords_2) //returns [357.00061695433305, 110.5181751002815], [382.104607855159, 74.27436233534718]
          // const radius_2 = 175.79622153494552, 219.84341506903084 with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'middle_circle')
            .attr('cx', `${width / 2}`)
            .attr('cy', `${height / 2}`)
            .attr('r', '175.79622153494552')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // third zone : 100 km area.
          // const long_lat_3 = [-69.93171344197097, -29.672737573022122];
          // const coords_3 = projection(long_lat_3);
          // console.log(coords_3); //returns [341.3675737065496, 190.66005738475087], [362.80381215308626, 173.21876315578902], [427.11252749269624, 120.89488046890165]
          // // const radius_3 = 108.94614410158273, 136.45533469819196, 219.17340003748237  with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'intern_circle')
            .attr('cx', `${width / 2}`)
            .attr('cy', `${height / 2}`)
            .attr('r', '108.94614410158273')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // this circle depends on external circle.
          svg
            .append('circle')
            .attr('id', 'external_circle')
            .attr('cx', `${width / 2}`)
            .attr('cy', `${height / 2}`)
            .attr('r', '221.42696271805653')
            .attr('fill', '#bcd8e2')
            .style('opacity', '10%');

          // telescope icon.
          const pathTelescope =
            'm.12,19.45v1.14h.31v1.66s.62.01,1.58.03v20.68h17.78c1.55,3.17,7.66,12.94,9.69,16.18h-.02l.5.87.5.87.5-.87.5-.87h-.02c2.03-3.23,8.14-13.01,9.69-16.18h21.78v-9.33l-18.26-11.01-17.45-.07v-.31c.11,0,.17,0,.17,0v-4.5h1.23l2.2-.32v-2.74l-3.03-10.21-.74-.55-.19-.6-3.06-2.08h-.42l-1.6-1.11h-5.62l-.02.55H7.8l-.78-.55H1.12l.02.46h.55v.55l-1.57.09';

          svg
            .append('g')
            .attr('id', 'telescopeIconG')
            .append('path')
            .attr('id', 'telescopeIconP')
            .attr('d', pathTelescope)
            .attr('transform', `translate(${250 - 31.4 / 2},${250 - 30.38 / 2})  scale(0.5)`)
            .style('fill', '#bcd8e2')
            .style('stroke', '#bcd8e2');

          // La Serena.
          const long_lat_serena = [-71.25715298618236, -29.89192170340795];
          const coords_serena = projection(long_lat_serena);

          svg
            .append('circle')
            .attr('id', 'circle_serena')
            .attr('cx', `${coords_serena[0]}`)
            .attr('cy', `${coords_serena[1]}`)
            .attr('r', '5')
            .classed(styles.laSerena, true);
        });
      });
    });
  }

  render() {
    const { planes } = this.props;
    // const [latitude, longitude] = this.cordsPlaneInMap(-70.73709442008416, -30.240476801377167);
    const sizePlane = 15; //La mitad del size.
    const scale = 0.5;

    return (
      <>
        {/* this is for generate the static map */}
        {/* <div className={styles.container}>
          <div>{this.getRegionSvg()}</div>
          <div id="TelescopeDiv">
            <svg id="Paths" className={styles.CoquimboSvg}></svg>
          </div>
        </div> */}

        {/* run this for load the static map */}
        <div id="TelescopeDiv">
          <Map></Map>
        </div>
      </>
    );
  }
}
