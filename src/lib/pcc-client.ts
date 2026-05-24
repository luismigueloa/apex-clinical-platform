import { mockResidents, mockQualityMeasures, mockIncidents, mockCensus } from './mock-data';

export interface Patient {
  id: string;
  name: string;
  room: string;
  riskScore: number;
  primaryDiagnosis: string;
  alerts: {
    fallRisk: boolean;
    medSafety: boolean;
    hospitalization: boolean;
    pdpm: boolean;
  };
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    o2: number;
    weightChange: number;
  };
  daysSinceVisit: number;
  summary: string;
  medications: string[];
  carePlanGaps: string[];
  intervention: string;
  pdpmDetails: {
    currentRUG: string;
    suggestedRUG: string;
    dollarUpside: number;
  };
  facility: string;
  unit: string;
}

const useMockData = !process.env.PCC_CLIENT_ID || !process.env.PCC_CLIENT_SECRET;

export async function getResidents(facilityId: string): Promise<Patient[]> {
  if (useMockData) {
    return mockResidents.filter(r => r.facility === facilityId);
  }
  // TODO: Real API call here using client credentials flow
  return [];
}

export async function getResidentDetail(id: string) {
  if (useMockData) return mockResidents.find(r => r.id === id);
  return null;
}

export async function getVitals(id: string) {
  if (useMockData) return mockResidents.find(r => r.id === id)?.vitals;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getQualityMeasures(facilityId: string) {
  if (useMockData) return mockQualityMeasures;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getIncidents(facilityId: string) {
  if (useMockData) return mockIncidents;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCensus(facilityId: string) {
  if (useMockData) return mockCensus;
  return null;
}
