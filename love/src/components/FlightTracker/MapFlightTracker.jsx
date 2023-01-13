import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './FlightTracker.module.css';
import * as d3 from 'd3';
import CoquimboURL from './Coquimbo.geojson';
import { transform } from 'lodash';

export default class MapFlightTracker extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    // didMount
  };

  componentWillUnmount = () => {};

  getRegion() {
    const width = 1500;
    const height = 3000;
    const projection = d3
      .geoMercator()
      .center([-70.73709442008416, -30.240476801377167])
      .scale(width * 15)
      .translate([width / 2, height / 2]);
    let geoGenerator = d3.geoPath().projection(projection);
    const url_coquimbo = CoquimboURL;
    const url_valparaiso = ValparaisoURL;
    const url_atacama = AtacamaURL;
    d3.json(url_coquimbo).then(function (Coquimbo) {
      d3.json(url_valparaiso).then(function (Valparaiso) {
        d3.json(url_atacama).then(function (Atacama) {
          // d3.select("#MyDiv").style("color", "blue").append("p").attr("id", "a").text(Coquimbo.features[0].geometry.coordinates)
          const svg = d3
            .select('#TelescopeDiv svg')
            .attr('width', width)
            .attr('height', height)
            .style('background-color', 'white');
          // const circle = svg.append("circle")
          //           .attr("cx", 150)
          //           .attr("cy", 30)
          //           .attr("r", 10);
          //           .style("fill", "red")
          Coquimbo.features.map((feature) => {
            svg.append('path').attr('id', feature.properties['NOM_COM']).attr('d', geoGenerator(feature));
          });
          Atacama.features.map((feature) => {
            svg.append('path').attr('id', feature.properties['NOM_COM']).attr('d', geoGenerator(feature));
          });
          Valparaiso.features.map((feature) => {
            svg.append('path').attr('id', feature.properties['NOM_COM']).attr('d', geoGenerator(feature));
          });
        });
      });
    });
  }

  cordsPlaneInMap(latitude, longitude) {
    const width = 400;
    const height = 400;
    const projection = d3
      .geoMercator()
      .center([-70.73709442008416, -30.240476801377167])
      .scale(width * 15)
      .translate([width / 2, height / 2]);

    return projection([latitude, longitude]);
  }

  render() {
    const { planes } = this.props;
    // const [latitude, longitude] = this.cordsPlaneInMap(-70.73709442008416, -30.240476801377167);
    const sizePlane = 15; //La mitad del size.
    const scale = 1;

    return (
      <div className={styles.mapDiv}>
        <svg
          className={styles.Svg}
          xmlns="http://www.w3.org/2000/svg"
          width="400"
          height="400"
          id="svg2"
          viewBox="0 0 400 400"
        >
          {planes.map((airCraft) => {
            const rotate = 90;
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
                {/*translate(0,-1022.3622)*/}
                <path
                  id="path1972-5"
                  d="m 14.83626,1023.9633 c -1.27638,-0.022 -2.23322,1.3945 -1.93048,2.5893 -0.0106,2.3825 0.0254,4.5399 -0.0211,6.9222 -0.86563,0.724 -1.95196,1.1101 -2.84804,1.7935 -2.6499502,1.6543 -5.3834402,3.1905 -7.9741805,4.9298 -0.52658,1.0194 -0.12448,2.19 -0.25868,3.2744 0.11289,0.5899 0.9093903,0.7624 1.3520503,0.4239 3.29418,-1.0185 6.53329,-2.2113 9.8415802,-3.184 -0.0136,1.2588 0.0536,2.5172 0.0159,3.7764 -0.0278,0.3845 0.0353,0.8094 -0.0793,1.1678 -0.73435,0.8237 -1.95869,1.1927 -2.42191,2.2475 -0.15271,0.6859 -0.0237,1.3982 -0.0669,2.0926 0.0545,0.4878 0.57437,0.9328 1.06023,0.7042 0.96241,-0.3065 1.93965,-0.5659 2.88352,-0.9103 0.49901,-0.1817 1.0366,-0.1155 1.51212,0.093 1.06199,0.324 2.1249,0.8298 3.24892,0.8142 0.5432,-0.2545 0.45447,-0.9487 0.40024,-1.437 0.0965,-0.7182 0.11746,-1.6418 -0.57108,-2.084 -0.65138,-0.5245 -1.36097,-0.9863 -1.96573,-1.5694 -0.0402,-1.6279 -0.0903,-3.3324 0.0123,-4.9143 1.26835,0.4358 2.56344,0.7925 3.82879,1.2414 2.24148,0.7382 4.46719,1.5504 6.75364,2.1317 0.57349,-0.097 0.70865,-0.8342 0.54603,-1.3122 -0.02,-0.838 0.23484,-1.7759 -0.23779,-2.5329 -1.9355,-1.3961 -4.08122,-2.4651 -6.08613,-3.7567 -1.61971,-0.9718 -3.23783,-1.9463 -4.85386,-2.9243 -0.1822,-1.0478 0.0511,-2.1208 -0.0622,-3.1775 -0.008,-1.8175 0.13456,-3.4277 -0.16148,-5.2296 -0.32567,-0.7305 -1.12107,-1.2029 -1.91639,-1.1695 z"
                  style={{
                    fill: 'white',
                    filloOpacity: '1',
                    stroke: 'none',
                    transformBox: 'fill-box',
                    rotate: rotate + 'deg',
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
}
