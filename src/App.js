import React, { useState, useEffect } from "react";

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
  const url = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxCUIs.join(",")}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.fullInteractionTypeGroup || [];
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
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Drug Interaction Checker</h1>
      <input
        type="text"
        value={patientId}
        onChange={handleInputChange}
        placeholder="Enter Patient ID or Name"
        className="border p-2 w-full rounded"
      />
      {filteredPatients.length > 0 && (
        <ul className="border p-2 bg-gray-100 rounded">
          {filteredPatients.map(p => (
            <li
              key={p.id}
              onClick={() => {
                setPatientId(p.id);
                handleSearch(p.id);
                setFilteredPatients([]);
              }}
              className="cursor-pointer p-1 hover:bg-gray-200"
            >
              {p.name} (ID: {p.id})
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => handleSearch(patientId)} className="bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>

      {patient && (
        <div>
          <h2 className="text-lg font-semibold mt-4">Patient: {patient.name}</h2>
          <h3 className="text-md font-medium">Medications:</h3>
          <ul>
            {patient.medications.map(med => (
              <li key={med.rxCUI}>{med.name} (RxCUI: {med.rxCUI})</li>
            ))}
          </ul>

          {interactions.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-md font-medium">Potential Interactions:</h3>
              {interactions.map((group, index) => (
                <div key={index} className="bg-red-100 p-2 mt-2 rounded">
                  {group.fullInteractionType.map((interaction, idx) => (
                    <p key={idx}>{interaction.interactionPair[0].description}</p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">No interactions found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DrugInteractionApp;