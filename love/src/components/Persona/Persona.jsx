import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Persona.module.css';
import Button from 'components/GeneralPurpose/Button/Button';

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default class Persona extends Component {
  static propTypes = {
    nombre: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      direccion: null,
    };
  }

  componentDidMount = () => {
    this.changeDireccion();
  };

  changeDireccion() {
    const { nombre } = this.props;
    let direc = '';
    for (var j = 0; j < nombre.length; j++) {
      direc += makeid(4);
    }

    this.setState({ direccion: direc });
  }

  render() {
    const { nombre } = this.props;
    const { direccion } = this.state;

    return (
      <div className={styles.container}>
        <p> {nombre} </p>
        <p> {direccion} </p>

        <div className={styles.containerCenter}>
          <Button onClick={() => this.changeDireccion()} status="default">
            {' '}
            Cambiar Direccion{' '}
          </Button>
        </div>
      </div>
    );
  }
}
