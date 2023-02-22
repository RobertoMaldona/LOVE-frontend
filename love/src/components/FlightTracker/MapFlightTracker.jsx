import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { transform } from 'lodash';
import styles from './FlightTracker.module.css';
import * as d3 from 'd3';
import CoquimboURL from './GeoJson/Coquimbo.geojson';
import ValparaisoURL from './GeoJson/Valparaiso.geojson';
import AtacamaURL from './GeoJson/Atacama.geojson';
import TelescopeURL from './Svg/telescope.svg';
import { ReactComponent as Map200 } from './Svg//Map200.svg';
import { ReactComponent as Map160 } from './Svg//Map160.svg';
import { ReactComponent as Map100 } from './Svg//Map100.svg';
import { style, svg, zoom } from 'd3';

export default class MapFlightTracker extends Component {
  static propTypes = {
    /* Planes data with the distance to the center */
    planes: PropTypes.object,
    /* Level of maps zoom*/
    zoom: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    this.insertTooltip();
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { zoom } = this.props;
    if (zoom !== prevProps.zoom) this.insertTooltip();
  };

  /**
   * @param {*} latitude
   * @param {*} longitude
   * @param {*} zoom: the zoom that represent the actual map rendering
   * @returns the coordinates for the svg of the map according to its latitude and longitude
   */
  cordsPlaneInMap(latitude, longitude, zoom) {
    const width = 500;
    const height = 500;
    let scale = 13;
    if (zoom === '160') scale = 16.05;
    else if (zoom === '100') scale = 25.2;

    let projection = d3
      .geoMercator()
      .center([-70.73709442008416, -30.240476801377167])
      .scale(width * scale) // scale; 13 - 200 km,  16.05 -160 km and 25.2 -100 km.
      .translate([width / 2, height / 2 + 15 / (scale / 13)]);

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
          d3.select('#telescopeDiv #Paths').selectAll('*').remove();

          const svg = d3
            .select('#telescopeDiv #Paths')
            .attr('width', `${100}%`)
            .attr('height', `${100}%`)
            .attr('min-width', '5%')
            .attr('viewBox', `0 0 ${width} ${height}`);

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
          mask.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', 'white');
          mask
            .append('circle')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '220') // this radius let encloses the last radius in map. For scales (222, 220).
            .attr('fill', 'black');

          svg
            .append('rect')
            .attr('mask', 'url(#Mask)')
            .classed(styles.rect, true)
            .attr('width', '100%')
            .attr('height', '100%');

          // second zone : 160 km area.
          // const long_lat_2 = [-69.79391230365658, -29.057079010258132]
          // const coords_2 = projection(long_lat_2)
          // console.log(coords_2) //returns [357.00061695433305, 110.5181751002815], [382.104607855159, 74.27436233534718]
          // const radius_2 = 175.79622153494552, 219.84341506903084 with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'middle_circle')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '219.84341506903084')
            // .attr('stroke', '#bcd8e2')
            // .attr('stroke-width', '1')
            .attr('fill', 'none');

          // third zone : 100 km area.
          // const long_lat_3 = [-69.93171344197097, -29.672737573022122];
          // const coords_3 = projection(long_lat_3);
          // console.log(coords_3); //returns [341.3675737065496, 190.66005738475087], [362.80381215308626, 173.21876315578902], [427.11252749269624, 120.89488046890165]
          // // const radius_3 = 108.94614410158273, 136.45533469819196, 219.17340003748237  with Euclidian distance.

          svg
            .append('circle')
            .attr('id', 'intern_circle')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '219.17340003748237')
            // .attr('stroke', '#bcd8e2')
            // .attr('stroke-width', '1')
            .attr('fill', 'none');

          // this circle depends on external circle.
          svg
            .append('circle')
            .attr('id', 'external_circle')
            .attr('cx', '50%')
            .attr('cy', '50%')
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
            .attr('transform', `translate(${width / 2 - 31.4 / 2}px,${height / 2 - 30.38 / 2}px)  scale(0.5)`)
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

  /**
   * Function to draw an aircraft on the map
   * @param {*} cordx: positon on the map
   * @param {*} cordy: positon on the map
   * @param {*} id: plane id
   */
  addPlanes(airCraft) {
    const { zoom } = this.props;
    const { id, distance, loc } = airCraft;

    /* Planes out of zoom */
    if (zoom === '160' && distance[0] > 160) return;
    else if (zoom === '100' && distance[0] > 100) return;

    const [longitude, latitude] = loc;
    const [cordx, cordy] = this.cordsPlaneInMap(latitude, longitude, this.props.zoom);

    /* Define plane's color by zone */
    let color = '#bcd8e2';
    const status = distance[1];
    // const status = distance[1] === 'running' ? 'ok' : distance[1];
    if (status !== 'running') color = `var(--status-${status}-dimmed-color-2`;

    var rotateRandom = Math.floor(Math.random() * 360);
    const scale = 0.75;
    const sizeBox = 14.5 * scale; //size of the path's box
    // const sizeBox = 0;

    /* Path plane */
    const dPlane =
      'm 14.83626,1023.9633 c -1.27638,-0.022 -2.23322,1.3945 -1.93048,2.5893 -0.0106,2.3825 0.0254,4.5399 -0.0211,6.9222 -0.86563,0.724 -1.95196,1.1101 -2.84804,1.7935 -2.6499502,1.6543 -5.3834402,3.1905 -7.9741805,4.9298 -0.52658,1.0194 -0.12448,2.19 -0.25868,3.2744 0.11289,0.5899 0.9093903,0.7624 1.3520503,0.4239 3.29418,-1.0185 6.53329,-2.2113 9.8415802,-3.184 -0.0136,1.2588 0.0536,2.5172 0.0159,3.7764 -0.0278,0.3845 0.0353,0.8094 -0.0793,1.1678 -0.73435,0.8237 -1.95869,1.1927 -2.42191,2.2475 -0.15271,0.6859 -0.0237,1.3982 -0.0669,2.0926 0.0545,0.4878 0.57437,0.9328 1.06023,0.7042 0.96241,-0.3065 1.93965,-0.5659 2.88352,-0.9103 0.49901,-0.1817 1.0366,-0.1155 1.51212,0.093 1.06199,0.324 2.1249,0.8298 3.24892,0.8142 0.5432,-0.2545 0.45447,-0.9487 0.40024,-1.437 0.0965,-0.7182 0.11746,-1.6418 -0.57108,-2.084 -0.65138,-0.5245 -1.36097,-0.9863 -1.96573,-1.5694 -0.0402,-1.6279 -0.0903,-3.3324 0.0123,-4.9143 1.26835,0.4358 2.56344,0.7925 3.82879,1.2414 2.24148,0.7382 4.46719,1.5504 6.75364,2.1317 0.57349,-0.097 0.70865,-0.8342 0.54603,-1.3122 -0.02,-0.838 0.23484,-1.7759 -0.23779,-2.5329 -1.9355,-1.3961 -4.08122,-2.4651 -6.08613,-3.7567 -1.61971,-0.9718 -3.23783,-1.9463 -4.85386,-2.9243 -0.1822,-1.0478 0.0511,-2.1208 -0.0622,-3.1775 -0.008,-1.8175 0.13456,-3.4277 -0.16148,-5.2296 -0.32567,-0.7305 -1.12107,-1.2029 -1.91639,-1.1695 z';
    const svg = d3.select('#mapTelescope');

    /* Color of circles*/
    if (distance[0] < 100) {
      svg.select('#intern_circle').style('stroke', '#df5601');
    } else if (distance[0] < 160) {
      svg.select('#middle_circle').style('stroke', '#d9cd03');
    }

    /* Remove the g airCraft previous.*/
    svg.select(`#id${id}`).remove();

    var tooltip = d3.select('#tooltip');

    /* Add plane in map */
    svg
      .append('g')
      .attr('id', `id${id}`)
      // .style('transform-box', 'fill-box')
      // .style('transform-origin', 'center center')
      .attr(
        'transform',
        `scale(${scale}) translate(${(cordx - sizeBox) / scale}, ${-1022.3622 + (cordy - sizeBox) / scale})`,
      )
      .append('path')
      .classed('pathPlane', true)
      .attr('d', dPlane)
      .attr('class', styles.pathPlane)
      .style('fill', color)
      .style('opacity', '100%')
      .style('stroke', 'none')
      // .style('transform-box', 'fill-box')
      // .style('transform-origin', 'center center')
      // .style('rotate', `${rotateRandom}deg`)
      .on('mouseover', function () {
        return tooltip
          .style('visibility', 'visible')
          .attr('transform', `translate(${cordx + 10}, ${cordy})`)
          .select('#textTool')
          .text(`${id}`);
      })
      .on('mouseout', function () {
        return tooltip.style('visibility', 'hidden');
      });

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

    const coord160 = this.cordsPlaneInMap(-70.455929982759, -31.0853237055783, zoom);
    const long_lat_serena = [-71.25715298618236, -29.89192170340795];
    const coords_serena = this.cordsPlaneInMap(-70.73709442008416, -30.240476801377167, zoom);
    svg
      .append('circle')
      .attr('id', 'point')
      .attr('cx', `${coords_serena[0]}`)
      .attr('cy', `${coords_serena[1]}`)
      // .attr('cx', '250')
      // .attr('cy', '140')
      .attr('r', '2')
      .attr('fill', 'orange');
    // .attr(
    //   'transform',
    //   `scale(${scale}) translate(495, 495)`,
    // );
    svg
      .append('circle')
      .attr('id', 'point')
      // .attr('cx', `${coord160[0]}`)
      // .attr('cx', `${coord160[1]}`)
      .attr('cx', cordx)
      .attr('cy', cordy)
      .attr('r', '2')
      .attr('fill', 'orange');
  }

  /**
   * Function to insert the tooltip to use by planes
   */
  insertTooltip() {
    const map = d3.select('#mapTelescope');
    const [width, height] = [6, 3];
    map
      .append('g')
      .attr('id', 'tooltip')
      .style('visibility', 'hidden')
      .append('rect')
      .attr('width', `${width}%`)
      .attr('height', `${height}%`)
      .attr('fill', '#bcd8e2');

    map
      .select('#tooltip')
      .append('text')
      .attr('id', 'textTool')
      .attr('x', `${width / 2}%`)
      .attr('y', `${height / 2}%`)
      .attr('font-size', '75%')
      .attr('alignment-baseline', 'middle')
      .attr('text-anchor', 'middle');
  }

  /**
   * Function to select the svg map according to zoom.
   * @param {*} zoom
   * @returns component svg
   */
  renderMap(zoom) {
    if (zoom === '200') return <Map200 id="mapTelescope"></Map200>;
    if (zoom === '160') return <Map160 id="mapTelescope"></Map160>;
    return <Map100 id="mapTelescope"></Map100>;
  }

  render() {
    const { planes } = this.props;
    const rotate = 70;
    const { zoom } = this.props;

    return (
      <>
        {this.renderMap(zoom)}

        {planes.map((airCraft) => {
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