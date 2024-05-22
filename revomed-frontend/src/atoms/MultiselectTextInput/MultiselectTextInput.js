import React, { Component } from 'react';
import CreatableSelect from 'react-select/creatable';

// styles
import './MultiselectTextInput.scss';


const components = {
  DropdownIndicator: null,
};

const createOption = (label: string) => ({
  label,
  value: label,
});

export default class CreatableInputOnly extends Component<*, State> {
  state = {
    inputValue: '',
    value: [],
    focused: true
  };
  handleChange = (value: any, actionMeta: any) => {
    this.setState({ value });
  };
  handleInputChange = (inputValue: string) => {
    if(inputValue.length > 30) return false;
    this.setState({ inputValue });
  };
  handleKeyDown = (event: SyntheticKeyboardEvent<HTMLElement>) => {
    const { inputValue, value } = this.state;
    if (!inputValue) return;
    if(value.length === 6) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        document.dispatchEvent(new Event('compositionend'));
        let newValue = [...value, createOption(inputValue)];
        this.setState({
          inputValue: '',
          value: newValue,
        });
        if(this.props.onValueChange) this.props.onValueChange(newValue);
        event.preventDefault();
        break;

      default: break;
    }
  };
  componentDidMount() {
    if(this.props.defaultValue) {
      let newValue = [];
      this.props.defaultValue.forEach(item => {
        newValue.push({label: item, value: item});
      })
      this.setState({
        value: newValue,
      });
     }
  }
  render() {
    const { inputValue, value } = this.state;

    return (
      <div className="MultiselectTextInput">
        <label className="MultiSelect">
          <CreatableSelect
            className="CreatableSelect"
            classNamePrefix="CreatableSelect"
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false}
            onFocus={() => this.setState({focused: true})}
            onBlur={() => this.setState({focused: true})}
            onChange={this.handleChange}
            onInputChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            placeholder="Введите направления через enter..."
            value={value}
            name={this.props.name}
            getValue={value}
          />
          <span className="MultiSelect__label">{this.props.label}</span>
        </label>
        <div className="MultiselectTextInput__info d-flex flex-wrap justify-content-between mt-2">
          <span>Максимум направлений {this.state.value.length}/6</span>
          <span>Допустимая длина {inputValue.length}/30</span>
        </div>
      </div>
    );
  }
}
