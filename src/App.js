import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const mockFHIRData = {
  "patients": [
    {
      "id": "12345",
      "name": "John Doe",
      "medications": [
        { "name": "Ibuprofen", "rxCUI": "5640" },
        { "name": "Warfarin", "rxCUI": "11289" }
      ]
    },
    {
      "id": "67890",
      "name": "Jane Smith",
      "medications": [
        { "name": "Aspirin", "rxCUI": "1191" },
        { "name": "Lisinopril", "rxCUI": "29046" }
      ]
    }
  ]
};

const fetchDrugInteractions = async (rxCUIs) => {
  if (rxCUIs.length < 2) return [];
  const url = `https://biothings.ncats.io/ddinter/query?q=${rxCUIs.join(",")}&fields=interaction`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return [];
  }
};

const DrugInteractionApp = () => {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  const handleSearch = (id) => {
    const foundPatient = mockFHIRData.patients.find(p => p.id === id);
    setPatient(foundPatient || null);
    setInteractions([]);
  };

  useEffect(() => {
    if (patient && patient.medications.length > 1) {
      const rxCUIs = patient.medications.map(med => med.rxCUI);
      fetchDrugInteractions(rxCUIs).then(setInteractions);
    }
  }, [patient]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPatientId(value);
    setFilteredPatients(
      mockFHIRData.patients.filter(p => p.id.includes(value) || p.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg">
        <h1 className="mb-4 text-center">Drug Interaction Checker</h1>
        <input
          type="text"
          value={patientId}
          onChange={handleInputChange}
          placeholder="Enter Patient ID or Name"
          className="form-control mb-2"
        />
        {filteredPatients.length > 0 && (
          <ul className="list-group mb-2">
            {filteredPatients.map(p => (
              <li
                key={p.id}
                onClick={() => {
                  setPatientId(p.id);
                  handleSearch(p.id);
                  setFilteredPatients([]);
                }}
                className="list-group-item list-group-item-action"
              >
                {p.name} (ID: {p.id})
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => handleSearch(patientId)} className="btn btn-primary w-100">
          Search
        </button>

        {patient && (
          <div className="mt-4">
            <h2 className="text-center">Patient: {patient.name}</h2>
            <h3 className="mt-3">Medications:</h3>
            <ul className="list-group">
              {patient.medications.map(med => (
                <li key={med.rxCUI} className="list-group-item">{med.name} (RxCUI: {med.rxCUI})</li>
              ))}
            </ul>

            {interactions.length > 0 ? (
              <div className="mt-4">
                <h3>Potential Interactions:</h3>
                {interactions.map((interaction, index) => (
                  <div key={index} className="alert alert-danger mt-2">
                    <p>{interaction.interaction}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-muted text-center">No interactions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugInteractionApp;
