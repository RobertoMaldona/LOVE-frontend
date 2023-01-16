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
      .scale(width * 25.2) // scale; 13 - 200 km,  16.05 -160 km and 25.2 -100 km.
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
            .style('background-color', '#2e3e47')
            .style('opacity', '90%');

          Coquimbo.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .attr('border', '#4c606a');
          });

          Atacama.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .attr('border', '#4c606a');
          });

          Valparaiso.features.map((feature) => {
            svg
              .append('path')
              .attr('id', feature.properties['NOM_COM'])
              .attr('d', geoGenerator(feature))
              .attr('border', '#4c606a');
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
            .attr('stroke', 'black')
            .attr('strokeWidth', '2')
            .attr('fill', 'black');

          svg
            .append('rect')
            .attr('mask', 'url(#Mask)')
            .classed(styles.rect, true)
            .attr('width', '500')
            .attr('height', '500');

          svg
            .append('circle')
            .attr('id', 'external_circle')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', '221.42696271805653')
            .attr('fill', 'none');

          // second zone : 160 km area.
          // const long_lat_2 = [-69.79391230365658, -29.057079010258132]
          // const coords_2 = projection(long_lat_2)
          // console.log(coords_2) //returns [357.00061695433305, 110.5181751002815], [382.104607855159, 74.27436233534718]
          // const radius_2 = 175.79622153494552, 219.84341506903084 with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'middle_circle')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', '219.84341506903084')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // third zone : 100 km area.
          const long_lat_3 = [-69.93171344197097, -29.672737573022122];
          const coords_3 = projection(long_lat_3);
          console.log(coords_3); //returns [341.3675737065496, 190.66005738475087], [362.80381215308626, 173.21876315578902], [427.11252749269624, 120.89488046890165]
          // // const radius_3 = 108.94614410158273, 136.45533469819196, 219.17340003748237  with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'intern_circle')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', '219.17340003748237')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // telescope icon.
          const pathTelescope =
            'm13.02,4.99l-4.01-.02v-.63l-.88-2.96-.21-.16-.05-.17-.89-.6h-.12l-.46-.32h-1.63v.16h-2.42l-.22-.16H.41v.13h.17v.16l-.46.03v5.36l.55.04v5.03h5.15c.45.92,2.22,3.75,2.81,4.69h0l.14.25.14.25.14-.25.14-.25h0c.59-.94,2.36-3.77,2.81-4.69h6.31v-2.7l-5.29-3.19Z';

          svg
            .append('g')
            .attr('id', 'telescopeIconG')
            .append('path')
            .attr('id', 'telescopeIconP')
            .attr('d', pathTelescope)
            .attr('transform', `translate(${250 - 9},${250 - 8}) scale(${1})`)
            .style('fill', '#bcd8e2')
            .style('stroke', '#bcd8e2')
            .style('stroke-miterlimit', '10')
            .style('stroke-width', '10px')
            .style('opacity', '100%');
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
        <div className={styles.container}>
          <div>{this.getRegionSvg()}</div>
          <div id="TelescopeDiv">
            <svg id="Paths" className={styles.CoquimboSvg}></svg>
          </div>
        </div>

        {/* run this for load the static map */}
        {/* <div id="TelescopeDiv">
            <Map></Map>
          </div> */}
      </>
    );
  }
}
