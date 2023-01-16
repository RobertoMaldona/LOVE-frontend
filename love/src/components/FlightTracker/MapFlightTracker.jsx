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
    const width = 500;
    const height = 500;
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
      .scale(width * 13)
      .translate([width / 2, height / 2 + 15]);

    let geoGenerator = d3.geoPath().projection(projection);

    const url_coquimbo = CoquimboURL;
    const url_valparaiso = ValparaisoURL;
    const url_atacama = AtacamaURL;

    d3.json(url_coquimbo).then(function (Coquimbo) {
      d3.json(url_valparaiso).then(function (Valparaiso) {
        d3.json(url_atacama).then(function (Atacama) {
          d3.select('#telescopeDiv #Paths').selectAll('*').remove();

          const svg = d3
            .select('#telescopeDiv #Paths')
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
          // const lat_long_1 = [-69.72640645677438, -28.671508190008392,]
          // const coords_1 = projection(lat_long_1)
          // console.log(coords_1) //returns [364.65891235520394, 45.57129669433607]
          // const radius_1 = 234.3880562607948 with Euclidian distance.

          const mask = svg.append('mask').attr('id', 'Mask');
          mask.append('rect').attr('width', '500').attr('height', '500').attr('fill', 'white');
          mask
            .append('circle')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', ' 250')
            .attr('stroke', 'black')
            .attr('strokeWidth', '2')
            .attr('fill', 'black');

          svg
            .append('rect')
            .attr('mask', 'url(#Mask)')
            .classed(styles.rect, true)
            .attr('width', '500')
            .attr('height', '500');

          // second zone : 160 km area.
          // const lat_long_2 = [-69.79391230365658, -29.057079010258132]
          // const coords_2 = projection(lat_long_2)
          // console.log(coords_2) //returns 357.00061695433305, 95.5181751002815
          // const radius_2 = 187.9195738952044 with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'circle2')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', '187.9195738952044')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // // third zone.
          // const lat_long_3 = [-69.93171344197097, -29.672737573022122]
          // const coords_3 = projection(lat_long_3)
          // console.log(coords_3) //returns [341.3675737065496, 175.66005738475087]
          // // const radius_3 = 117.7899002167007 with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'circle3')
            .attr('cx', '250')
            .attr('cy', '250')
            .attr('r', '117.7899002167007')
            .attr('stroke', '#bcd8e2')
            .attr('stroke-width', '1')
            .attr('fill', 'none');

          // telescope icon.

          const [cordx, cordy] = projection(telescopeCoords);
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

  /**
   * Function to draw an aircraft on the map
   * @param {*} cordx: positon on the map
   * @param {*} cordy: positon on the map
   * @param {*} id
   */
  addPlanes(airCraft) {
    const { id, distance } = airCraft;
    const [longitude, latitude] = airCraft.loc;
    const [cordx, cordy] = this.cordsPlaneInMap(latitude, longitude);
    const status = distance[1] === 'running' ? 'ok' : distance[1];

    var rotateRandom = Math.floor(Math.random() * 360);
    const scale = 1;
    const sizeBox = 14.5 * scale; //size of the path's box

    const dPlane =
      'm 14.83626,1023.9633 c -1.27638,-0.022 -2.23322,1.3945 -1.93048,2.5893 -0.0106,2.3825 0.0254,4.5399 -0.0211,6.9222 -0.86563,0.724 -1.95196,1.1101 -2.84804,1.7935 -2.6499502,1.6543 -5.3834402,3.1905 -7.9741805,4.9298 -0.52658,1.0194 -0.12448,2.19 -0.25868,3.2744 0.11289,0.5899 0.9093903,0.7624 1.3520503,0.4239 3.29418,-1.0185 6.53329,-2.2113 9.8415802,-3.184 -0.0136,1.2588 0.0536,2.5172 0.0159,3.7764 -0.0278,0.3845 0.0353,0.8094 -0.0793,1.1678 -0.73435,0.8237 -1.95869,1.1927 -2.42191,2.2475 -0.15271,0.6859 -0.0237,1.3982 -0.0669,2.0926 0.0545,0.4878 0.57437,0.9328 1.06023,0.7042 0.96241,-0.3065 1.93965,-0.5659 2.88352,-0.9103 0.49901,-0.1817 1.0366,-0.1155 1.51212,0.093 1.06199,0.324 2.1249,0.8298 3.24892,0.8142 0.5432,-0.2545 0.45447,-0.9487 0.40024,-1.437 0.0965,-0.7182 0.11746,-1.6418 -0.57108,-2.084 -0.65138,-0.5245 -1.36097,-0.9863 -1.96573,-1.5694 -0.0402,-1.6279 -0.0903,-3.3324 0.0123,-4.9143 1.26835,0.4358 2.56344,0.7925 3.82879,1.2414 2.24148,0.7382 4.46719,1.5504 6.75364,2.1317 0.57349,-0.097 0.70865,-0.8342 0.54603,-1.3122 -0.02,-0.838 0.23484,-1.7759 -0.23779,-2.5329 -1.9355,-1.3961 -4.08122,-2.4651 -6.08613,-3.7567 -1.61971,-0.9718 -3.23783,-1.9463 -4.85386,-2.9243 -0.1822,-1.0478 0.0511,-2.1208 -0.0622,-3.1775 -0.008,-1.8175 0.13456,-3.4277 -0.16148,-5.2296 -0.32567,-0.7305 -1.12107,-1.2029 -1.91639,-1.1695 z';
    const svg = d3.select('#mapTelescope');

    //Remove the g airCraft previous.
    svg.select(`#id${id}`).remove();

    //
    svg
      .append('g')
      .attr('id', `id${id}`)
      .attr(
        'transform',
        `scale(${scale}) translate(${(cordx - sizeBox) / scale}, ${-1022.3622 + (cordy - sizeBox) / scale})`,
      )
      .append('path')
      .classed('pathPlane', true)
      .attr('d', dPlane)
      .attr('class', styles.pathPlane)
      .style('fill', `var(--status-${status}-dimmed-color-2`)
      .style('opacity', '100%')
      .style('stroke', 'none')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center')
      .style('rotate', `${rotateRandom}deg`);

    svg
      .select(`#id${id}`)
      .append('line')
      .attr('x1', `${sizeBox}`)
      .attr('y1', '1022.3622')
      .attr('x2', `${sizeBox}`)
      .attr('y2', `${1022.3622 - sizeBox * 2}`)
      .attr('stroke-dasharray', '9, 1.5')
      .style('stroke', 'white')
      .style('stroke-width', '1')
      .style('transform-origin', `center ${sizeBox * 3}px`)
      .style('transform-box', 'fill-box')
      .style('rotate', `${rotateRandom}deg`);
  }

  render() {
    const { planes } = this.props;
    const rotate = 70;
    return (
      <>
        <div id="telescopeDiv">
          <Map id="mapTelescope"></Map>
        </div>

        {planes.map((airCraft) => {
          // const [longitude, latitude] = airCraft.loc;
          // const [cordx, cordy] = this.cordsPlaneInMap(latitude, longitude);
          // this.addPlanes(rotate, cordx, cordy, airCraft.id);
          this.addPlanes(airCraft);
        })}

        {/* <div className={styles.mapDiv}>
          <svg
            className={styles.Svg}
            width="500"
            height="500"
            id="svg2"
            viewBox="0 0 500 500"
          >
            {planes.map((airCraft) => {
              const scale = 1;
              const sizePlane = 14.5 * scale;
              const rotate = 0;
              const [longitude, latitude] = airCraft.loc;
              const [cordx, cordy] = this.cordsPlaneInMap(latitude, longitude);

              return (
                <g
                  id="layer1"
                  key={airCraft.id}
                  transform={`scale(${scale}) translate(${(cordx - sizePlane) / scale},${
                    -1022.3622 + (cordy - sizePlane) / scale
                  }) `}
                >
                  <path
                    id="path1972-5"
                    d="m 14.83626,1023.9633 c -1.27638,-0.022 -2.23322,1.3945 -1.93048,2.5893 -0.0106,2.3825 0.0254,4.5399 -0.0211,6.9222 -0.86563,0.724 -1.95196,1.1101 -2.84804,1.7935 -2.6499502,1.6543 -5.3834402,3.1905 -7.9741805,4.9298 -0.52658,1.0194 -0.12448,2.19 -0.25868,3.2744 0.11289,0.5899 0.9093903,0.7624 1.3520503,0.4239 3.29418,-1.0185 6.53329,-2.2113 9.8415802,-3.184 -0.0136,1.2588 0.0536,2.5172 0.0159,3.7764 -0.0278,0.3845 0.0353,0.8094 -0.0793,1.1678 -0.73435,0.8237 -1.95869,1.1927 -2.42191,2.2475 -0.15271,0.6859 -0.0237,1.3982 -0.0669,2.0926 0.0545,0.4878 0.57437,0.9328 1.06023,0.7042 0.96241,-0.3065 1.93965,-0.5659 2.88352,-0.9103 0.49901,-0.1817 1.0366,-0.1155 1.51212,0.093 1.06199,0.324 2.1249,0.8298 3.24892,0.8142 0.5432,-0.2545 0.45447,-0.9487 0.40024,-1.437 0.0965,-0.7182 0.11746,-1.6418 -0.57108,-2.084 -0.65138,-0.5245 -1.36097,-0.9863 -1.96573,-1.5694 -0.0402,-1.6279 -0.0903,-3.3324 0.0123,-4.9143 1.26835,0.4358 2.56344,0.7925 3.82879,1.2414 2.24148,0.7382 4.46719,1.5504 6.75364,2.1317 0.57349,-0.097 0.70865,-0.8342 0.54603,-1.3122 -0.02,-0.838 0.23484,-1.7759 -0.23779,-2.5329 -1.9355,-1.3961 -4.08122,-2.4651 -6.08613,-3.7567 -1.61971,-0.9718 -3.23783,-1.9463 -4.85386,-2.9243 -0.1822,-1.0478 0.0511,-2.1208 -0.0622,-3.1775 -0.008,-1.8175 0.13456,-3.4277 -0.16148,-5.2296 -0.32567,-0.7305 -1.12107,-1.2029 -1.91639,-1.1695 z"
                    style={{
                      fill: 'white',
                      filloOpacity: '1',
                      stroke: 'none',
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      rotate: rotate + 'deg',
                    }}
                  />
                  <line 
                    x1={sizePlane} 
                    y1={1022.3622} 
                    x2={sizePlane} 
                    y2={1022.3622- sizePlane*2} 
                    stroke-dasharray="9, 1.5" 
                    style={{
                      stroke:'white', 
                      strokeWidth:'1',
                      transformBox: 'fill-box',
                      transformOrigin: `center ${sizePlane*3}px`,
                      rotate: rotate + 'deg',
                    }}
                    />
                </g>
              );
            })}
          </svg>
        </div> */}
      </>
    );
  }
}
