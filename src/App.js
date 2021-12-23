import React from 'react';
import './App.css'
import Departures from './components/departures';

function App() {
  return (
    <React.Fragment>
      <div className="App">
        <Departures />
      </div>
      <div className="App-Footer">
        <p><b>Prototype</b> </p>
        <p>Departure Awareness Application</p>
        <p>&copy; DeveloperChance {new Date().getFullYear()}</p>
      </div>
    </React.Fragment>
  );
}

export default App;
