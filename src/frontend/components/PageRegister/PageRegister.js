import React, { Component } from 'react'
import { Form, FormField, FormInput, Button, Checkbox, FormRow, Radio } from 'elemental'
import logo from '../Shell/logo.png';
import './PageRegister.css';
import strings from '../../helpers/localization.js';
import signupStages from './Stages.js';
import Transition from 'react-transition-group/Transition';

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      signupStage: 0,
    }

    this.attemptRegistration = this.attemptRegistration.bind(this);
    this.next = this.next.bind(this);
    this.back = this.back.bind(this);
  }
  componentWillMount() {
    if (this.props.updating_profile) {
      this.props.api.get('user')
        .then((response) => {
          this.setState({country: {countryCode: response.jsonData.data.country}})
        })
        .catch((error) => {
          console.log(error)
        });
      }
  }

  render() {
    let {signupStage} = this.state;
    // Here country collection is disabled for updating_profile route
    // const usSignup = (this.state.country && this.state.country.countryCode === "US") && strings.getLanguage() === "en";
    if (signupStage === 1 && this.props.updating_profile) { //&& !usSignup
      signupStage += 2
    }
    const childProps = { // Clone component to inject new props
      signupState: this.state,
      back: this.back,
      next: this.next,
      updating_profile: this.props.updating_profile,
      access_token: this.props.access_token,
    };
    // console.log('signupState', this.state)
    return (
      <span style={{overflow: 'hidden'}}>
        {signupStages.map((stage, index) => {
          // if(index > signupStage) {return null};
          return (
              <Transition appear={true} in={index === signupStage} timeout={500} key={"stage_" + index}>
                {(transitionState) => (
                    <div className={"fullpage_transition " + transitionState}>
                      {React.cloneElement(stage.component, {...childProps, transitionState})}
                    </div>
                  )
                }
              </Transition>
            )
          })}
      </span>
    )
  }

  next(stateChange = {}) { // Change which stage is shown, updating the state
    let {signupStage} = this.state;
    // Here country collection is disabled for updating_profile route
    // const usSignup = (this.state.country && this.state.country.countryCode === "US") && strings.getLanguage() === "en";
    if (signupStage === 1 && this.props.updating_profile){ //&& !usSignup) {
      signupStage += 2
    }
    const {registrationComplete} = this.props;
    // console.log("NEXT, signupStage to be increased", signupStage, stateChange)
    if(signupStage + 1 >= signupStages.length) {
      registrationComplete();
      return;
    }
    if(signupStage + 1 >= 0) {
      this.setState({...stateChange, signupStage: signupStage + 1})
    }
  }

  back(stateChange = {}) { // Change which stage is shown, updating the state
    const {signupStage} = this.state;
    if(signupStage - 1 >= 0) {
      this.setState({...stateChange, signupStage: signupStage - 1})
    }
  }

  attemptRegistration() {
    if(this.state.awaitingResponse) {
      return;
    }

    if(!this.state.inputTerms) { // Check T&Cs
      this.setState({error: 'Bitte stelle sicher, dass du die AGB und Privatsphäre-Bedingungen gelesen und akzeptiert hast.'})
      return false
    }

    this.setState({awaitingResponse: true})

    this.props.api.post('user/create', {json: {age: this.state.inputAge, postcode: this.state.inputPostcode, gender: this.state.inputGender, country: 'DE'}})
      .then((response) => { // The rest of the validation is down to the server
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.jsonData.data.token})
          .then(() => {
            this.props.registrationComplete()
          })
          .catch(() => {
            this.setState({error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.", awaitingResponse: false})
          });
      })
      .catch((error) => {
        if(error.response) {
          this.setState({error: error.response.data.errorMessage, awaitingResponse: false})
        }else {
          this.setState({error: error.toString(), awaitingResponse: false})
        }
      })

  }
}
