import React from 'react';


export default class EditableTextBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      temporaryText: props.value
    }
    this.textboxRef = React.createRef();
  }
  
  gotNewValue() {
    this.setState({ editing: false });
    if (this.state.temporaryText !== "") 
        this.props.onChange(this.state.temporaryText);
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.gotNewValue();
    }
  }
  
  componentDidUpdate(_, prevState) {
    if (this.textboxRef.current && !prevState.editing) {
      console.log("hello")
      this.textboxRef.current.select();
    }
  }
  
  render() {
    if (this.state.editing) {
      return <input 
               type="text" 
               className={ this.props.klass || "" }
               ref={ this.textboxRef }
               value={ this.state.temporaryText } 
               onChange={ e => this.setState({ temporaryText: e.target.value })} 
               onFocus={ e => e.target.select() }
               onBlur={ () => this.gotNewValue() }
               onKeyPress={ e => this.handleKeyPress(e) }
               ></input>
    } else {
      return <div className={ this.props.klass } onClick={ () => this.setState({ editing: true })}>{ this.props.value }</div>
    }
  }
}