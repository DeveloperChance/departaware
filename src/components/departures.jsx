import React from 'react';
import { _getLocaleHours, _getAgoTime } from '../services/base';
import axios from 'axios';
import config from '../config.json';

const apiEndpoint = config.env === "dev" ? config.apiEndpointDev : config.apiEndpoint;

class Departures extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allowSubmit: true,
      toggleDeparturesForm: false,
      gates: ["A3", "A5", "A7", "A8", "A10", "A11", "A12", "A14", "A15", "B1", "B2", "B6", "B9", "B10", "B11", "B12", "B14", "B15", "B17", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "C1", "C2", "C3", "C4", "C5", "C7", "C8", "C9", "C11", "C12", "C14", "C16", "C19", "C21", "C22", "C23", "C24", "C25"],
      selectedGates: [],
      selectedAirline: "swa",
      selectedFlight: undefined,
      departures: [],
      selectedDate: ''
    };
  }

  componentDidMount = () => {
    this.getDeparturesInterval = setInterval(this.getDepartures, 1000 * 30);
    let selectedGates = JSON.parse(localStorage.getItem("selectedGates"));
    if (!selectedGates) selectedGates = [];
    let selectedDate = new Date().toLocaleDateString().split('/');;
    selectedDate = `${selectedDate[2]}-${selectedDate[0]}-${selectedDate[1]}`;
    this.setState({ selectedGates, selectedDate });

    setTimeout(() => {
      this.getDepartures();
    }, 100);
  };

  componentWillUnmount = () => {
    clearInterval(this.getDeparturesInterval);
  }

  handleGateSelection = (gate) => {
    let selectedGates = this.state.selectedGates;
    if (this.state.selectedGates.includes(gate)) {
      // Remove from Array
      let newSelected = [];
      for (let i = 0; i < selectedGates.length; i++) {
        const element = selectedGates[i];
        if (element === gate) continue;
        newSelected.push(element);
      }
      localStorage.setItem("selectedGates", JSON.stringify(newSelected));
      this.setState({ selectedGates: newSelected });
      setTimeout(() => {
        this.getDepartures(true);
      }, 100);
    } else {

      // Add to Array
      selectedGates.push(gate);
      localStorage.setItem("selectedGates", JSON.stringify(selectedGates));
      this.setState({ selectedGates: selectedGates });
      setTimeout(() => {
        this.getDepartures(true);
      }, 100);
    }
  }

  getDepartures = (manual) => {
    if (!this.state.allowSubmit || this.state.selectedGates.length < 1) return;
    if (manual) this.setState({ departures: [] });
    this.setState({ allowSubmit: false });

    // Convert Locale Date to Unix Locale Format
    let localeDate = this.state.selectedDate.split('-');
    localeDate = `${localeDate[1]}/${localeDate[2]}/${localeDate[0]}`;
    let convertDate = Math.floor(new Date(localeDate).getTime() / 1000);

    axios.get(`${apiEndpoint}/depart/departures`, { params: { date: convertDate, gates: this.state.selectedGates } })
      .then(({ data }) => {
        if (!data) return;
        let departuresScheduled = data.response;
        let depaturesFiltered = [];
        for (let i = 0; i < departuresScheduled.length; i++) {
          const element = departuresScheduled[i];
          if (this.state.selectedGates.includes(element.gate_origin) || this.state.selectedGates.includes(element.gate_origin_update)) depaturesFiltered.push(element);
          continue;
        }
        return this.setState({ departures: depaturesFiltered, allowSubmit: true });
      })
      .catch(error => {
        console.log(error);
        return this.setState({ allowSubmit: true });
      });
  }

  handleFlightExtended = (flight) => {
    if (!flight || flight.length < 1) return;
    if (flight === this.state.selectedFlight) return this.setState({ selectedFlight: undefined });
    return this.setState({ selectedFlight: flight });
  }

  render() {
    return (
      <React.Fragment>
        <h1 className="Departures-Title">KLAS Departures</h1>
        <p className="Departures-Selection">Selected Gates</p>
        <p onClick={() => this.setState({ toggleDeparturesForm: !this.state.toggleDeparturesForm })} className="Departures-Form-Toggle">Select Gates</p>
        <form className="Departures-Form" style={{ display: this.state.toggleDeparturesForm ? `flex` : `none` }}>
          {this.state.gates.map((gate) => {
            return <span onClick={() => this.handleGateSelection(gate)} key={`option_${gate}`} className="Departures-Form-Option">
              <input checked={this.state.selectedGates.includes(gate)} readOnly type="checkbox" />
              <label className="Departures-Form-Option-Labl">{gate}</label>
            </span>
          })}
        </form>
        <div className="padding-5" />
        <div className="Departures-Gates-Container">
          {this.state.selectedGates.map((gate) => {
            return <div key={`selected_${gate}`} className="Departures-Gate-Container"><p className="Departures-GateText">{gate}</p></div>
          })}
        </div>
        <p className="Departures-Selection">Selected Airlines</p>
        <div className="Departures-Gates-Container">
          <div className="Departures-Gate-Container"><p className="Departures-GateText">SWA</p></div>
        </div>
        <div className="divider-center" />
        <div className="padding-5" />
        <p className="Departures-Selection">Selected Date</p>
        <form>
          <input onChange={(e) => { this.setState({ selectedDate: e.target.value }) }} defaultValue={this.state.selectedDate} type="date" className="Departures-Form-Option-Date" />
        </form>
        <div className="padding-5" />
        <p onClick={() => this.getDepartures(true)} className="Departures-Form-Toggle">Refresh Departures</p>
        <div className="Departures-Container">
          <div className="panel-table">
            <div className="panel-thead">
              <div className="panel-thead-tr">
                <div className="panel-thead-th"></div>
                <div className="panel-thead-th">Flight Ident</div>
                <div className="panel-thead-th">Gate</div>
                <div className="panel-thead-th">Arr.</div>
                <div className="panel-thead-th">Dep.</div>
                <div className="panel-thead-th">Dest.</div>
              </div>
            </div>
            <div className="panel-tbody">
              {this.state.departures.length > 0
                && (
                  this.state.departures.map((flight) => {
                    let status = flight.status;
                    if (status === "result unknown") return false;
                    if (status === "Taxiing / Left Gate" || status === "Taxiing / Delayed" || status === "En Route / On Time" || status === "En Route / Delayed" || status === "Arrived / Gate Arrival" || status === "Arrived / Delayed") status = "Departed";
                    if (status === "Scheduled / Delayed") status = "Delayed";
                    let statusColor = 'transparent';
                    if (status === "Cancelled") statusColor = '#701414';
                    if (status === "Delayed") statusColor = '#b3740e';
                    if (status === "Departed" || flight.actual_out) statusColor = '#0c6b43';

                    let arrTime = '~';
                    let arrTimeType = 'N/A';
                    let depGateType = 'Planned';
                    if (flight.inbound_scheduled_on) {
                      arrTime = _getLocaleHours(flight.inbound_scheduled_on);
                      arrTimeType = 'Sch.';
                    }
                    if (flight.inbound_estimated_in) {
                      arrTime = _getLocaleHours(flight.inbound_estimated_in);
                      arrTimeType = 'Est.';
                    }
                    if (flight.inbound_actual_in) {
                      arrTime = _getLocaleHours(flight.inbound_actual_in);
                      arrTimeType = 'Act';
                    }

                    if (flight.inbound_actual_in && !flight.actual_out && status !== "Cancelled") {
                      depGateType = 'At Gate';
                      statusColor = '#4287f5';
                    }

                    let depTime = flight.scheduled_out;
                    let depTimeType = 'Sch.'
                    if (flight.estimated_out) {
                      depTime = flight.estimated_out;
                      depTimeType = 'Est.'
                    }
                    if (flight.actual_out) {
                      depTime = flight.actual_out;
                      depTimeType = 'Act.'
                      depGateType = 'Left Gate';
                    }

                    // Gate Logic
                    let gateColor = 'inherit';
                    if (flight.gateChange && flight.gateChange.gate_origin && flight.gateChange.gate) gateColor = '#bf4342';
                    if (flight.status === "Cancelled") gateColor = '#464646';

                    return <React.Fragment key={flight.ident}>
                      <div onClick={() => this.handleFlightExtended(flight.ident)} className="panel-tbody-tr">
                        <div className="panel-tbody-td" style={{ backgroundColor: statusColor }}>{(flight.gateChange && flight.gateChange.gate_origin && flight.gateChange.gate) && (<span className='panel-tbody-td-note-span' />)}</div>
                        <div className="panel-tbody-td">
                          <span className="panel-tbody-td-span">
                            <span className="panel-tbody-td-info" style={{ textDecoration: status === 'Cancelled' ? 'line-through' : 'none', color: status === 'Cancelled' ? '#464646' : 'inherit' }}>{flight.ident}</span>
                            <span className="panel-tbody-td-label">{status}</span>
                          </span>
                        </div>
                        <div className="panel-tbody-td">
                          <span className="panel-tbody-td-span">
                            <span className="panel-tbody-td-info" style={{ textDecoration: status === 'Cancelled' ? 'line-through' : 'none', color: gateColor, fontWeight: 600 }}>{(flight.gateChange && flight.gateChange.gate !== null) ? flight.gateChange.gate : flight.gate_origin}</span>
                            <span className="panel-tbody-td-label">{depGateType}</span>
                          </span>
                        </div>
                        <div className="panel-tbody-td">
                          <span className="panel-tbody-td-span">
                            <span className="panel-tbody-td-info" style={{ textDecoration: status === 'Cancelled' ? 'line-through' : 'none', color: status === 'Cancelled' ? '#464646' : 'inherit' }}>{arrTime}</span>
                            <span className="panel-tbody-td-label">{arrTimeType}</span>
                          </span>
                        </div>
                        <div className="panel-tbody-td">
                          <span className="panel-tbody-td-span">
                            <span className="panel-tbody-td-info" style={{ textDecoration: status === 'Cancelled' ? 'line-through' : 'none', color: status === 'Cancelled' ? '#464646' : 'inherit' }}>{_getLocaleHours(depTime)}</span>
                            <span className="panel-tbody-td-label">{depTimeType}</span>
                          </span>
                        </div>
                        <div className="panel-tbody-td" style={{ textDecoration: status === 'Cancelled' ? 'line-through' : 'none', color: status === 'Cancelled' ? '#464646' : 'inherit' }}>{flight.destination}</div>
                      </div>
                      <div className={this.state.selectedFlight === flight.ident ? `panel-tbody-tr-extended-visible panel-tbody-tr-extended` : `panel-tbody-tr-extended`}>
                        {(flight.gateChange && flight.gateChange.gate_origin && flight.gateChange.gate) && (<div className='panel-tbody-tr-extended-note'><p>Gate Change: {flight.gate_origin}  &#187;  {flight.gateChange.gate} </p></div>)}
                        <span className='panel-tbody-tr-extended-temp'>
                          <p style={{ color: '#464646' }}>Registration: <b style={{ color: 'white' }}>{flight.registration}</b></p>
                          {flight.inbound_dep_delay ? <p style={{ color: '#464646' }}>Inbound Arrival Delay: <b style={{ color: '#eb4034' }}>{Math.floor(flight.inbound_dep_delay / 60)}m</b></p> : ''}
                          {flight.departure_delay ? <p style={{ color: '#464646' }}>Departure Delay: <b style={{ color: '#eb4034' }}>{Math.floor(flight.departure_delay / 60)}m</b></p> : ''}
                        </span>
                        <p className='panel-tbody-tr-extended-updated'>Last Updated: {_getAgoTime(flight.updated_at)}</p>
                      </div>
                      <div className={this.state.selectedFlight === flight.ident ? `panel-tbody-tr-extended-padding-visible panel-tbody-tr-extended-padding` : `panel-tbody-tr-extended-padding`} />
                    </React.Fragment>
                  })
                )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Departures
