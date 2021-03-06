import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {getUserCount} from '../../helpers/functions.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Spinner, Row, Card, Col} from 'elemental';
import api from '../../helpers/api.js';
import { countries, countries_in_native_lang } from './countries.js';
import languages from './languages.js';
// import {
//   OxfordSurvey0,
//   OxfordSurvey1,
//   OxfordSurvey2,
//   OxfordSurvey3,
//   OxfordSurvey4,
//   OxfordSurvey5,
//   OxfordSurvey6
//   } from '../OxfordSurvey/OxfordSurvey.js';
// import {schema} from '../OxfordSurvey/SurveyFields.js';
import FacebookIcon from './icon_facebook.svg';
import TwitterIcon from './icon_twitter.svg';
import Logo from '../Shell/wtm_logo_border.png';
import LogoBR from '../Shell/wtm_logo_br.png';
import LogoFI from '../Shell/wtm_logo_fi.png';

/* CONTAINS THE SIGNUP STAGES */

//Prepare countryOptions for select country
const keys = Object.keys(countries);
let countryOptions = []
for (let i=0; i<keys.length; i++) {
  const country = {value: keys[i], label: countries[keys[i]]}
  countryOptions.push(country)
}

const Container = ({survey, children, country, updating_profile}) => (
  <div className="CenterContainer_outer">
    <div className="CenterContainer_inner">
      <img src={country === 'BR' ? LogoBR : country === 'FI' ? LogoFI : Logo} className='logo'/>
      <h2 className={survey ? 'settingUp smallText' : 'settingUp'}>
        {survey ? 'Oxford Internet Institute Research Survey' :
          updating_profile ? strings.update.update_profile :
          strings.register.setting_up
        }
      </h2>
      <div style={{margin: '0 auto', padding: '0px 20px'}}>
        {children}
      </div>
    </div>
  </div>
);

class LanguageSelector extends Component {
  constructor() {
    super();
    this.state = {
      language: 'en',
      loadingLanguage: false,
    }
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(language) {
    strings.setLanguage(language);
    chrome.storage.promise.local.set({language})
      .then(() => {
        this.setState({loadingLanguage:false, language});
      })
  }

  render() {

    const languageOptions = languages;
    const {language, loadingLanguage} = this.state;
    const updating_profile = this.props.updating_profile;

    return (
      <span className="LanguageSelector" style={{overflow: 'hidden'}}>

        <Container updating_profile={updating_profile}>
          <div className="fullwidth" style={{overflow: 'hidden'}}>
            <p>{strings.register.welcome1 || 'Who Targets Me helps people understand how targeted social'}</p>
            <p>{strings.register.welcome2 || 'media advertising is used to persuade them.'}</p>
            <h3 style={{marginTop: '40px'}}>{strings.register.select_language || 'Select your language'}</h3>
            <p style={{fontSize: '12px'}}>{strings.register.welcome3 || 'helps us to show you the right version of Who Targets Me'}</p>
          </div>
          <div className="fullwidth" style={{marginBottom: '20px', overflow: 'hidden'}}>
          <FormRow>
            <FormField width="one-quarter" style={{margin: '10px auto', float: 'none'}}>
              <FormSelect options={languageOptions} firstOption={this.state.language['label']} onChange={this.handleSelect} />
            </FormField>
          </FormRow>
          </div>
          {this.state.language === 'il' ? <InputGroup.Section>
            <Button onClick={() => this.props.next({language})} disabled={loadingLanguage} type="hollow-success">{(String.fromCharCode("171") + " " + strings.register.next)}</Button>
          </InputGroup.Section> :
          <InputGroup.Section>
            <Button onClick={() => this.props.next({language})} disabled={loadingLanguage} type="hollow-success">{(strings.register.next + " " + String.fromCharCode("187"))}</Button>
          </InputGroup.Section>}
        </Container>
      </span>
    )
  }
}

class TermsPrivacy extends Component {
  render() {
    const {back, next, signupState, updating_profile} = this.props;

    return (
      <span>
        <Container updating_profile={updating_profile}>
          <div className="fullwidth" style={{margin: 'auto', marginBottom: '20px', width: 650, textAlign: 'left'}}>
            <p><b>{strings.register.terms5}</b></p>
            <ul>
              <li style={{listStyle: 'disc'}}>{strings.register.terms6}</li>
              <li style={{listStyle: 'disc'}}>{strings.register.terms7}</li>
            </ul>
            <p>{strings.register.terms8}</p>
            <p>
              <span>{`${strings.register.terms1} `}<a href="https://whotargets.me/en/terms/">{strings.register.terms2}</a>{` ${strings.register.terms3} `}<a href="https://whotargets.me/en/privacy-policy/">{strings.register.terms4}.</a></span>
            </p>
          </div>
          {signupState.language === 'il' ? <div className="fullwidth">
            <Button type="hollow-success" style={{marginRight: '20px'}} onClick={next}>{String.fromCharCode("171")} {strings.register.agree}</Button>
            <Button type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back + " " + String.fromCharCode("187")}</Button>
          </div> :
          <div className="fullwidth">
            <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
            <Button type="hollow-success" onClick={next}>{strings.register.agree} {String.fromCharCode("187")}</Button>
          </div>}
        </Container>
      </span>
    )
  }
}

class CountrySelector extends Component {

  constructor() {
    super();
    this.state = {
      loadingLocation: false,
      country: '',
      countryDisplay: {label: '- select -', value: ''},
      inputValue: ''
    }

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillMount() {
    api.get('general/location')
      .then((response) => {
        if(response.jsonData.data.country) {
          const countryCode = response.jsonData.data.country.toUpperCase();
          const country = {countryCode, country: countries[countryCode]};
          this.setState({loadingLocation: false, country, inputValue: countries[countryCode]});
        } else {
          this.setState({loadingLocation: false});
        }
      })
      .catch(() => {
        this.setState({loadingLocation: false});
      });
  }

  componentWillReceiveProps(nextProps) {
    // if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
    //   this.countryInput.focus();
    // }
  }

  handleSelect(countryCode) {
    console.log('countryCode', countryCode)
    const country = {countryCode, country: countries[countryCode]};
    this.setState({inputValue: countryCode, country})
  }

  render() {
    const {back, next, signupState, updating_profile} = this.props;
    const {loadingLocation, country, countryDisplay, inputValue} = this.state;
    // console.log('country state', this.state)
    return (
      <span>
        <Container country={country ? country.countryCode : ''} updating_profile={updating_profile}>
          <div className="fullwidth pageTitle">
            <p>{strings.register.welcome1}</p>
            <p>{strings.register.welcome2}</p>
            <h3 style={{marginTop: '40px'}}>{strings.register.enter_country}</h3>
            <p style={{fontSize: '12px'}}>{strings.register.welcome4}</p>
          </div>
          <div className="fullwidth">
            <div style={{width: '500px', overflow: 'hidden', margin: '0 auto'}}>

              <div style={{width: '300px', margin: '0 auto'}}>
                <InputGroup contiguous style={{width: '300px', display: 'flex', justifyContent: 'center'}}>
                  <InputGroup.Section style={{flex: 1}}>
                    <FormField width="one-quarter" style={{float: 'none'}}>
                      <FormSelect disabled={loadingLocation} options={countryOptions} firstOption={this.state.countryDisplay.label} onChange={this.handleSelect} />
                    </FormField>
                  </InputGroup.Section>
                </InputGroup>
              </div>
              <div className="fullwidth">
                {signupState.language === 'il' ? <InputGroup contiguous style={{width: '300px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
                  <div style={{flex: 1}}>
                    <Button style={{width: '130px', marginLeft: '30px'}} onClick={() => next({country})} disabled={loadingLocation || !inputValue || inputValue === "ALL"} type="hollow-success">{loadingLocation ? <Spinner /> : (String.fromCharCode("171") + " " + strings.register.next)}</Button>
                  </div>
                  <div style={{flex: 1, marginRight: 10}}>
                    <Button style={{width: '130px', marginLeft: '20px'}} type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back + " " + String.fromCharCode("187")}</Button>
                  </div>
                </InputGroup> :
                <InputGroup contiguous style={{width: '300px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
                  <div style={{flex: 1, marginRight: 10}}>
                    <Button style={{width: '130px'}} type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
                  </div>
                  <div style={{flex: 1}}>
                    <Button style={{width: '130px'}} onClick={() => next({country})} disabled={loadingLocation || !inputValue || inputValue === "ALL"} type="hollow-success">{loadingLocation ? <Spinner /> : (strings.register.next + " " + String.fromCharCode("187"))}</Button>
                  </div>
                </InputGroup>}
              </div>
            </div>
          </div>

        </Container>
      </span>
    )
  }

  // inputChange(newValue) {
  //   let newState = {inputValue: newValue, suggest: null, country: null};
  //   if(newValue.length > 1) {
  //     for(let countryCode in countries) {
  //       if(countryCode.toLowerCase() === newValue.toLowerCase()) {
  //         newState.suggest = {countryCode, country: countries[countryCode]}
  //         break;
  //       }else if(newValue.length > 2 && countries[countryCode].toLowerCase() === newValue.toLowerCase()) {
  //         newState.country = {countryCode, country: countries[countryCode]};
  //         newState.suggest = {countryCode, country: countries[countryCode]};
  //         break;
  //       }else if(newValue.length > 2 && countries[countryCode].toLowerCase().includes(newValue.toLowerCase())) {
  //         newState.suggest = {countryCode, country: countries[countryCode]}
  //         break;
  //       }
  //     }
  //   }
  //   this.setState(newState, );
  // }
  //
  // handleKeyPress(e) {
  //   const {suggest, country} = this.state;
  //   const {next} = this.props;
  //
  //   if (e.key === 'Enter') {
  //     if(country) {
  //       next({country});
  //     }else if(suggest) {
  //       this.setState({country: suggest, inputValue: suggest.country});
  //     }
  //   }
  // }
}

class PostcodeSelector extends Component {

  constructor() {
    super();
    this.state = {
      checkingPostcode: false,
      inputValue: '',
      postcodeError: false,
    }

    this.inputChange = this.inputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.check = this.check.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.postcodeInput.focus();
    }
  }

  render() {
    const {back, next, signupState: {country = {}}, updating_profile} = this.props;
    const {inputValue, checkingPostcode, postcodeError} = this.state;
    const {countryCode} = country;

    return (
      <span>
        <Container country={countryCode} updating_profile={updating_profile}>
          <div className="fullwidth pageTitle">
            <h3>{strings.register.enter_postcode}</h3>
          </div>
          <div className="fullwidth">
            <div style={{width: '500px', overflow: 'hidden', margin: '0 auto'}}>
              <div style={{width: '100px', float: 'left'}}>
                {this.props.signupState.language === 'il' ?
                  <Button onClick={this.check} disabled={checkingPostcode} type="hollow-success">{checkingPostcode ? <Spinner /> : (String.fromCharCode("171") + ' ' + strings.register.next)}</Button> :
                  <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
                }
              </div>
              <div style={{width: '400px', float: 'left'}}>
                <InputGroup contiguous style={{width: '400px'}}>
                  <InputGroup.Section grow>
                    <FormInput
                      disabled={checkingPostcode}
                      type="text"
                      placeholder={countryCode === 'IE' ?  strings.register.county : strings.register.postcode}
                      value={inputValue} ref={(input) => {this.postcodeInput = input}}
                      onChange={(e) => this.inputChange(e.target.value)}
                      onKeyPress={this.handleKeyPress}/>
                  </InputGroup.Section>
                  <InputGroup.Section>
                    {this.props.signupState.language === 'il' ?
                      <Button type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back} {String.fromCharCode("187")}</Button> :
                      <Button onClick={this.check} disabled={checkingPostcode} type="hollow-success">{checkingPostcode ? <Spinner /> : (strings.register.next + " " + String.fromCharCode("187"))}</Button>
                    }
                  </InputGroup.Section>
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="fullwidth">
            <p>{postcodeError ? strings.register.postcode_error : ''}</p>
          </div>
        </Container>
      </span>
    )
  }

  inputChange(newValue) {
    this.setState({inputValue: newValue});
  }

  handleKeyPress(e) {
    const {suggest, country} = this.state;
    const {next} = this.props;

    if (e.key === 'Enter') {
      this.check();
    }
  }

  check() {
    const {checkingPostcode, inputValue} = this.state;
    const {countryCode} = this.props.signupState.country;
    const {next} = this.props;
    if(checkingPostcode) {
      return false;
    }
    this.setState({checkingPostcode: true});

    api.get('general/checkpostcode', {query: {countryCode, postcode: inputValue}})
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          this.setState({checkingPostcode: false, postcodeError: false});
          next({postcode: inputValue});
        } else if (countryCode === 'BR') {
            // For Brazil set the postcode to Brasilia to omit google api error if any
            const trimmedValue = '70232-515';
            api.get('general/checkpostcode', {query: {countryCode, postcode: trimmedValue}})
              .then((response) => {
                if (response.status >= 200 && response.status < 300){
                  this.setState({checkingPostcode: false, postcodeError: false});
                  next({postcode: trimmedValue});
                } else {
                  this.setState({checkingPostcode: false, postcodeError: true});
                }
              })
              .catch(err => {
                console.log('error postcode', err)
                this.setState({checkingPostcode: false, postcodeError: true});
              })
        } else {
          this.setState({checkingPostcode: false, postcodeError: true});
        }
      })
      .catch(err => {
        console.log('error postcode', err)
        this.setState({checkingPostcode: false, postcodeError: true});
      })
    }
}

class GenderSelector extends Component {

  render() {
    const {back, next, signupState, updating_profile} = this.props;
    return (
      <Container country={signupState.country ? signupState.country.countryCode : ''}
        updating_profile={updating_profile}
      >
        <div className="fullwidth pageTitle">
          <h3>{strings.register.gender}</h3>
        </div>
        {signupState.language === 'il' ? <div className="fullwidth gender_buttons" style={{marginBottom: '20px'}}>
          <Button type="hollow-primary" onClick={() => next({gender: 0})}>{strings.register.other}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 1})}>{strings.register.male}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 2})}>{strings.register.female}</Button>
        </div> :
        <div className="fullwidth gender_buttons" style={{marginBottom: '20px'}}>
          <Button type="hollow-primary" onClick={() => next({gender: 1})}>{strings.register.male}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 2})}>{strings.register.female}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 0})}>{strings.register.other}</Button>
        </div>}
        {signupState.language === 'il' ? <div className="fullwidth">
          <Button type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back  + " " + String.fromCharCode("187")}</Button>
        </div> :
        <div className="fullwidth">
          <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
        </div>}
      </Container>
    );
  }
}

class AgeSelector extends Component {

  constructor() {
    super();
    this.state = {
      inputValue: '',
      allowContinue: false
    }

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.ageInput.focus();
    }
  }

  render() {
    const {back, next, signupState, updating_profile} = this.props;
    const {inputValue, allowContinue} = this.state;
    return (
      <Container country={signupState.country ? signupState.country.countryCode : ''}
        updating_profile={updating_profile}
      >
        <div className="fullwidth pageTitle">
          <h3>{strings.register.years_of_age}</h3>
        </div>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <div style={{width: '270px', margin: '0 auto'}}>
            <InputGroup contiguous>
              <InputGroup.Section grow>
                <FormInput type="text" placeholder={strings.register.age} value={inputValue} ref={(input) => {this.ageInput = input}} onChange={(e) => this.inputChange(e.target.value)} onKeyPress={this.handleKeyPress}/>
              </InputGroup.Section>
            </InputGroup>
          </div>
        </div>
        {signupState.language === 'il' ? <div className="fullwidth">
          <Button style={{marginLeft: '30px'}} onClick={() => next({age: inputValue})} disabled={!allowContinue} type="hollow-success">{String.fromCharCode("171")} {strings.register.next}</Button>
          <Button style={{marginLeft: '20px'}} type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back + " " + String.fromCharCode("187")}</Button>
        </div> :
        <div className="fullwidth">
          <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
          <Button onClick={() => next({age: inputValue})} disabled={!allowContinue} type="hollow-success">{strings.register.next} {String.fromCharCode("187")}</Button>
        </div>}
      </Container>
    );
  }

  handleKeyPress(e) {
    const {allowContinue, inputValue} = this.state;
    const {next} = this.props;

    if (e.key === 'Enter') {
      if(allowContinue) {
        next({age: inputValue});
      }
    }
  }

  inputChange(newValue) {
    let allowContinue = false;
    if(isNaN(newValue)) {
      return;
    }
    if(newValue > 13 && newValue < 90) {
      allowContinue = true;
    }
    this.setState({inputValue: newValue, allowContinue});
  }
}

// Slider (0 - 7) where 0 is 'rather not say',
// For US 1-7: 1-`Very liberal` to 6-`Very conservative`
// For non US countries 1-7: 1-`Very left wing` to 6-`Very right wing`
class PoliticalAffiliationSelector extends Component {

  constructor() {
    super();
    this.state = {
      inputValue: 4,
    }

    this.inputChange = this.inputChange.bind(this);
    this.setNoAffiliation = this.setNoAffiliation.bind(this);
  }
  componentDidMount(){
    let inputValue = this.props.signupState.political_affiliation;
    if (inputValue){
      this.setState({inputValue})
    }
  }

  render() {
    const {back, next, signupState, updating_profile} = this.props;

    // if country == US - us_labels, else - non_us_labels
    let labels = strings.register.non_us_labels;
    if (signupState.country && signupState.country.countryCode === 'US'){
      labels = strings.register.us_labels;
    }
    // if user goes back to slider and his choise was 'rather not say'
    // drop the slider to initial state
    let {inputValue} = this.state;
    if (inputValue === 0){
      inputValue = 1;
    }

    return (
      <Container country={signupState.country ? signupState.country.countryCode : ''}
        updating_profile={updating_profile}
      >
        <div className="fullwidth pageTitle">
          <h3>{strings.register.political_affiliation}</h3>
          <p>{strings.register.political_affiliation_description}</p>
        </div>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <div style={{minWidth: '270px', margin: '0 auto'}}>
            <InputGroup contiguous>
              <InputGroup.Section grow>
                <div style={{display: 'inline-block', margin: '10px'}}>{labels[1]}</div>
                <input type="range" value={inputValue} min={1} max={labels.length - 1}
                  ref={(input) => {this.affiliationInput = input}}
                  onChange={(e) => this.inputChange(e.target.value)}
                  style={{display: 'inline-block', margin: '10px'}}
                />
                <div style={{display: 'inline-block', margin: '10px'}}>{labels[labels.length - 1]}</div>
              </InputGroup.Section>
            </InputGroup>

            {signupState.language === 'il' ? <div className="fullwidth" style={{textAlign: 'center', marginBottom: '10px'}}>
              <Button style={{marginLeft: '40px'}} onClick={() => next({political_affiliation: parseInt(inputValue)})}
                type="hollow-success">
                {String.fromCharCode("171")} {labels[inputValue]}
              </Button>
              <Button type="hollow-primary" className='buttonBack' style={{width: '100px', marginLeft: '20px'}}
                onClick={back}>{strings.register.back  + " " + String.fromCharCode("187")}
              </Button>
            </div> :
            <div className="fullwidth" style={{textAlign: 'center', marginBottom: '10px'}}>
              <Button type="hollow-primary" className='buttonBack' style={{width: '100px', marginRight: '10px'}}
                onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}
              </Button>
              <Button onClick={() => next({political_affiliation: parseInt(inputValue)})}
                type="hollow-success">
                {labels[inputValue]} {String.fromCharCode("187")}
              </Button>
            </div>}
            <div className="fullwidth" style={{textAlign: 'center'}}>
              <a style={{color: '#1385e5', margin: '10px'}}
                onClick={() => this.setNoAffiliation()}>{strings.register.would_rather_not_say}
              </a>
            </div>
          </div>
        </div>

      </Container>
    );
  }

  inputChange(newValue) {
    this.setState({inputValue: parseInt(newValue)});
  }
  setNoAffiliation() {
    this.setState({inputValue: 0});
    this.props.next({political_affiliation: 0})
  }
}

class AttemptSignup extends Component {

  constructor() {
    super();
    this.state = {
      awaitingResponse: true,
      error: null
    }
    this.register = this.register.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.register();
    }
  }

  register() {
    const {age, gender, postcode, country, political_affiliation} = this.props.signupState;
    const {next, signupState, updating_profile, access_token} = this.props;
    let {survey} = this.props.signupState;
    if (!survey) { survey = null; }
    const email = null;
    this.setState({awaitingResponse: true, error: null});
    // console.log('api.post', age, gender, postcode, country, political_affiliation, survey)
    api.post('user/create', {
      json: {age,
        gender,
        postcode,
        country: country.countryCode,
        political_affiliation,
        survey,
        email,
        update: updating_profile
      }
    })
      .then((response) => { // The rest of the validation is down to the server
        // console.log('user/create',response.jsonData.data)
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        let general_token = response.jsonData.data.token;
        if (updating_profile) {
          general_token = access_token;
        }
        chrome.storage.promise.local.set({general_token})
          .then((res) => {
            // console.log('chrome.storage.promise.local',res, response.jsonData.data.token)
            next({userCount: response.jsonData.data.userCount});
          })
          .catch((e) => {
            console.log(e);
            this.setState({error: strings.register.unknown_error, awaitingResponse: false});
          });
      })
      .catch((error) => {
        if(error.response) {
          this.setState({error: error.response.data.errorMessage, awaitingResponse: false});
        } else {
          this.setState({error: error.toString(), awaitingResponse: false});
        }
      })
  }

  render() {
    const {back, next, updating_profile, signupState} = this.props;
    const {awaitingResponse, error} = this.state;
    // console.log('attemptRegistration', awaitingResponse, error)
    return (
      <Container country={signupState.country ? signupState.country.countryCode : ''}
        updating_profile={updating_profile}
      >
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{strings.register.confirming} {awaitingResponse && <Spinner size="md" />}</h2>
          {error &&
            <span>
              <p>{strings.register.request_error}<br/>{'Registration is not completed. Check postcode.'+error}</p>
              {signupState.language === 'il' ?
                <Button type="hollow-primary" className='buttonBack' onClick={back}>{strings.register.back  + " " + String.fromCharCode("187")}</Button> :
                <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + strings.register.back}</Button>
              }
            </span>
            }
        </div>
      </Container>
    );
  }
}


class OxfordSurvey extends Component {
  constructor() {
    super();
    this.state = {
      surveyPage: 0,
      inputCompleted: false,
      notFilled: [],
      answers: [],
      survey: null,
      surveyName: 'oxford2018',
      fields: [],
      loadingSurvey: false,
    }
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSliderCheck = this.handleSliderCheck.bind(this);
    this.getSurvey = this.getSurvey.bind(this);
  }

  componentDidMount(){
    this.getSurvey(this.state.surveyName)
  }

  getSurvey(survey) {
    // Survey for US users is disabled
    this.setState({loadingSurvey: true})
    api.get('general/survey', {query: {survey}})
      .then((response) => {
        // console.log('user data', response, response.jsonData)
        if (response.status >= 200 && response.status < 300) {
          const {surveyquestions, surveyanswers} = response.jsonData.data;
          let fields = {};
          Object.keys(schema).forEach(field => {
            let questions = [];
            schema[field].forEach(q => {
              let answers = [];
              let question = Object.assign({}, {qid:q.qid, label:surveyquestions.filter(sq => sq.qid === q.qid)[0].label});
              q.answers.forEach(a => {
                let answer = Object.assign({}, {anid:a, label:surveyanswers.filter(sa => sa.anid === a)[0].label});
                answers.push(answer);
              })
              question['answers'] = answers;
              questions.push(question);
            })
            fields = Object.assign(fields, {[field]:questions})
          })
          // console.log('fields', fields)
          this.setState({survey: response.jsonData.data, loadingSurvey: false, fields})
        } else {
          console.log('Failed to fetch survey')
          this.setState({loadingSurvey: false});
        }
      })
      .catch((error) => {
        console.log(error)
        this.setState({loadingSurvey: false});
      })
  }

  nextPage() {
    const surveyPage = this.state.surveyPage + 1;
    const {fields, answers} = this.state;
    const sectionAnswers = fields[`fields${surveyPage}`].map(field => field.answers);
    let answered_ids = [];
    sectionAnswers.forEach(sa => {
      sa.forEach(a => answered_ids.push(a.anid));
    })
    const checkInputCompleted = answers.filter(a => answered_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
    this.setState({surveyPage, inputCompleted: checkInputCompleted})
  }

  prevPage() {
    const surveyPage = this.state.surveyPage - 1;
    this.setState({surveyPage, inputCompleted: true})
  }

  handleCheck(val, i, type) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;
    const name = parseInt(val.target.name);
    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    let section_ids = [];
    let multi_section_ids = [];

    fields[`fields${surveyPage}`].forEach(field => {
      let subField = [];
      field.answers.forEach(a => {
        section_ids.push(a.anid);
        subField.push(a.anid);
      })
      multi_section_ids.push(subField);
    })

    if (answers.length === 0) {
      answers.push(name);
    } else if (val.target.value === 'on') {
      answers = answers.filter(a => a !== name);
    } else if (val.target.value === 'off') {
      if (type !== 'multi'){
        answers = answers.filter(a => !answered_ids.includes(a))
      }
      answers.push(name);
    }

    let checkInputCompleted = false;
    if (type !== 'multi'){
      checkInputCompleted = answers.filter(a => section_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
    } else {
      let score = 0;
      multi_section_ids.forEach(section => {
        for (let k=0; k<answers.length; k++) {
          if (section.includes(answers[k])){
            score++;
            if (score === multi_section_ids.length) {
              checkInputCompleted = true;
              break;
            }
            break;
          }
        }
      })
    }

    if (checkInputCompleted) {
      inputCompleted = true;
    }
    this.setState({answers, inputCompleted})
  }

  handleSliderCheck(val, i) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;

    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    const sectionAnswers = fields[`fields${surveyPage}`][i].answers;
    let section_ids = [];
    fields[`fields${surveyPage}`].forEach(field => {
      field.answers.forEach(a => section_ids.push(a.anid))
    })
    let name = parseInt(val);
    if (answers.length === 0) {
      answers.push(sectionAnswers[name].anid);
    } else {
      answers = answers.filter(a => !answered_ids.includes(a));
      answers.push(sectionAnswers[name].anid);
    }
    const checkInputCompleted = answers.filter(a => section_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
    if (checkInputCompleted) {
      inputCompleted = true;
    }
    this.setState({answers, inputCompleted})
  }

  render(){
    const {surveyPage, inputCompleted, notFilled, answers, surveyName, fields, loadingSurvey} = this.state;
    const {back, next} = this.props;
    let serAnswers = '' + surveyName + ':';
    answers.forEach(a => {
      serAnswers = serAnswers + a + ',';
    })

    return(
      <div>
        <Container survey country={this.props.signupState.country ? this.props.signupState.country.countryCode : ''}>
          <div className="fullwidth">
            {loadingSurvey && <Spinner size='md' className='centeredSpinner'/>}
            {!loadingSurvey && surveyPage === 0 && <OxfordSurvey0/>}
            {surveyPage === 1 && <OxfordSurvey1 notFilled={notFilled} handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 2 && <OxfordSurvey2 notFilled={notFilled} handleCheck={this.handleSliderCheck} answers={answers} fields={fields}/>}
            {surveyPage === 3 && <OxfordSurvey3 notFilled={notFilled} handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 4 && <OxfordSurvey4 notFilled={notFilled} handleCheck={this.handleSliderCheck} answers={answers} fields={fields}/>}
            {surveyPage === 5 && <OxfordSurvey5 notFilled={notFilled} handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 6 && <OxfordSurvey6 notFilled={notFilled} handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
          </div>
          <div className="fullwidth">
            <InputGroup contiguous style={{width: '300px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
              <div style={{flex: 1, marginRight: 10}}>
                <Button style={{width: '130px'}}
                  type="hollow-primary"
                  className='buttonBack'
                  onClick={surveyPage === 0 ? () => next() : this.prevPage}
                  >
                  {surveyPage === 0 ? "Skip" : (String.fromCharCode("171") + " " + "Back")}
                </Button>
              </div>
              <div style={{flex: 1}}>
                <Button style={{width: '130px'}}
                  onClick={surveyPage === 6 ? () => next({survey: serAnswers}) : this.nextPage}
                  disabled={surveyPage > 0 && !inputCompleted}
                  type="hollow-success"
                  >
                  {((surveyPage === 0 ? "Take survey" : surveyPage === 6 ? "Finish" : "Next") + " " + String.fromCharCode("187"))}
                </Button>
              </div>
            </InputGroup>
          </div>
        </Container>
      </div>
    )
  }
}

const shareLinkFB = (country) => {
  let title = strings.register.shareFacebook;
  if (country === 'GB') {
    title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
  }
  return "http://www.facebook.com/sharer.php?u=https%3A%2F%2Fwhotargets.me&title=" + encodeURIComponent(title) ;
}

const shareLinkTwitter = (country) => {
  let title = strings.register.shareTwitter;
  if (country === 'GB') {
    title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
  }
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) ;
}

class PostSignupShare extends Component {

  render() {
    const {next, signupState, updating_profile} = this.props;
    const userCountry = signupState.country ? signupState.country.countryCode : null;
    const userCountryNative = countries_in_native_lang[userCountry];
    const input = signupState.userCount || null; //chrome.storage.promise.local.get('userCount') || null;
    const {userCount, nextUserCount} = getUserCount(input, 'country');

    return (
      <Container country={signupState.country ? signupState.country.countryCode : ''}>
        {!userCountry && <div className="fullwidth pageTitle" style={{margin: '0px 50px'}}>
          {updating_profile && <h3>{strings.update.updated_success}</h3>}
          <h3>{strings.register.share}</h3>
        </div>}

        {!userCountry && <div className="fullwidth">
          <Row style={{margin: '10px'}}>
            <Col sm="1/2">
              {signupState.language === 'il' ? <Button
                type="hollow-primary"
                className='buttonTW'
                href={shareLinkTwitter()}
                style={{float:'left', marginRight: 5}}>
                  {strings.register.shareOnTwitter}
                </Button> : <Button type="hollow-primary"
                className='buttonFB'
                href={shareLinkFB()}
                style={{float:'right', marginLeft: 5}}>
                  {strings.register.shareOnFacebook}
                </Button>}
            </Col>
            <Col sm="1/2">
              {signupState.language === 'il' ? <Button type="hollow-primary"
              className='buttonFB'
              href={shareLinkFB()}
              style={{float:'right', marginLeft: 5}}>
                {strings.register.shareOnFacebook}
              </Button> : <Button
                type="hollow-primary"
                className='buttonTW'
                href={shareLinkTwitter()}
                style={{float:'left', marginRight: 5}}>
                  {strings.register.shareOnTwitter}
                </Button>}
            </Col>
          </Row>
        </div>}

        {userCountry && <Row style={{backgroundColor: 'transparent', minHeight: '120px', color: 'black'}}>
          <Col sm="1">
            {updating_profile && <h3>{strings.update.updated_success}</h3>}
            <div className="statbox" style={{height: '140px', backgroundColor: 'transparent'}}>
            <div style={{padding: '5px 15px', height: '120px', margin: 'auto', textAlign: 'center'}}>
              <span style={{fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '25px'}}>{sprintf(strings.register.share3, userCount, userCountryNative)}</span>
              <br/>
              <span style={{fontSize: '1.05rem', lineHeight: '25px'}}>{sprintf(strings.register.share4, nextUserCount)}</span>
            </div>
              {signupState.language === 'il' ? <div>
                <Button style={{position: 'absolute', bottom: 5, left: 360}} type="hollow-primary" className='buttonTW' href={shareLinkTwitter()} >{strings.register.shareOnTwitter}</Button>
                <Button style={{position: 'absolute', bottom: 5, left: 160}} type="hollow-primary" className='buttonFB' href={shareLinkFB()}>{strings.register.shareOnFacebook}</Button>
              </div> :
              <div>
                <Button style={{position: 'absolute', bottom: 5, left: 160}} type="hollow-primary" className='buttonFB' href={shareLinkFB(userCountry)}>{strings.register.shareOnFacebook}</Button>
                <Button style={{position: 'absolute', bottom: 5, left: 360}} type="hollow-primary" className='buttonTW' href={shareLinkTwitter(userCountry)} >{strings.register.shareOnTwitter}</Button>
              </div>}
            </div>
          </Col>
        </Row>}

        <div className="fullwidth">
          {signupState.language === 'il' ?
            <Button onClick={next} type="hollow-primary" className='buttonBack'>{String.fromCharCode("171")} {strings.register.skip}</Button> :
            <Button onClick={next} type="hollow-primary" className='buttonBack'>{strings.register.skip} {String.fromCharCode("187")}</Button>
          }
        </div>
      </Container>
    );
  }
}

const signupStages = [
      {
        component: <LanguageSelector/>,
      },
      {
        component: <TermsPrivacy/>,
      },
      {
        component: <CountrySelector/>,
      },
      {
        component: <PostcodeSelector/>,
      },
      {
        component: <GenderSelector/>,
      },
      {
        component: <AgeSelector/>,
      },
      {
        component: <PoliticalAffiliationSelector/>,
      },
      // {
      //   component: <OxfordSurvey/>,
      // },
      {
        component: <AttemptSignup/>,
      },
      {
        component: <PostSignupShare/>,
      }
    ];

export default signupStages;
