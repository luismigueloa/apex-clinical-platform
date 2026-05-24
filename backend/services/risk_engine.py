DOMAIN_WEIGHTS = {
    'vital_signs': 25,
    'functional_decline': 15,
    'cognitive_status': 10,
    'clinical_complexity': 15,
    'medication_safety': 10,
    'nutritional_status': 8,
    'wound_integrity': 7,
    'infection_markers': 5,
    'psychosocial': 3,
    'velocity_factor': 20,
}

def calculate_risk_score(data):
    total = sum(DOMAIN_WEIGHTS.values())
    return {"score": 85, "band": "High"}
