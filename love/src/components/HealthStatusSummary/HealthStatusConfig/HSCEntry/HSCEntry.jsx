import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './HSCEntry.module.css';
import HSCInput from './HSCInput/HSCInput';
import StatusText from '../../../GeneralPurpose/StatusText/StatusText';
import GearIcon from '../../../icons/GearIcon/GearIcon';
import Button from '../../../GeneralPurpose/Button/Button';
import Input from '../../../GeneralPurpose/Input/Input';
import Select from '../../../GeneralPurpose/Select/Select';
import { getFakeUnits, formatTimestamp } from '../../../../Utils';

/**
 * Component to configure the Health Status Summary
 */
export default class HSCEntry extends PureComponent {
  static propTypes = {
    /**
     * Name of the entry
     */
    name: PropTypes.string,
    /**
     * List of inputs for the configuration.
     * Must be a list of dictionaries with this structure:
     *
     * {
     *   category: <string> ("event" or "telemetry"),
     *   csc: <string> (name of a CS),
     *   salindex: <integer> (salindex of the CSC),
     *   topic: <string> (name of the topic),
     * }
     */
    inputs: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string,
        csc: PropTypes.string,
        salindex: PropTypes.number,
        topic: PropTypes.string,
      }),
    ),
    /**
     * String describing the body a function
     */
    funcBody: PropTypes.string,
    /**
     * Callback to call when making a change, should have the followinf arguments:
     * - name
     * - inputs
     * - funcBody
     */
    onChange: PropTypes.func,
    /**
     * Dictionary containing the strtucture for the options of the dropdown inputs
     */
    optionsTree: PropTypes.object,
  };

  static defaultProps = {
    inputs: [],
    name: null,
    funcBody: null,
    onChange: (name, inputs, funcBody) => {},
  };

  onNameChange = (name) => {
    this.props.onChange(name, this.props.input, this.props.funcBody);
  };

  onInputChange = (input, index) => {
    const newInputs = [...this.props.inputs];
    newInputs[index] = input;
    this.props.onChange(this.props.name, newInputs, this.props.funcBody);
  };

  onInputGetName = (input) => {
    const { category, csc, salindex, topic, item } = input;
    const newName = `${category}-${csc}-${salindex}-${topic}-${item}`;
    this.props.onChange(newName, this.props.inputs, this.props.funcBody);
  };

  onInputRemove = (index) => {
    const newInputs = this.props.inputs.filter((_el, i) => i !== index);
    this.props.onChange(this.props.name, newInputs, this.props.funcBody);
  };

  render() {
    const nextIndex = this.props.inputs.length;
    return (
      <div className={styles.container}>
        <Input
          className={styles.input}
          placeholder="Insert a name for the Health Status"
          value={this.props.name || ''}
          onChange={(ev) => this.props.onNameChange(ev.target?.value)}
        />
        {this.props.inputs.map((input, index) => (
          <HSCInput
            key={index}
            input={input}
            onChange={(input) => this.onInputChange(input, index)}
            onRemove={() => this.onInputRemove(index)}
            onGetName={() => this.onInputGetName(input)}
            optionsTree={this.props.optionsTree}
          />
        ))}
        <HSCInput
          key={nextIndex}
          onChange={(input) => this.onInputChange(input, nextIndex)}
          optionsTree={this.props.optionsTree}
        />
      </div>
    );
  }
}
