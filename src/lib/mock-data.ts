import { Patient } from './pcc-client';

const facilities = ['Autumn Lake Towson', 'Complete Care Loch Raven', 'Communicare Ellicott City'];
const diagnoses = ['CHF', 'COPD', 'DM', 'CVA', 'Hip Fracture', 'Dementia', 'PNA', 'UTI', 'Wound Care'];

function generateMockResidents(): Patient[] {
  const residents: Patient[] = [];
  let idCounter = 1;
  
  facilities.forEach(facility => {
    for (let i = 0; i < 30; i++) {
      const riskScore = i < 6 ? Math.floor(Math.random() * 21) + 80 // 20% high
        : i < 15 ? Math.floor(Math.random() * 30) + 50 // 30% medium
        : Math.floor(Math.random() * 50); // 50% low
        
      residents.push({
        id: `P${idCounter++}`,
        name: `Patient ${idCounter - 1}`,
        room: `${Math.floor(Math.random() * 300) + 100}`,
        riskScore,
        primaryDiagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        alerts: {
          fallRisk: Math.random() > 0.8,
          medSafety: Math.random() > 0.85,
          hospitalization: riskScore > 75,
          pdpm: Math.random() > 0.7
        },
        vitals: {
          bp: `${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 30) + 60}`,
          hr: Math.floor(Math.random() * 40) + 60,
          temp: 97 + Math.random() * 3,
          o2: 90 + Math.floor(Math.random() * 10),
          weightChange: (Math.random() * 10) - 5
        },
        daysSinceVisit: Math.floor(Math.random() * 40),
        summary: 'Patient condition is stable with ongoing monitoring required.',
        medications: ['Lisinopril 10mg', 'Metformin 500mg', 'Atorvastatin 20mg'],
        carePlanGaps: ['Missing recent A1C', 'Fall risk assessment outdated'],
        intervention: 'Review medications and update care plan',
        pdpmDetails: {
          currentRUG: 'RBC',
          suggestedRUG: 'RCA',
          dollarUpside: Math.floor(Math.random() * 100) + 20
        },
        facility,
        unit: `Unit ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`
      });
    }
  });
  return residents;
}

export const mockResidents = generateMockResidents();

export const mockQualityMeasures = {
  pressureInjuries: { value: 4.2, national: 5.5, state: 5.0, trend: 'down' },
  falls: { value: 2.1, national: 3.4, state: 3.1, trend: 'down' },
  antipsychotics: { value: 12.5, national: 14.2, state: 13.8, trend: 'up' },
  utis: { value: 3.8, national: 4.5, state: 4.2, trend: 'down' },
  mobility: { value: 18.2, national: 20.1, state: 19.5, trend: 'up' },
  discharge: { value: 45.6, national: 42.1, state: 43.5, trend: 'up' }
};

export const mockIncidents = [
  { id: 'I1', type: 'Fall', severity: 'Minor', resident: 'P12', status: 'Resolved' },
  { id: 'I2', type: 'UTI', severity: 'Moderate', resident: 'P45', status: 'Active' },
  { id: 'I3', type: 'Pressure Injury', severity: 'Major', resident: 'P08', status: 'Active' }
];

export const mockCensus = {
  occupancy: 88,
  payerMix: {
    medicareA: 25,
    medicareAdvantage: 35,
    medicaid: 30,
    private: 10
  }
};
