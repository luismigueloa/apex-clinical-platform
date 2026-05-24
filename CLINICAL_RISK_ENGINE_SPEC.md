# Apex Clinical Intelligence Platform
## Clinical Risk Stratification & Management Plan Engine
### Comprehensive Technical & Clinical Specification

**Version:** 1.0  
**Date:** April 15, 2026  
**Classification:** Confidential — Internal Use Only  
**Prepared by:** Ibrahim M. Rizqui, M.D., CMD  
**Organization:** Apex Healthcare Advanced Medicine Division

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Clinical Risk Algorithm — Domain-by-Domain Specification](#2-clinical-risk-algorithm)
3. [Scoring Model & Risk Bands](#3-scoring-model--risk-bands)
4. [Management Plan Framework](#4-management-plan-framework)
5. [10 Clinical Scenario Templates](#5-clinical-scenario-templates)
6. [Technical Implementation Spec for Codex](#6-technical-implementation-spec)
7. [Evidence Base & References](#7-evidence-base--references)

---

## 1. Executive Summary

### Purpose

The Clinical Risk Stratification & Management Plan Engine ("CRSME") is the core intelligence layer of the Apex Clinical Intelligence Platform. It is designed to serve as a decision-support system for Board-Certified Medical Directors overseeing skilled nursing facility (SNF) populations. The engine continuously evaluates every resident across 10 clinical domains, producing a composite risk score (1–100) that predicts the probability of clinical deterioration or 30-day rehospitalization. For each at-risk resident, the engine generates a specific, physician-actionable management plan grounded in current clinical guidelines.

### Clinical Problem

SNF 30-day all-cause rehospitalization rates remain 20–27% nationally (Mor et al., 2010; CMS CASPER data 2024). Each avoidable rehospitalization costs Medicare approximately $12,000–$14,000 and exposes patients to iatrogenic harm, functional decline, and delirium. CMS penalizes facilities through the SNF Value-Based Purchasing (VBP) program, with risk-standardized readmission rates (RSRR) directly impacting reimbursement. INTERACT II (Interventions to Reduce Acute Care Transfers) has demonstrated 17–24% reductions in rehospitalization when consistently applied, but adoption remains inconsistent because it relies on manual clinical judgment without quantitative risk stratification.

### What This Engine Does

1. **Scores every resident 1–100** using a weighted, multi-domain algorithm that synthesizes physiologic data, functional status, cognitive trends, clinical complexity, medication safety, nutritional markers, wound status, infection signals, psychosocial factors, and recent event velocity — all extracted from PointClickCare (PCC) structured data.

2. **Classifies residents into five risk bands**: CRITICAL (80–100), HIGH (60–79), MODERATE (40–59), LOW (20–39), and STABLE (0–19) — each with defined response timelines and escalation pathways.

3. **Generates domain-specific management plans** that tell the Medical Director exactly what to assess, order, adjust, communicate, and document for each triggered risk domain.

4. **Provides 10 scenario-specific clinical templates** for the most common rehospitalization drivers (CHF, sepsis, delirium, UTI, COPD, falls, wounds, aspiration, drug toxicity, functional decline) — each with INTERACT II Stop-and-Watch criteria, in-place treatment protocols, transfer criteria, and documentation templates.

### Design Principles

- **Evidence-based**: Every domain weight, threshold, and management recommendation is grounded in peer-reviewed literature, CMS Quality Measures, and INTERACT II pathways.
- **Immediately actionable**: Output is not a statistical probability. It is a specific set of physician orders and clinical decisions.
- **Clinically defensible**: The scoring model can withstand medical-legal scrutiny. Every recommendation is traceable to a published guideline.
- **PCC-native**: All input variables map directly to PointClickCare API fields. No manual data entry required.
- **Fail-safe**: Missing data fields degrade gracefully — the engine adjusts domain weights rather than producing false negatives.

---

## 2. Clinical Risk Algorithm — Domain-by-Domain Specification

### Architecture Overview

The CRSME uses a **weighted additive model with multiplicative interaction terms** for high-risk domain combinations. Each of the 10 domains contributes a raw domain score (0–10). Domain scores are weighted and summed to produce a composite score (0–100). Specific domain interactions (e.g., CHF + CKD + recent hospitalization) apply multiplicative amplifiers that can push the composite above the weighted sum, capped at 100.

**Composite Score Formula:**

```
CompositeScore = min(100, Σ(DomainScore_i × Weight_i) + InteractionBonus)
```

Where:
- `DomainScore_i` = normalized domain score (0–10)
- `Weight_i` = domain weight (sum of all weights = 10.0)
- `InteractionBonus` = additional points for high-risk domain combinations (0–15)

### Domain Weight Distribution

| Domain | Weight | Max Contribution | Rationale |
|--------|--------|-----------------|-----------|
| D1: Vital Signs & Physiologic Instability | 1.2 | 12 | Acute physiologic derangement is the immediate proximal cause of deterioration |
| D2: Functional Decline | 0.9 | 9 | Sudden functional decline is an independent predictor of 90-day mortality (Volpato et al., 2007) |
| D3: Cognitive & Behavioral Status | 0.8 | 8 | Acute cognitive change has high sensitivity for delirium/sepsis (Inouye et al., 2014) |
| D4: Clinical Complexity | 1.3 | 13 | Comorbidity burden is the strongest baseline predictor of rehospitalization (Charlson, 1987) |
| D5: Medication Safety | 0.9 | 9 | High-risk medications are the #2 cause of preventable adverse events in SNFs (Gurwitz et al., 2005) |
| D6: Nutritional & Metabolic Status | 0.7 | 7 | Involuntary weight loss predicts 90-day mortality; malnutrition impairs healing (Sullivan et al., 1999) |
| D7: Wound & Skin Integrity | 0.7 | 7 | Stage 3/4 pressure injuries with stalled healing predict sepsis and hospitalization (Lyder & Ayello, 2008) |
| D8: Infection & Inflammatory Markers | 1.0 | 10 | Infection is the #1 cause of SNF-to-hospital transfer (Ouslander et al., 2010) |
| D9: Psychosocial & Care Engagement | 0.5 | 5 | Advance directive gaps contribute to avoidable hospitalizations (Teno et al., 2002) |
| D10: Recent Clinical Events (Velocity) | 2.0 | 20 | Recent hospitalization is the single strongest predictor of rehospitalization (Mor et al., 2010) |
| **TOTAL** | **10.0** | **100** | |

---

### Domain 1: Vital Signs & Physiologic Instability

**Weight: 1.2 | Max Contribution: 12 points**

**Clinical Rationale:** Vital sign abnormalities are the most immediate and objective indicators of physiologic instability. The INTERACT II "Stop and Watch" tool uses vital sign changes as primary triggers for early warning. A single abnormal vital is less predictive than a trending pattern — the Modified Early Warning Score (MEWS) literature demonstrates that sequential vital sign deterioration has superior predictive value over isolated readings (Subbe et al., 2001).

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Systolic BP < 90 mmHg | `vitals.systolic_bp` | Current reading | 3.0 | Hypotension — immediate concern for sepsis, dehydration, cardiac event |
| Systolic BP > 180 mmHg | `vitals.systolic_bp` | Current reading | 2.0 | Hypertensive urgency — stroke risk, end-organ damage |
| Systolic BP trending down >20 mmHg over 72h | `vitals.systolic_bp` (3-day trend) | Delta calculation | 2.5 | Progressive hemodynamic instability |
| Heart rate > 100 bpm | `vitals.heart_rate` | Current reading | 2.0 | Tachycardia — infection, pain, CHF decompensation, hypovolemia |
| Heart rate < 50 bpm | `vitals.heart_rate` | Current reading | 2.5 | Bradycardia — medication toxicity (digoxin, beta-blockers), cardiac conduction disease |
| HR trending up >20 bpm over 48h | `vitals.heart_rate` (2-day trend) | Delta calculation | 2.0 | Progressive tachycardia suggests worsening clinical state |
| Temperature > 38.3°C (101°F) | `vitals.temperature` | Current reading | 2.5 | Fever — infection until proven otherwise in SNF population |
| Temperature > 37.8°C with immunocompromised status | `vitals.temperature` + `diagnoses` | Combined | 3.0 | Lower threshold per IDSA guidelines for elderly/immunocompromised |
| Temperature < 35.5°C (96°F) | `vitals.temperature` | Current reading | 3.0 | Hypothermia — paradoxical indicator of severe sepsis in elderly |
| O2 saturation < 92% on room air | `vitals.o2_sat` | Current reading | 3.0 | Hypoxemia — respiratory failure, CHF, PE, pneumonia |
| O2 saturation < 88% on supplemental O2 | `vitals.o2_sat` + `vitals.o2_delivery` | Combined | 4.0 | Refractory hypoxemia — exceeds SNF management capability |
| O2 sat decline > 4% from baseline over 24h | `vitals.o2_sat` (24h trend) | Delta | 2.5 | Acute respiratory decompensation |
| Respiratory rate > 24/min | `vitals.respiratory_rate` | Current reading | 2.0 | Tachypnea — early sign of respiratory distress, sepsis, metabolic acidosis |
| Respiratory rate > 30/min | `vitals.respiratory_rate` | Current reading | 3.5 | Severe respiratory distress — transfer consideration |
| Weight gain > 3 lbs in 3 days | `vitals.weight` (3-day delta) | Calculated | 2.5 | Fluid overload — CHF exacerbation (AHA Stage C heart failure criteria) |
| Weight gain > 5 lbs in 7 days | `vitals.weight` (7-day delta) | Calculated | 3.0 | Progressive fluid retention |
| Weight loss > 5% in 30 days | `vitals.weight` (30-day delta) | Calculated | 2.5 | Involuntary weight loss — catabolic state, malignancy, malnutrition |

**Scoring Logic:**
- Sum all triggered variable points
- Apply diminishing returns: first 3 abnormal vitals sum normally; additional abnormals contribute at 75% value
- Normalize to 0–10 scale: `DomainScore = min(10, RawPoints × 10 / MaxPossiblePoints)`
- **Trending penalty**: if ≥3 vital parameters are trending in the same adverse direction over 48 hours, add a +2 trending instability bonus (pre-normalization)

**Diurnal Variation Handling:**
- Single isolated abnormal reading during known diurnal window (e.g., early-morning low BP in elderly, post-prandial hypotension): score at 50% value
- Abnormal reading confirmed on repeat assessment: score at full value
- ≥2 consecutive abnormal readings across different nursing shifts: score at 125% value (trending confirmation)

---

### Domain 2: Functional Decline

**Weight: 0.9 | Max Contribution: 9 points**

**Clinical Rationale:** Functional decline in SNF residents is both a predictor and an outcome of clinical deterioration. Sudden loss of ADL independence (over 1–7 days) has stronger predictive value for adverse outcomes than gradual decline (Volpato et al., 2007). The MDS Section G ADL Self-Performance scores provide standardized, validated measures. A 2-point decline in any single ADL domain within 14 days is clinically meaningful per CMS QM specifications.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| ADL total score decline ≥ 4 points in 14 days | `mds.section_g.adl_score` (14-day delta) | Delta ≥ 4 | 3.0 | Sudden multi-domain functional loss — investigate cause |
| ADL total score decline ≥ 2 points in 7 days | `mds.section_g.adl_score` (7-day delta) | Delta ≥ 2 | 3.5 | Acute functional decline — high sensitivity for intercurrent illness |
| Any single ADL domain decline ≥ 2 in 7 days | `mds.section_g.adl_[domain]` (7-day delta) | Delta ≥ 2 | 2.5 | Domain-specific acute loss |
| Ambulation status change: ambulatory → non-ambulatory | `mds.section_g.ambulation` | Status change | 3.0 | Loss of ambulation — DVT risk, pneumonia risk, pressure injury risk |
| New wheelchair dependence | `mds.section_g.locomotion` | New status | 2.0 | Functional regression |
| Falls in last 30 days: 1 fall, no injury | `incidents.falls` (30-day count) | Count = 1, injury = none | 1.0 | Single fall — medication review, environmental assessment |
| Falls in last 30 days: 1 fall with injury | `incidents.falls` (30-day) | Count = 1, injury = yes | 2.5 | Fall with injury — fracture risk, medication toxicity screen |
| Falls in last 30 days: ≥2 falls | `incidents.falls` (30-day) | Count ≥ 2 | 3.5 | Recurrent falls — systemic assessment required |
| Falls in last 7 days: any | `incidents.falls` (7-day) | Count ≥ 1 | 2.0 | Recent fall — acute risk window |
| Fall with head strike | `incidents.falls.injury_type` | Head injury | 3.5 | Anticoagulant status review mandatory; subdural hematoma risk |
| Restraint use — new initiation | `mds.section_p.restraints` | New flag | 1.5 | Restraint use signals behavioral crisis or safety concern |
| Therapy participation decline > 50% | `therapy.participation_rate` (7-day trend) | < 50% of scheduled | 2.0 | Refusing or unable to participate in therapy — investigate pain, depression, delirium |

**Scoring Logic:**
- Sum all triggered variable points
- **Velocity multiplier**: if functional decline occurred in ≤ 3 days (acute), multiply raw score by 1.3
- Normalize to 0–10 scale
- **Interaction flag**: if Domain 2 score ≥ 5 AND Domain 3 (cognitive) score ≥ 5, flag for delirium screening

---

### Domain 3: Cognitive & Behavioral Status

**Weight: 0.8 | Max Contribution: 8 points**

**Clinical Rationale:** Acute change in mental status is a cardinal sign of delirium, which in the SNF population is most commonly caused by infection (UTI, pneumonia), medication toxicity, metabolic derangement, or pain. The Brief Interview for Mental Status (BIMS, MDS Section C) is validated for tracking cognitive change. A BIMS drop of ≥ 3 points within 14 days has a sensitivity of 83% and specificity of 72% for delirium (Saliba et al., 2012). The PHQ-9 (MDS Section D) captures depressive symptoms that independently predict functional decline and rehospitalization.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| BIMS score drop ≥ 3 points in 14 days | `mds.section_c.bims_score` (14-day delta) | Delta ≥ 3 | 4.0 | Acute cognitive decline — delirium screen mandatory |
| BIMS score drop ≥ 5 points in 14 days | `mds.section_c.bims_score` (14-day delta) | Delta ≥ 5 | 5.0 | Severe acute cognitive deterioration |
| BIMS score < 8 (moderate-severe impairment) | `mds.section_c.bims_score` | Static | 1.5 | Baseline cognitive impairment — higher vulnerability |
| PHQ-9 score ≥ 10 | `mds.section_d.phq9_score` | Static | 2.0 | Moderate-severe depression — non-adherence risk, appetite loss |
| PHQ-9 increase ≥ 5 points in 30 days | `mds.section_d.phq9_score` (30-day delta) | Delta ≥ 5 | 2.5 | Worsening depression — medication review, psych consult consideration |
| PHQ-9 item 9 (self-harm ideation) > 0 | `mds.section_d.phq9_item9` | Score > 0 | 5.0 | Suicidal ideation — immediate psychiatric evaluation |
| Agitation/aggression incidents in 7 days: ≥ 2 | `incidents.behavioral` (7-day count) | Count ≥ 2 | 2.5 | Behavioral escalation — delirium, pain, medication side effect |
| New-onset agitation (no prior history) | `incidents.behavioral` + `history.behavioral` | New onset | 3.0 | Acute behavioral change without prior pattern — delirium until proven otherwise |
| Refusal of care frequency > 3 times in 7 days | `care_refusals` (7-day count) | Count > 3 | 2.0 | Care refusal pattern — depression, pain, delirium, autonomy issues |
| New refusal of medications | `medication.refusals` | New pattern | 2.5 | Medication non-adherence — assess for side effects, cognitive change |
| Wandering/elopement risk — new | `incidents.wandering` | New flag | 2.0 | Safety risk requiring environmental intervention |

**Scoring Logic:**
- Sum all triggered points
- **Acute-change amplifier**: if any cognitive variable shows change within 48 hours (vs. 14 days), multiply that variable's contribution by 1.5
- Normalize to 0–10
- **Hard trigger**: BIMS drop ≥ 5 OR PHQ-9 item 9 > 0 → automatic elevation to minimum Domain score of 7 regardless of other variables

---

### Domain 4: Clinical Complexity

**Weight: 1.3 | Max Contribution: 13 points**

**Clinical Rationale:** The Charlson Comorbidity Index (CCI) remains the gold standard for predicting mortality from comorbid conditions (Charlson et al., 1987). In the SNF population, specific disease combinations — particularly CHF + CKD, COPD + CHF, and diabetes with end-organ damage — carry multiplicatively higher rehospitalization risk than additive models predict (Jencks et al., 2009). Recent hospitalization within 30 days is the single strongest individual predictor of rehospitalization (Mor et al., 2010; CMS SNF VBP data).

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Charlson Comorbidity Index ≥ 5 | Calculated from `diagnoses` | CCI ≥ 5 | 3.0 | High comorbidity burden — predicted 1-year mortality > 85% |
| Charlson Comorbidity Index ≥ 8 | Calculated from `diagnoses` | CCI ≥ 8 | 4.5 | Very high comorbidity — consider goals of care discussion |
| Active diagnosis count > 10 | `diagnoses.active` (count) | > 10 | 1.5 | Diagnostic complexity increases medication interactions and oversight burden |
| CHF present (any class) | `diagnoses` (ICD-10: I50.x) | Present | 2.0 | CHF is the #1 cause of SNF rehospitalization |
| CHF NYHA Class III/IV | `diagnoses` + `clinical_notes` | Classified | 3.0 | Advanced CHF — high decompensation risk |
| CKD Stage 3b or higher | `diagnoses` (ICD-10: N18.3b+) | Present | 2.0 | Renal impairment complicates medication dosing, fluid management |
| CKD Stage 4/5 (eGFR < 30) | `diagnoses` + `labs.egfr` | eGFR < 30 | 3.0 | Advanced CKD — electrolyte emergencies, anemia, volume issues |
| COPD with recent exacerbation | `diagnoses` (J44.1) + `hospitalizations` | Present + recent | 2.5 | COPD exacerbation within 90 days — high re-exacerbation risk |
| Diabetes with HbA1c > 9% | `diagnoses` (E11.x) + `labs.hba1c` | > 9% | 2.0 | Poorly controlled DM — infection risk, wound healing impairment |
| Diabetes with hypoglycemic episodes | `diagnoses` + `incidents.hypoglycemia` | Any in 30 days | 2.5 | Hypoglycemia in elderly — fall risk, cognitive impairment, mortality |
| Dementia (any type) | `diagnoses` (F01-F03, G30) | Present | 1.5 | Dementia complicates all care coordination and communication |
| Hospitalization in last 30 days | `hospitalizations` (30-day) | Any | 5.0 | **Strongest single predictor of rehospitalization** (Mor et al., 2010) |
| Hospitalization in last 31–60 days | `hospitalizations` (31-60 day) | Any | 3.0 | Still elevated risk window |
| Hospitalization in last 61–90 days | `hospitalizations` (61-90 day) | Any | 1.5 | Declining but persistent risk |
| ≥ 2 hospitalizations in 90 days | `hospitalizations` (90-day count) | Count ≥ 2 | 5.0 | Revolving-door pattern — systemic care failure |
| Current IV therapy | `orders.iv_therapy` | Active | 2.0 | IV therapy indicates acute treatment level beyond routine SNF care |
| Active wound Stage 3+ | `wounds.stage` | Stage ≥ 3 | 2.0 | Complex wound management — infection risk (also scored in D7) |
| On dialysis | `diagnoses` + `orders.dialysis` | Active | 2.5 | Dialysis patient — vascular access complications, hemodynamic instability |

**Scoring Logic:**
- Sum all triggered points
- Normalize to 0–10
- **CHF + CKD interaction**: if both CHF and CKD Stage 3b+ are present, add +3 interaction bonus points (pre-normalization)
- **Triple comorbidity amplifier**: if CHF + CKD + DM all present, add +5 interaction bonus
- **Recent hospitalization dominance**: if hospitalization within 30 days, this domain's minimum score is 5.0 regardless of other variables

---

### Domain 5: Medication Safety

**Weight: 0.9 | Max Contribution: 9 points**

**Clinical Rationale:** Adverse drug events (ADEs) cause approximately 1 in 7 hospitalizations from SNFs (Gurwitz et al., 2005). High-risk medications — anticoagulants, insulin, opioids, psychotropics, and digoxin — are disproportionately involved. Polypharmacy (> 9 medications) independently increases ADE risk. Recent medication changes (within 7 days) carry the highest risk window, as steady-state pharmacokinetics have not yet been established and side effects may be emerging.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Anticoagulant use (warfarin, DOACs) | `medications.active` (class filter) | Any active | 1.5 | Bleeding risk — especially with falls or renal impairment |
| Warfarin with INR > 3.5 | `medications` + `labs.inr` | INR > 3.5 | 4.0 | Supratherapeutic anticoagulation — major bleeding risk |
| Warfarin with INR > 5.0 | `medications` + `labs.inr` | INR > 5.0 | 5.0 | Critical INR — reversal consideration |
| Anticoagulant + fall history (30 days) | `medications` + `incidents.falls` | Combined | 3.5 | Anticoagulant + falls = intracranial hemorrhage risk |
| Insulin use (any type) | `medications.active` (class filter) | Any active | 1.0 | Hypoglycemia risk — especially in elderly with renal impairment |
| Sliding-scale insulin only (no basal) | `medications.active` | Sliding scale without basal | 2.0 | Reactive-only insulin management — glycemic volatility |
| Hypoglycemic episode in 14 days | `incidents.hypoglycemia` | Any | 3.0 | Active hypoglycemia — medication adjustment needed |
| Opioid use | `medications.active` (class filter) | Any active | 1.0 | Sedation, respiratory depression, constipation, fall risk |
| Opioid dose increase in 7 days | `medications.changes` (7-day, opioids) | Dose increased | 2.5 | Recent opioid escalation — monitor for oversedation |
| Opioid + benzodiazepine concurrent use | `medications.active` (combined class) | Both active | 3.5 | **FDA Black Box Warning** — respiratory depression risk |
| Psychotropic medication count ≥ 3 | `medications.active` (psychotropic class) | Count ≥ 3 | 2.5 | CMS F-Tag F758 — psychotropic burden |
| New psychotropic in 7 days | `medications.changes` (7-day, psychotropics) | New start | 2.0 | CMS QM trigger — monitor for EPS, falls, sedation |
| Digoxin use | `medications.active` (digoxin) | Active | 1.5 | Narrow therapeutic index — toxicity risk with renal change |
| Digoxin with K+ < 3.5 or creatinine rising | `medications` + `labs` | Combined | 3.5 | Digoxin toxicity risk amplified by hypokalemia and renal decline |
| Total medication count > 9 (polypharmacy) | `medications.active` (count) | Count > 9 | 1.5 | Polypharmacy — exponential ADE risk increase |
| Total medication count > 15 | `medications.active` (count) | Count > 15 | 2.5 | Extreme polypharmacy |
| Medication changes in last 7 days ≥ 3 | `medications.changes` (7-day count) | Count ≥ 3 | 2.5 | Multiple recent changes — interaction risk, monitoring burden |
| Medication adherence flag (refusals/misses) | `medication.administration.missed` | ≥ 3 in 7 days | 2.0 | Non-adherence pattern — assess cognition, side effects, depression |
| High-risk medication + renal impairment | `medications` + `labs.creatinine` | Combined | 2.5 | Dose adjustment required — renal-cleared drug accumulation risk |

**Scoring Logic:**
- Sum all triggered points
- Normalize to 0–10
- **Critical drug interaction override**: opioid + benzodiazepine OR digoxin + hypokalemia → minimum domain score of 6.0
- **New anticoagulant + fall history**: automatic flag regardless of total score — creates CRITICAL alert annotation

---

### Domain 6: Nutritional & Metabolic Status

**Weight: 0.7 | Max Contribution: 7 points**

**Clinical Rationale:** Involuntary weight loss is among the top predictors of 90-day mortality in the SNF population (Sullivan et al., 1999). Malnutrition impairs wound healing, immune function, and functional recovery. CMS Quality Measure QM 401.2 specifically tracks unplanned weight loss. The MDS Section K captures nutrition status. Low albumin (< 3.0 g/dL) and prealbumin (< 15 mg/dL) are associated with increased pressure injury risk, infection susceptibility, and mortality.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Weight loss > 5% in 30 days | `vitals.weight` (30-day delta) | > 5% | 3.5 | CMS QM criterion — significant involuntary weight loss |
| Weight loss > 10% in 180 days | `vitals.weight` (180-day delta) | > 10% | 4.0 | Severe malnutrition — mortality predictor |
| BMI < 18.5 | `vitals.weight`, `demographics.height` | Calculated | 2.5 | Underweight — vulnerability to infection, pressure injury, functional decline |
| BMI < 16.0 | Calculated | BMI < 16 | 4.0 | Severe underweight — life-threatening malnutrition |
| Albumin < 3.0 g/dL | `labs.albumin` | < 3.0 | 2.5 | Hypoalbuminemia — visceral protein depletion, edema, poor healing |
| Albumin < 2.5 g/dL | `labs.albumin` | < 2.5 | 3.5 | Severe hypoalbuminemia — high mortality risk |
| Prealbumin < 15 mg/dL | `labs.prealbumin` | < 15 | 2.0 | Acute nutritional marker — more responsive than albumin |
| Prealbumin < 10 mg/dL | `labs.prealbumin` | < 10 | 3.0 | Severe protein-calorie malnutrition |
| Fluid intake concern documented | `mds.section_k.fluid_intake` | Flagged | 1.5 | Dehydration risk — UTI, AKI, confusion |
| Dysphagia — mechanically altered diet | `orders.diet_texture` | Modified texture | 1.0 | Aspiration risk baseline |
| Dysphagia — pureed/thickened liquids | `orders.diet_texture` | Pureed + thickened | 2.0 | High aspiration risk |
| Tube feeding (enteral nutrition) | `orders.tube_feeding` | Active | 1.5 | Tube feeding — aspiration risk, metabolic monitoring needed |
| Food intake < 50% of meals for 3+ days | `nursing_notes.intake` or `mds.section_k` | Documented | 2.5 | Acute anorexia — evaluate for depression, GI pathology, medication side effects |
| Refusal of nutritional supplements | `medication.refusals` (supplement class) | Pattern | 1.5 | Supplement refusal + weight loss = escalation |

**Scoring Logic:**
- Sum all triggered points
- Normalize to 0–10
- **Weight loss + low albumin interaction**: if weight loss > 5% AND albumin < 3.0, add +2 interaction bonus
- **Nutritional emergency**: BMI < 16 OR albumin < 2.0 → minimum domain score 8.0

---

### Domain 7: Wound & Skin Integrity

**Weight: 0.7 | Max Contribution: 7 points**

**Clinical Rationale:** Pressure injuries remain a significant quality indicator in SNFs, tracked by CMS QM 402.1/402.2. Stage 3 and 4 pressure injuries are associated with sepsis, osteomyelitis, and hospitalization (Lyder & Ayello, 2008). NPUAP/EPUAP 2019 guidelines emphasize wound trajectory monitoring — a wound that fails to show improvement in 2 weeks requires intervention reassessment. Multiple concurrent wounds compound infection risk.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Pressure injury Stage 1 | `wounds.pressure_injuries` | Stage 1 | 0.5 | Early-stage — preventive intervention |
| Pressure injury Stage 2 | `wounds.pressure_injuries` | Stage 2 | 1.5 | Partial thickness — monitor for progression |
| Pressure injury Stage 3 | `wounds.pressure_injuries` | Stage 3 | 3.0 | Full thickness — infection risk, osteomyelitis risk |
| Pressure injury Stage 4 | `wounds.pressure_injuries` | Stage 4 | 4.0 | Full thickness with bone/muscle exposure — high sepsis risk |
| Unstageable pressure injury | `wounds.pressure_injuries` | Unstageable | 3.5 | Slough/eschar — true depth unknown, may be Stage 3/4 |
| Deep tissue injury (DTI) | `wounds.pressure_injuries` | DTI | 2.5 | May rapidly evolve to Stage 3/4 |
| Wound stage progression (worsening) | `wounds.pressure_injuries` (trend) | Stage increased | 4.0 | **Active wound deterioration — immediate intervention** |
| Wound healing stalled > 14 days | `wounds.measurements` (trend) | No improvement | 3.0 | Per NPUAP/EPUAP — reassess treatment plan |
| Wound with signs of infection | `wounds.clinical_notes` + `wound_assessments` | Documented | 3.5 | Wound infection — cellulitis, abscess, osteomyelitis consideration |
| Number of concurrent wounds ≥ 3 | `wounds` (total count) | Count ≥ 3 | 2.0 | Multiple wounds — increased protein demand, infection exposure |
| Surgical wound with delayed healing | `wounds.surgical` | Stalled | 2.5 | Surgical site infection risk |
| Wound + diabetes + albumin < 3.0 | Combined fields | All three | 4.0 | Triple risk: impaired healing + malnutrition + vascular disease |
| New wound development | `wounds` (new entry) | New wound | 2.0 | New wound — assess pressure relief, nutrition, positioning |

**Scoring Logic:**
- Sum all triggered points (use highest-stage wound as primary scorer; additional wounds add +1 each)
- Normalize to 0–10
- **Stage progression override**: any wound that worsened by ≥ 1 stage → minimum domain score of 6.0
- **Wound + infection flag**: wound with documented infection signs → automatic annotation for antibiotic review and wound consult

---

### Domain 8: Infection & Inflammatory Markers

**Weight: 1.0 | Max Contribution: 10 points**

**Clinical Rationale:** Infection is the number-one cause of acute care transfers from SNFs (Ouslander et al., 2010). UTIs and pneumonia account for the majority of infection-related hospitalizations. The INTERACT II Acute Change in Condition pathway places infection high in the differential for any acute change. Recurrent infections — particularly UTIs with prior hospitalization — predict future hospitalization with high specificity. In the elderly, infection may present atypically: without fever, with only confusion, functional decline, or tachycardia as initial signs.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| Antibiotic use — current (active treatment) | `medications.active` (antibiotic class) | Active | 1.5 | Active infection being treated — monitor for response |
| Antibiotic use in last 14 days (completed) | `medications.recent` (14-day, antibiotics) | Recent | 1.0 | Post-treatment window — relapse/C. diff risk |
| ≥ 2 antibiotic courses in 90 days | `medications` (90-day antibiotic count) | Count ≥ 2 | 2.5 | Recurrent infection pattern — resistance risk, C. diff |
| UTI history — ≥ 2 in 90 days | `diagnoses` + `infections_log` | Count ≥ 2 | 2.5 | Recurrent UTI — catheter assessment, prophylaxis consideration |
| UTI with prior hospitalization for UTI | `diagnoses` + `hospitalizations` | Combined | 3.5 | High-risk recurrence pattern |
| Catheter-associated UTI (CAUTI) risk | `orders.urinary_catheter` | Indwelling catheter present | 2.0 | CAUTI prevention protocols — CMS QM |
| Respiratory infection signs | `clinical_notes` + `vitals` | Documented | 2.5 | Pneumonia concern — chest imaging consideration |
| Wound infection signs | `wounds.clinical_notes` | Documented | 2.5 | Cellulitis, abscess, osteomyelitis differential |
| C. difficile history | `diagnoses` (A04.7) | Any prior | 2.0 | C. diff recurrence risk with antibiotic re-exposure |
| Active C. difficile infection | `diagnoses` (A04.7) + active treatment | Active | 4.0 | Active CDI — isolation, electrolyte monitoring, complication watch |
| WBC > 12,000 or < 4,000 | `labs.wbc` | Abnormal | 2.5 | Leukocytosis/leukopenia — infection or sepsis marker |
| WBC trending up > 3,000 from prior | `labs.wbc` (trend) | Rising trend | 2.0 | Worsening infection |
| CRP > 50 mg/L (if available) | `labs.crp` | > 50 | 2.0 | Elevated inflammatory marker — supports infection diagnosis |
| CRP > 100 mg/L | `labs.crp` | > 100 | 3.0 | Severe systemic inflammation |
| Procalcitonin > 0.5 ng/mL (if available) | `labs.procalcitonin` | > 0.5 | 3.0 | Bacterial infection likely per IDSA guidance |
| Fever episodes ≥ 2 in 7 days | `vitals.temperature` (7-day fever count) | Count ≥ 2 | 2.5 | Recurrent fever — persistent or recurring infection |
| Low-grade temperature + confusion | `vitals.temperature` + `mds.section_c.bims_score` | Temp > 37.5 + BIMS change | 3.0 | Atypical sepsis presentation in elderly |
| SIRS criteria met (≥ 2 of: temp, HR, RR, WBC) | Calculated from vitals + labs | ≥ 2 SIRS criteria | 4.0 | Systemic inflammatory response — sepsis screening per INTERACT II |

**Scoring Logic:**
- Sum all triggered points
- Normalize to 0–10
- **SIRS override**: if ≥ 2 SIRS criteria met, minimum domain score = 7.0
- **Recurrent UTI + prior hospitalization**: minimum domain score = 5.0
- **Atypical presentation bonus**: if fever is absent but confusion + tachycardia + functional decline are present, add +2 "occult infection" bonus

---

### Domain 9: Psychosocial & Care Engagement

**Weight: 0.5 | Max Contribution: 5 points**

**Clinical Rationale:** Psychosocial factors significantly influence hospitalization decisions, particularly in goals-of-care-sensitive scenarios. Teno et al. (2002) demonstrated that SNF residents without advance directives are significantly more likely to be transferred to the ED for conditions that could be managed in place with appropriate comfort-care orders. Family engagement level affects communication during acute changes, and lack of family involvement may lead nursing staff to default to hospital transfer. Therapy participation rates are both a marker of and influence on functional recovery.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| No advance directive on file | `advance_directives.status` | None documented | 2.5 | No documented wishes — default to aggressive care including hospital transfer |
| Full code status + CCI ≥ 6 | `advance_directives.code_status` + CCI | Combined | 3.0 | Full code with high comorbidity — goals-of-care conversation needed |
| DNR/DNH status not reviewed in 90 days | `advance_directives.last_review` | > 90 days | 1.0 | Outdated directive — may not reflect current wishes |
| POLST not completed (high complexity patient) | `advance_directives.polst` + Domain 4 | Missing + D4 high | 2.0 | High-complexity patient without POLST — treatment ambiguity |
| Family engagement: minimal/none | `care_plan.family_engagement` | Low engagement | 2.0 | No family advocate — communication gaps during acute changes |
| Family engagement: active, aligned | `care_plan.family_engagement` | High engagement | -1.0 | **Protective factor** — reduces unnecessary transfers |
| Care plan compliance < 50% | `care_plan.compliance_rate` | < 50% | 2.0 | Low compliance — care plan may not be followed during acute changes |
| Therapy participation < 50% for 7 days | `therapy.participation_rate` (7-day) | < 50% | 1.5 | Therapy avoidance — depression, pain, or giving up |
| Therapy discontinued (not per plan) | `therapy.status` | Unplanned D/C | 2.0 | Unexpected therapy cessation — investigate cause |
| Hospice/palliative eligibility flag | Calculated from CCI + functional status | Eligible not enrolled | 1.5 | May benefit from palliative pathway — avoiding acute interventions |
| Recent behavioral health referral | `orders.behavioral_health` | Recent | 1.0 | Active psychosocial concern being addressed |
| Social isolation documented | `mds.section_f` or `social_work_notes` | Documented | 1.0 | Isolation — depression risk, cognitive decline risk |

**Scoring Logic:**
- Sum all triggered points (negative values for protective factors capped: minimum 0)
- Normalize to 0–10
- **Goals-of-care gap flag**: no advance directive + CCI ≥ 6 + recent hospitalization → automatic annotation: "Goals of Care Conversation Required"

---

### Domain 10: Recent Clinical Events (Velocity Factor)

**Weight: 2.0 | Max Contribution: 20 points**

**Clinical Rationale:** This is the most heavily weighted domain because recent clinical events are the single strongest predictor of near-term adverse outcomes. Mor et al. (2010) demonstrated that 30-day rehospitalization risk is highest in the first 72 hours post-discharge and remains significantly elevated for 30 days. The "velocity" concept captures the rate of clinical events — a patient who has had an ER visit, a hospitalization, and 2 falls in the past 30 days is on a fundamentally different clinical trajectory than one with no recent events. CMS SNF VBP specifically penalizes 30-day unplanned readmissions.

#### Variables & Scoring

| Variable | PCC Field | Threshold | Points | Clinical Basis |
|----------|-----------|-----------|--------|----------------|
| ER visit in last 7 days | `er_visits` (7-day) | Any | 4.0 | Very recent ER visit — acute instability |
| ER visit in last 8–30 days | `er_visits` (8-30 day) | Any | 2.5 | Recent ER visit — still elevated risk |
| ≥ 2 ER visits in 30 days | `er_visits` (30-day count) | Count ≥ 2 | 5.0 | Revolving-door ER use |
| Hospitalization in last 7 days | `hospitalizations` (7-day) | Any | 5.0 | Immediate post-discharge — highest risk window |
| Hospitalization in last 8–30 days | `hospitalizations` (8-30 day) | Any | 3.5 | Still high-risk post-discharge period |
| Hospitalization in last 31–90 days | `hospitalizations` (31-90 day) | Any | 2.0 | Declining but persistent readmission risk |
| ≥ 2 hospitalizations in 90 days | `hospitalizations` (90-day count) | Count ≥ 2 | 5.0 | Pattern of repeated hospitalization |
| Falls in last 7 days | `incidents.falls` (7-day) | Any | 2.5 | Very recent fall — injury assessment, root cause |
| Falls in last 8–30 days | `incidents.falls` (8-30 day) | Count ≥ 1 | 1.5 | Recent fall history |
| ≥ 3 falls in 30 days | `incidents.falls` (30-day count) | Count ≥ 3 | 4.0 | Recurrent falls — systemic issue |
| Clinical incidents in last 14 days (non-fall) | `incidents` (14-day, non-fall) | Count ≥ 2 | 2.0 | Multiple clinical events — system under stress |
| Physician visits < required frequency | `physician_visits` (vs schedule) | Behind schedule | 1.5 | Missed physician oversight — undetected changes |
| Physician visits > required frequency | `physician_visits` (vs schedule) | Exceeds schedule | 1.0 | Increased physician attention indicates clinical concern |
| New admission (< 72 hours) | `admissions.date` | < 72 hours | 3.0 | New admissions lack baseline data — highest vulnerability window |
| New admission (< 14 days) | `admissions.date` | < 14 days | 2.0 | Still establishing care — medication reconciliation window |
| Transfer between units/facilities | `transfers` (14-day) | Any | 1.5 | Care transitions introduce handoff errors |

**Scoring Logic:**
- Sum all triggered points
- Normalize to 0–10 (note: with weight of 2.0, domain contributes up to 20 to composite)
- **Velocity acceleration**: if ≥ 3 different event types (e.g., ER visit + fall + incident) occurred in the same 14-day window, multiply raw score by 1.4
- **Post-discharge immutability**: hospitalization within 7 days → minimum domain score of 7.0; within 30 days → minimum 5.0

---

## 3. Scoring Model & Risk Bands

### Composite Score Aggregation

**Step 1: Raw Domain Scoring**
Each domain produces a raw score based on triggered variables. Scores are normalized to 0–10 using the domain-specific logic described above.

**Step 2: Weighted Summation**
```
WeightedSum = Σ(DomainScore_i × Weight_i)
```

**Step 3: Interaction Bonuses**
Specific multi-domain combinations add interaction bonus points:

| Interaction | Condition | Bonus |
|-------------|-----------|-------|
| CHF + CKD Synergy | D4 CHF ≥ 2.0 AND D4 CKD ≥ 2.0 | +3 |
| Triple Comorbidity | D4 CHF + CKD + DM all present | +5 |
| Vital Instability + Infection | D1 ≥ 6.0 AND D8 ≥ 6.0 | +5 (sepsis signal) |
| Cognitive Change + Infection | D3 ≥ 5.0 AND D8 ≥ 5.0 | +4 (delirium from infection) |
| Functional Decline + Cognitive Change | D2 ≥ 5.0 AND D3 ≥ 5.0 | +3 (delirium screen) |
| Falls + Anticoagulation | D2 falls triggered AND D5 anticoagulant triggered | +4 (intracranial hemorrhage risk) |
| Malnutrition + Wounds | D6 ≥ 5.0 AND D7 ≥ 5.0 | +3 (impaired healing + infection risk) |
| Post-Discharge + Medication Changes | D10 recent hospitalization AND D5 ≥ 4.0 | +3 (transition-of-care medication risk) |
| Post-Discharge + Vital Instability | D10 ≥ 6.0 AND D1 ≥ 5.0 | +4 (acute decompensation post-discharge) |

**Step 4: Final Score**
```
CompositeScore = min(100, WeightedSum + InteractionBonus)
```

### Risk Band Definitions

| Band | Score Range | Classification | Response Timeline | Clinical Action |
|------|------------|----------------|-------------------|-----------------|
| **CRITICAL** | 80–100 | Immediate physician review required | **Within 1 hour** | Full assessment, INTERACT II SBAR to physician, possible transfer evaluation |
| **HIGH** | 60–79 | Review within 24 hours | **Within 24 hours** | INTERACT II Stop and Watch initiation, enhanced monitoring, care plan update |
| **MODERATE** | 40–59 | Review at next scheduled visit | **Within 72 hours** | Enhanced monitoring protocol, targeted interventions for triggered domains |
| **LOW** | 20–39 | Routine monitoring | **Next scheduled assessment** | Standard care plan with awareness of trending risk factors |
| **STABLE** | 0–19 | Standard care plan | **Routine per schedule** | Preventive care, wellness-oriented management |

### Score Trend Analysis

In addition to the absolute score, the engine calculates a **7-day score trend**:

- **Rapidly Rising (↑↑)**: Score increased > 15 points in 7 days — clinical trajectory is deteriorating
- **Rising (↑)**: Score increased 5–15 points in 7 days — watch closely
- **Stable (→)**: Score change < 5 points in 7 days
- **Improving (↓)**: Score decreased 5–15 points in 7 days — interventions may be working
- **Rapidly Improving (↓↓)**: Score decreased > 15 points in 7 days

A **MODERATE patient with a Rapidly Rising trend** should be treated with the urgency of a HIGH patient. Trend overrides are:
- Any patient with ↑↑ trend → elevate response one band
- Any patient moving from STABLE/LOW to MODERATE within 48 hours → flag for accelerated review

---

## 4. Management Plan Framework

### Plan Generation Logic

For each resident, the management plan is generated based on:
1. **Risk band** (determines urgency and scope)
2. **Triggered domains** (determines content focus)
3. **Specific triggered variables** (determines exact recommendations)
4. **Active clinical scenarios** (maps to scenario templates in Section 5)
5. **Current medication list** (determines drug-specific recommendations)

### CRITICAL (80–100) — Management Plan Structure

When a resident scores CRITICAL, the engine generates:

#### A. Immediate Assessment Protocol
- **Vital signs**: Full set immediately — BP, HR, RR, Temp, O2 sat, weight
- **Focused physical exam**: Based on highest-scoring domain:
  - D1 triggered → cardiac/pulmonary/volume status exam
  - D3 triggered → neurological exam + delirium screen (CAM)
  - D8 triggered → infection source exam (lungs, abdomen, skin, urinary)
- **Point-of-care testing**: Fingerstick glucose, pulse oximetry continuous
- **INTERACT II SBAR communication**: Structured handoff to physician/NP

#### B. Diagnostic Orders to Consider
Based on triggered domains:

| Triggered Domain | Recommended Diagnostics |
|-----------------|------------------------|
| D1 (Vitals) | CBC, BMP, troponin (if cardiac concern), BNP (if CHF), lactate (if sepsis concern), chest X-ray, ECG |
| D3 (Cognitive) | CBC, BMP, UA with culture, blood cultures (if febrile), medication levels (digoxin, lithium), ammonia (if liver disease), TSH |
| D4 (Complexity) | Based on specific condition: BNP for CHF, ABG for COPD, HbA1c for DM |
| D5 (Medications) | Drug levels (warfarin/INR, digoxin, phenytoin), renal function, hepatic function |
| D6 (Nutrition) | Albumin, prealbumin, CMP, vitamin D, B12/folate |
| D7 (Wounds) | Wound culture (if infection signs), blood cultures (if systemic signs), ESR/CRP, X-ray of underlying bone (osteomyelitis concern) |
| D8 (Infection) | CBC with differential, BMP, UA with culture, blood cultures × 2, chest X-ray, CRP/procalcitonin, lactate |

#### C. Medication Review Protocol
- Review all medications started/changed in last 14 days
- Check renal dosing for all renally-cleared medications
- Hold nephrotoxic agents if creatinine rising
- Review anticoagulation if fall risk or bleeding signs
- Check for drug interactions with any new medications
- Review psychotropic burden (CMS F-Tag F758 compliance)

#### D. Communication Plan
- **Physician/NP**: INTERACT II SBAR within 1 hour
- **Family/POA**: Notify of acute change within 2 hours if significant
- **Specialist**: Consult if domain-specific (cardiology for CHF, nephrology for AKI, ID for complex infection)
- **DON/ADON**: Escalation notification for staffing and resource allocation

#### E. Documentation Requirements
- Time of assessment and notification
- Complete vital signs with comparison to baseline
- Mental status description with baseline comparison
- Physician notification time and content of SBAR
- Physician response and new orders received
- Family/POA notification time and content
- Clinical rationale for management decisions
- If transfer recommended: specific reason and receiving facility
- If managed in place: specific monitoring plan with parameters

#### F. Escalation Criteria (Transfer vs. Manage in Place)
**Transfer to ED is indicated when:**
- O2 sat < 88% despite supplemental O2 at maximum SNF capability
- Systolic BP < 80 mmHg despite fluid bolus
- New acute neurological deficit (stroke signs)
- Chest pain with ECG changes
- Active major hemorrhage
- Acute surgical abdomen
- Condition exceeds SNF clinical capability or staffing resources
- Family/POA requests transfer despite recommendation to manage in place (document fully)

**Manage in place when:**
- Condition is within SNF treatment capability
- Appropriate orders are available or can be obtained
- Staffing allows enhanced monitoring frequency
- Goals of care support in-place management
- INTERACT II pathway provides specific in-place protocol

### HIGH (60–79) — Management Plan Structure

#### A. Enhanced Monitoring (24-Hour Protocol)
- Vital signs q4h × 24 hours, then reassess frequency
- Nursing assessment q shift with focused documentation on triggered domains
- Daily weight if D1 or D6 triggered
- Intake/output monitoring if fluid concern
- Neurological checks q4h if D3 triggered
- Wound assessment daily if D7 triggered

#### B. Medication Safety Review
- Pharmacist review of current medication list within 24 hours
- INR check within 24 hours if on warfarin
- Renal function check within 48 hours if on nephrotoxic agents
- Glucose log review if on insulin

#### C. Care Plan Update
- Update care plan to reflect triggered risk domains within 24 hours
- Add domain-specific interventions (fall precautions, aspiration precautions, skin checks)
- Set specific reassessment date (not to exceed 72 hours)
- Notify therapy team of functional concerns if D2 triggered

#### D. INTERACT II Activation
- Initiate Stop and Watch tool if not already active
- Complete INTERACT II Acute Change in Condition file card if applicable
- Prepare SBAR communication for physician if score continues to rise

### MODERATE (40–59) — Management Plan Structure

#### A. Targeted Monitoring
- Standard vital sign frequency with additional checks on triggered parameters
- Weekly weight if nutritional concern
- Fall risk reassessment if D2 triggered
- Skin integrity reassessment per facility protocol

#### B. Preventive Interventions
- Physical therapy referral or adjustment if functional decline trending
- Nutritional consultation if D6 triggered
- Wound care plan review if D7 triggered
- Medication reconciliation at next scheduled physician visit

#### C. Care Coordination
- Ensure physician visit occurs on schedule
- Update care plan at next care conference
- Communicate concerns to oncoming shift nurses

### LOW (20–39) — Management Plan Structure

- Continue current care plan with no modifications
- Monitor risk score trends at weekly intervals
- Address any single triggered domain at next scheduled care plan review
- Ensure preventive protocols (fall prevention, skin integrity, nutrition) are active

### STABLE (0–19) — Management Plan Structure

- Continue standard care plan
- Bi-weekly or monthly risk score reassessment
- Focus on wellness, engagement, and goal achievement
- Consider discharge planning if clinically appropriate

---

## 5. Clinical Scenario Templates

### Template 1: Acute CHF Exacerbation — In-Place Management

**ICD-10:** I50.x (Heart Failure)  
**INTERACT II Category:** Cardiovascular  
**Expected Domain Triggers:** D1 (vitals), D4 (CHF), D6 (weight gain), D10 (prior hospitalization)

#### STOP and WATCH Criteria (INTERACT II)
- **S**eems different than usual (increased dyspnea, fatigue, edema)
- **W**eight gain ≥ 3 lbs in 3 days or ≥ 5 lbs in 7 days
- **A**gitation or confusion (right-sided heart failure → hepatic congestion)
- **T**emperature — low-grade fever may indicate concurrent infection
- **C**hange in skin color (cyanosis, pallor) or increasing edema
- **H**ypertension or hypotension (new or worsening)

#### Immediate Assessment Checklist
- [ ] Full vital signs: BP, HR, RR, O2 sat, temp, weight (compare to dry weight baseline)
- [ ] Lung auscultation: crackles, wheezes, diminished breath sounds
- [ ] JVD assessment
- [ ] Lower extremity edema: grade (1+ to 4+), bilateral vs. unilateral
- [ ] Cardiac auscultation: S3 gallop, murmurs
- [ ] Abdominal exam: hepatomegaly, ascites
- [ ] Review I&O records for last 72 hours
- [ ] Review fluid and sodium intake

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| BMP (stat) | Electrolytes (K+, Na+, Cr, BUN) — renal function, diuretic effects |
| BNP or NT-proBNP | Quantify heart failure severity; >400 pg/mL suggests decompensation (AHA/ACC 2023) |
| CBC | Anemia as contributor (high-output failure) |
| Chest X-ray (portable) | Pulmonary edema, pleural effusions, cardiomegaly |
| ECG | New arrhythmia (AF, flutter), ischemic changes |
| Troponin | If chest pain or ECG changes — rule out ACS |
| Digoxin level | If on digoxin — check therapeutic range |
| TSH | If new-onset or worsening — thyroid-driven CHF |

#### In-Place Treatment Protocol
1. **Elevate HOB to 45–60 degrees** — immediate respiratory comfort
2. **Supplemental O2** to maintain SpO2 ≥ 92% — titrate per facility protocol
3. **IV furosemide 20–40 mg** (if not currently on diuretic) OR **double current PO furosemide dose** — per AHA/ACC 2023 Stage C guidelines. Monitor urine output; target 0.5–1.0 mL/kg/hr
4. **Fluid restriction 1.5L/day** and **sodium restriction < 2g/day**
5. **Daily weights** — same scale, same time, same clothing
6. **Strict I&O** for 72 hours minimum
7. **Hold NSAIDS** — nephrotoxic and fluid-retaining
8. **Review and adjust ACEi/ARB/ARNI** — ensure at target dose if tolerated; hold if SBP < 90
9. **Review beta-blocker** — do NOT initiate during acute decompensation; maintain current dose if SBP stable > 90
10. **Potassium replacement** if K+ < 4.0 (diuretic-induced hypokalemia risk)
11. **BMP recheck in 24–48 hours** post-diuretic for electrolytes and renal function

#### Transfer Criteria — Send to ED When:
- SpO2 < 88% despite O2 at 6L NC (exceeds SNF O2 capability)
- Systolic BP < 80 mmHg after initial interventions
- New chest pain with ECG changes (ACS concern)
- New-onset rapid AF with ventricular rate > 150
- Acute altered mental status not responsive to initial assessment
- Respiratory distress requiring BiPAP/CPAP not available in facility
- Anuria (no urine output for > 6 hours despite diuretics)
- K+ > 6.0 mmol/L (hyperkalemia emergency)

#### Documentation Template
> "[Date/Time] — Resident noted with [specific symptoms: increased dyspnea, bilateral lower extremity edema 2+, weight increase of X lbs over X days]. VS: BP [X], HR [X], RR [X], SpO2 [X]% on [RA/O2 at Xpm]. Lung sounds: [bilateral basilar crackles / clear]. JVD [present/absent]. Assessment consistent with acute CHF exacerbation per AHA/ACC criteria.
>
> Dr. [Name] notified at [time] via SBAR communication. Orders received: [specific orders]. Labs drawn: BMP, BNP, CBC. CXR ordered.
>
> Family/POA [Name] notified at [time]: Resident's condition explained, current plan of care discussed, goals of care confirmed [full code/DNR/comfort care].
>
> Plan: Monitor VS q4h, strict I&O, daily weights, repeat BMP in 24h. Will reassess diuretic response and adjust as needed. Transfer criteria reviewed — current status manageable in facility."

#### Family Communication Script
> "Hello [family member name], this is [nurse/physician name] from [facility]. I'm calling to let you know that [resident name] is showing signs of fluid buildup related to their heart condition — we've noticed increased swelling in the legs and some shortness of breath. Their weight has gone up [X] pounds in the last few days.

> We've already started treatment — we've adjusted their water pill, restricted fluids, and ordered blood work. Dr. [name] has been notified and has given us new orders. We're monitoring [him/her] closely.

> Right now, we believe we can manage this safely here in the facility. However, if [his/her] oxygen levels drop significantly or [he/she] doesn't respond to treatment, we may need to send [him/her] to the emergency room.

> Do you have any questions? Would you like us to update you again tomorrow with how the treatment is going?"

---

### Template 2: Suspected Sepsis / Systemic Infection (SIRS Criteria in SNF)

**ICD-10:** R65.20 (Severe Sepsis), A41.9 (Sepsis, unspecified)  
**INTERACT II Category:** Infection / Acute Change  
**Expected Domain Triggers:** D1 (vitals), D3 (cognitive change), D8 (infection markers), D10 (events)

#### STOP and WATCH Criteria
- **S**eems different — confused, lethargic, or "not herself/himself"
- **T**emperature > 38.3°C OR < 35.5°C (hypothermia is ominous in elderly)
- **O**ther — tachycardia (HR > 100), tachypnea (RR > 22), hypotension (SBP < 100)
- **P**erformance declining — new functional decline without clear cause

#### SIRS Criteria (≥ 2 = SIRS positive)
1. Temperature > 38°C (100.4°F) or < 36°C (96.8°F)
2. Heart rate > 90 bpm
3. Respiratory rate > 20/min
4. WBC > 12,000 or < 4,000 (or > 10% bands)

**Note:** In elderly SNF residents, the qSOFA score (RR ≥ 22, altered mentation, SBP ≤ 100) has superior specificity for sepsis-related organ dysfunction (Seymour et al., 2016).

#### Immediate Assessment Checklist
- [ ] Full vital signs with orthostatic blood pressures
- [ ] Mental status assessment (CAM for delirium, compare to baseline BIMS)
- [ ] Complete physical exam focused on infection source:
  - Lungs: crackles, consolidation, decreased breath sounds
  - Abdomen: tenderness, distension, guarding
  - Skin: cellulitis, wound infection, surgical site
  - Urinary: suprapubic tenderness, catheter inspection, new incontinence
  - Lines/devices: IV site, catheter site, PEG site, drain sites
- [ ] Fingerstick glucose
- [ ] Pulse oximetry

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| CBC with differential (stat) | WBC, bands — infection severity, leukopenia (poor prognosis) |
| BMP (stat) | Renal function (AKI in sepsis), electrolytes, glucose |
| Lactate (if available) | > 2.0 mmol/L suggests tissue hypoperfusion (Surviving Sepsis Campaign 2021) |
| Blood cultures × 2 (stat, before antibiotics) | Identify bacteremia; must be drawn before first antibiotic dose |
| UA with culture | UTI source — most common in SNF population |
| Chest X-ray | Pneumonia source |
| Procalcitonin (if available) | > 0.5 ng/mL supports bacterial infection (IDSA 2024) |
| CRP | Inflammatory marker trending |
| Hepatic function panel | If abdominal source suspected; baseline for antibiotic dosing |

#### In-Place Treatment Protocol (Sepsis Hour-1 Bundle — Adapted for SNF)
1. **Obtain blood cultures × 2** (different sites) **BEFORE antibiotics** — this is non-negotiable per Surviving Sepsis Campaign
2. **IV access** — establish if not present; 18g or 20g
3. **IV fluid bolus: 500 mL NS over 30 minutes** — repeat up to 30 mL/kg if SBP < 100 mmHg and no signs of fluid overload; monitor closely for CHF patients (maximum 1L without reassessment)
4. **Empiric antibiotics within 1 hour of recognition** (broad-spectrum, adjusted to suspected source):
   - **Pulmonary source**: Ceftriaxone 1g IV + Azithromycin 500mg IV (CAP); or Piperacillin-Tazobactam 4.5g IV q6h (aspiration/HAP)
   - **Urinary source**: Ceftriaxone 1g IV; adjust based on local resistance patterns and prior cultures
   - **Skin/soft tissue source**: Vancomycin 15-20 mg/kg IV (cover MRSA) + Piperacillin-Tazobactam 4.5g IV
   - **Unknown source**: Vancomycin 15-20 mg/kg IV + Piperacillin-Tazobactam 4.5g IV q6h (broad-spectrum coverage)
5. **Lactate recheck at 4–6 hours** if initial elevated
6. **Vasopressors**: NOT available in most SNFs — if MAP < 65 mmHg after 2L crystalloid → **transfer to ED**
7. **Urine output monitoring**: Foley catheter if not already present AND accurate I&O is essential; target > 0.5 mL/kg/hr
8. **Repeat vital signs q2h × 12 hours**, then q4h if stabilizing
9. **Hold metformin** (lactic acidosis risk), **hold NSAIDs** (AKI risk), **hold ACEi/ARB** if hypotensive

#### Transfer Criteria — Send to ED When:
- SBP < 80 mmHg after 2L IV fluid (vasopressors needed — exceeds SNF capability)
- MAP < 65 mmHg after fluid resuscitation
- Lactate > 4.0 mmol/L
- SpO2 < 88% on maximum available O2
- Acute altered mental status not responding to treatment
- New organ failure (anuria, DIC, acute hepatic dysfunction)
- Respiratory failure requiring intubation
- Need for ICU-level monitoring

#### Documentation Template
> "[Date/Time] — Resident [name] found with acute change in condition: [specific findings]. SIRS criteria: [list criteria met]. qSOFA score: [X]/3. Vital signs: T [X], HR [X], BP [X], RR [X], SpO2 [X]%. Mental status: [baseline vs current]. Source assessment: [findings].
>
> INTERACT II Acute Change pathway initiated. SBAR communicated to Dr. [Name] at [time]. Orders received: [specific orders]. Blood cultures × 2 drawn at [time], prior to first antibiotic dose. First antibiotic ([name, dose, route]) administered at [time].
>
> Family/POA [Name] notified at [time] of acute change consistent with possible sepsis.
>
> Plan: IV fluids per order, antibiotics per protocol, VS q2h, strict I&O. Reassess in [timeframe]. Transfer criteria established: [specific parameters that would trigger transfer]."

#### Family Communication Script
> "Hello [family member name], I'm calling to let you know that [resident name] is showing signs of a serious infection. [His/Her] temperature, heart rate, and blood pressure have changed significantly. This can be a sign of what we call sepsis — the body's severe response to an infection.
>
> We've already drawn blood tests and cultures, started IV fluids, and given [him/her] a strong antibiotic. Dr. [name] has been notified and is directing the care.
>
> We're going to monitor [him/her] very closely over the next several hours. If [his/her] blood pressure doesn't respond to treatment or [his/her] condition worsens, we will need to transfer [him/her] to the hospital for more intensive care. We want to keep you fully informed. Can I answer any questions?"

---

### Template 3: Acute Altered Mental Status / Delirium

**ICD-10:** R41.0 (Disorientation), F05 (Delirium)  
**INTERACT II Category:** Neurological / Acute Change  
**Expected Domain Triggers:** D3 (cognitive), D1 (vitals), D5 (medications), D8 (infection)

#### STOP and WATCH Criteria
- **S**eems different than usual — confused, not making sense, drowsy, agitated
- **T**alking nonsense or unusually quiet
- **A**gitation — pulling at lines, combative, restless (hyperactive delirium)
- **C**onfusion — new onset, not oriented to person/place/time
- **H**allucinations or paranoia (new)

#### Immediate Assessment Checklist
- [ ] CAM (Confusion Assessment Method) — 4 features:
  1. Acute onset and fluctuating course
  2. Inattention
  3. Disorganized thinking
  4. Altered level of consciousness
- [ ] Full vital signs (infection screen)
- [ ] Fingerstick glucose (hypoglycemia is the most rapidly reversible cause)
- [ ] Review medication administration record (MAR) for last 72 hours — new medications, dose changes, PRN use
- [ ] Assess for pain (PAINAD scale if nonverbal)
- [ ] Assess for urinary retention (bladder scan) and constipation/impaction
- [ ] Assess hydration status (mucous membranes, skin turgor, urine color)
- [ ] Neurological exam: pupil size/reactivity, focal deficits, speech, motor function
- [ ] Review most recent labs

#### Delirium Differential — "I WATCH DEATH" Mnemonic
- **I**nfection (UTI, pneumonia, skin — most common in SNF)
- **W**ithdrawal (alcohol, benzodiazepines, opioids)
- **A**cute metabolic (electrolytes, glucose, renal failure, hepatic failure)
- **T**rauma (fall, head injury — check for subdural hematoma if on anticoagulant)
- **C**NS pathology (stroke, seizure, mass)
- **H**ypoxia (PE, CHF, pneumonia, COPD exacerbation)
- **D**eficiencies (thiamine, B12, folate)
- **E**ndocrine (thyroid, adrenal)
- **A**cute vascular (MI, stroke, PE)
- **T**oxins/medications (anticholinergics, opioids, benzodiazepines, steroids, digoxin)
- **H**eavy metals (rare in SNF)

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| Fingerstick glucose (stat) | Hypoglycemia — rapidly reversible |
| CBC with differential | Infection, anemia |
| BMP (stat) | Na+ (hypo/hyper), glucose, Ca++, renal function, K+ |
| UA with culture | UTI — #1 cause of delirium in elderly women |
| Chest X-ray | Pneumonia — #1 cause of delirium in elderly men |
| Blood cultures | If febrile or SIRS criteria met |
| Medication levels | Digoxin, phenytoin, lithium, valproic acid — if on these |
| Ammonia | If liver disease present |
| TSH | Myxedema coma or thyroid storm (if not recent) |
| B12, folate | If nutritional deficiency suspected |
| CT head (non-contrast) | If: on anticoagulant + recent fall, new focal deficits, head trauma, or AMS not explained by metabolic/infectious cause |

#### In-Place Treatment Protocol
1. **Treat the underlying cause** — this is the primary treatment for delirium
2. **Medication review — stop/hold offending agents**:
   - Hold all anticholinergics (diphenhydramine, hydroxyzine, oxybutynin, cyclobenzaprine)
   - Hold or reduce benzodiazepines (unless alcohol/benzo withdrawal suspected)
   - Hold or reduce opioids (switch to scheduled acetaminophen if possible)
   - Review all recently changed medications
3. **Environmental interventions**:
   - Reorientation: clock, calendar, familiar objects, consistent staff
   - Adequate lighting (avoid both dim and harsh)
   - Minimize room changes and disruptions
   - Encourage sleep-wake cycle: lights on during day, dark and quiet at night
   - Remove physical restraints if possible (restraints worsen delirium)
4. **Hydration**: Encourage PO fluids; IV NS 500 mL if dehydration suspected
5. **Pain management**: Assess and treat pain (uncontrolled pain worsens delirium)
6. **Mobilize early**: Get patient out of bed if safe
7. **Pharmacological management** (only if non-pharmacological measures fail AND patient is a danger to self/others):
   - First line: Haloperidol 0.25–0.5 mg PO/IM — may repeat × 1 in 30 min (AMDA 2024)
   - Avoid in Parkinson's disease or Lewy body dementia → use quetiapine 12.5–25 mg PO instead
   - Avoid benzodiazepines (worsen delirium) EXCEPT in alcohol/benzo withdrawal
8. **Neurological checks q4h** — GCS or standardized assessment
9. **Fall precautions** — maximum fall prevention measures
10. **1:1 supervision** if elopement risk or severe agitation

#### Transfer Criteria
- New focal neurological deficit (stroke concern)
- Seizure activity
- GCS ≤ 8 or progressive obtundation
- Head trauma + anticoagulant use (subdural hematoma risk)
- AMS not explained after initial workup (may need CT/MRI/LP)
- Unable to maintain airway
- Hemodynamic instability not responsive to treatment

#### Documentation Template
> "[Date/Time] — Acute change in mental status noted by [staff name]. Baseline BIMS: [X], current: [X]. CAM positive/negative for: [list 4 features]. Onset: [acute/gradual]. Course: [fluctuating/persistent]. Associated symptoms: [fever, urinary changes, new medications, fall history].
>
> Delirium workup initiated: glucose [X], VS [details], MAR reviewed [findings]. Dr. [Name] notified at [time] via SBAR. Orders received: [labs, imaging, medication changes].
>
> Interventions: [environmental modifications, medication holds/changes, hydration, pain management]. Fall precautions activated. [1:1/enhanced supervision] initiated.
>
> Plan: Neurological checks q4h, repeat labs per orders, reassess in [timeframe]. Transfer criteria: [specific parameters]."

#### Family Communication Script
> "Hello [family member name], I'm calling about [resident name]. We've noticed a significant change in [his/her] mental status — [he/she] is more confused than usual and [specific observations: not recognizing staff, agitated, very sleepy].
>
> This type of sudden confusion in older adults is called delirium, and it's usually caused by something we can treat — like an infection, a medication reaction, or dehydration. We've already started checking for these causes — blood tests, urine tests, and reviewing all medications.
>
> Dr. [name] has been notified and is directing the workup. We're monitoring [him/her] closely and keeping [him/her] safe.
>
> Can you tell me how [he/she] was last time you visited? And is there anything new — a fall, pain, changes at home before [he/she] came here — that might help us figure out what's going on?"

---

### Template 4: Urinary Tract Infection with Systemic Signs

**ICD-10:** N39.0 (UTI), R65.20 (if sepsis criteria met)  
**INTERACT II Category:** Infection  
**Expected Domain Triggers:** D8 (infection), D1 (vitals), D3 (if confusion present)

#### STOP and WATCH Criteria
- **S**eems different — new confusion, agitation, lethargy
- **T**emperature change — fever or hypothermia
- **C**hange in urine — dark, cloudy, foul-smelling, frequency change, new incontinence
- **P**ain — suprapubic, flank, dysuria (may be absent in elderly)

#### McGeer Criteria for UTI in SNF (SHEA/IDSA 2012, updated)
**For residents WITHOUT indwelling catheter:**
- ≥ 3 of: acute dysuria, new or worsening urgency/frequency/incontinence, suprapubic tenderness, fever ≥ 37.9°C, gross hematuria, costovertebral angle tenderness
- PLUS positive urine culture (≥ 10⁵ CFU/mL of ≤ 2 species)

**For residents WITH indwelling catheter:**
- ≥ 1 of: fever ≥ 37.8°C, rigors, new-onset flank/suprapubic pain, acute change in mental status, new-onset hematuria
- PLUS positive urine culture (≥ 10⁵ CFU/mL)

**Critical note:** Asymptomatic bacteriuria (positive UA without symptoms) does NOT require treatment per IDSA guidelines. Treating asymptomatic bacteriuria drives antibiotic resistance and C. diff risk.

#### Immediate Assessment Checklist
- [ ] Full vital signs
- [ ] Assess for urinary symptoms: dysuria, frequency, urgency, suprapubic pain, flank pain
- [ ] Assess mental status (new confusion may be only sign in elderly)
- [ ] Abdominal exam: suprapubic tenderness, CVA tenderness
- [ ] If catheter present: inspect for blockage, crusting, discharge, balloon integrity
- [ ] Review prior urine cultures for resistant organisms
- [ ] Review hydration status

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| UA with reflex culture | Confirm pyuria + bacteriuria; culture for sensitivities |
| CBC with differential | WBC for systemic infection assessment |
| BMP | Renal function baseline; adjust antibiotic dosing |
| Blood cultures × 2 | If fever > 38.3°C or SIRS criteria met (urosepsis) |
| Lactate | If hemodynamically unstable (sepsis evaluation) |

#### In-Place Treatment Protocol
1. **Confirm this is a true UTI** (not asymptomatic bacteriuria) — apply McGeer criteria
2. **Obtain urine culture BEFORE starting antibiotics**
3. **Empiric antibiotic therapy** (adjust based on culture results in 48–72h):
   - **Uncomplicated UTI (female, no catheter)**: Nitrofurantoin 100mg PO BID × 5 days (first-line per IDSA 2024) — avoid if CrCl < 30 mL/min
   - **If CrCl < 30**: TMP-SMX DS PO BID × 3 days (check local resistance; if > 20% resistance, use cephalosporin)
   - **Complicated UTI (male, catheter, structural abnormality, systemic signs)**: Ceftriaxone 1g IV × 1, then PO cephalosporin based on culture × 7–14 days
   - **Suspected urosepsis**: Ceftriaxone 1g IV daily or Piperacillin-Tazobactam 4.5g IV q6h (escalate per culture)
4. **IV fluids** if dehydrated or hypotensive: NS 500 mL bolus, reassess
5. **If indwelling catheter present**: Change catheter (obtain culture from new catheter)
6. **Hydration push**: Encourage PO fluids 1.5–2L/day (unless fluid-restricted for CHF)
7. **Acetaminophen 650mg PO q6h PRN** for fever/discomfort
8. **Reassess in 48–72 hours**: improvement expected by 48h; if no improvement, broaden coverage based on culture

#### Transfer Criteria
- Urosepsis with hemodynamic instability (SBP < 90 after fluids)
- Suspected pyelonephritis with vomiting (cannot take PO medications)
- AKI (Cr rising > 1.5× baseline) with oliguria
- Concurrent obstruction suspected (hydronephrosis, complete catheter blockage)

#### Documentation Template
> "[Date/Time] — Resident [name] presenting with [symptoms]. McGeer criteria: [list criteria met/not met]. Catheter status: [in/out]. Vital signs: [details]. Mental status: [baseline vs. current].
>
> UA obtained at [time]: [results if available]. Urine culture sent. Prior culture history: [organism, sensitivities, date].
>
> Dr. [Name] notified at [time]. Orders received: [antibiotic, dose, route, duration]. Empiric coverage based on [prior culture data/institutional antibiogram/IDSA guidelines].
>
> Plan: Reassess in 48-72h for clinical response. Repeat UA if not improving. Culture-directed therapy adjustment pending. Hydration encouraged."

#### Family Communication Script
> "Hello [family member name], we've identified that [resident name] has a urinary tract infection. [He/She] has been showing [specific symptoms: fever, confusion, changes in urination].
>
> We've collected a urine sample for testing and started an antibiotic based on [his/her] history. We expect to see improvement within 48 to 72 hours.
>
> UTIs are very common in nursing home residents and we can usually treat them right here. We'll keep you updated, and if [he/she] doesn't respond to treatment as expected, we'll discuss next steps with you."

---

### Template 5: COPD Exacerbation — Manage in Place Protocol

**ICD-10:** J44.1 (COPD with acute exacerbation)  
**INTERACT II Category:** Respiratory  
**Expected Domain Triggers:** D1 (vitals/O2), D4 (COPD), D10 (prior exacerbation)

#### STOP and WATCH Criteria
- **S**eems different — more short of breath than usual at rest or with minimal activity
- **W**heeze or cough — increased frequency, volume, or purulence of sputum
- **O**xygen requirement increased — needing more supplemental O2 than baseline
- **C**olor change — cyanosis, pallor
- **H**ead of bed — can't lie flat, tripod positioning, accessory muscle use

#### Anthonisen Criteria for COPD Exacerbation Severity
- **Type 1 (Severe)**: All 3: increased dyspnea + increased sputum volume + increased sputum purulence → antibiotics + systemic steroids
- **Type 2 (Moderate)**: 2 of 3 → steroids + consider antibiotics
- **Type 3 (Mild)**: 1 of 3 → adjust bronchodilators

#### Immediate Assessment Checklist
- [ ] Full vital signs: SpO2 on current O2, RR, HR, BP
- [ ] Lung auscultation: wheezing (diffuse vs. focal), air entry, crackles
- [ ] Work of breathing: accessory muscle use, nasal flaring, pursed-lip breathing, tripod position
- [ ] Sputum assessment: volume, color, consistency
- [ ] Level of consciousness (CO2 narcosis: drowsy, confused)
- [ ] Ability to speak in full sentences
- [ ] Review current inhaler/nebulizer regimen and compliance
- [ ] Check if home O2 settings were changed

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| SpO2 continuous | Monitor oxygenation response to treatment |
| ABG or VBG (if available) | pH, pCO2 — assess for respiratory acidosis/CO2 retention |
| CBC | Eosinophilia (allergic component), WBC (infection) |
| BMP | Electrolytes; theophylline-related if applicable |
| Chest X-ray | Rule out pneumonia, pneumothorax, pleural effusion |
| Sputum culture | If purulent sputum — guide antibiotic selection |
| BNP | Differentiate CHF from COPD exacerbation if unclear |
| Procalcitonin | Help differentiate bacterial infection vs. viral/non-infectious |

#### In-Place Treatment Protocol
1. **Position**: Upright at 60–90 degrees, support with pillows
2. **O2 supplementation**: Titrate to SpO2 88–92% (NOT higher — risk of CO2 retention per GOLD 2024). Use Venturi mask for precise FiO2 if available.
3. **Short-acting bronchodilator**: Albuterol 2.5mg nebulizer q20min × 3 doses, then q2–4h PRN
4. **Ipratropium**: 0.5mg nebulizer with first albuterol dose, then q6h (GOLD 2024 — combination preferred for acute exacerbation)
5. **Systemic corticosteroid**: Prednisone 40mg PO daily × 5 days (REDUCE trial — 5 days equal to 14) OR methylprednisolone 125mg IV × 1 if severe/unable to take PO
6. **Antibiotics** (if Type 1 or Type 2 exacerbation with purulent sputum):
   - First line: Azithromycin 500mg PO day 1, then 250mg PO daily × 4 days
   - Alternative: Amoxicillin-clavulanate 875/125mg PO BID × 5–7 days
   - If recent antibiotics or resistance: Levofloxacin 750mg PO daily × 5 days
7. **Continue home maintenance inhalers** (do not stop LAMA/LABA/ICS during exacerbation)
8. **DVT prophylaxis** if immobilized
9. **Reassess in 1–2 hours** after first round of bronchodilators and steroids

#### Transfer Criteria
- SpO2 < 85% despite supplemental O2 at maximum facility capability
- Severe respiratory distress with accessory muscle use not improving after 1 hour of treatment
- Altered mental status (CO2 narcosis) — pH < 7.25 if ABG available
- Hemodynamic instability (SBP < 90)
- Need for non-invasive positive pressure ventilation (BiPAP) not available in facility
- Pneumothorax on CXR
- Concurrent acute MI or arrhythmia

#### Documentation & Family Communication
*[Follow same documentation template structure as CHF — substitute COPD-specific findings and GOLD 2024 guideline citations]*

---

### Template 6: Acute Fall with Injury Assessment

**ICD-10:** W19 (Unspecified fall), additional codes based on injury  
**INTERACT II Category:** Falls  
**Expected Domain Triggers:** D2 (functional), D5 (medications if on anticoagulants), D10 (recent events)

#### STOP and WATCH Criteria
- **S**eems different — new weakness, unsteadiness
- **W**alking differently — new gait abnormality, refusing to bear weight
- **A**ny complaint of head pain after fall
- **P**ain — new pain in hip, back, extremities, head

#### Immediate Assessment — "HEAD TO TOE" Fall Protocol
- [ ] **Do NOT move the resident until assessed** (unless in immediate danger)
- [ ] Vital signs: BP (orthostatic set), HR, SpO2
- [ ] Level of consciousness: GCS score
- [ ] Head/scalp: palpate for hematoma, laceration, tenderness
- [ ] Pupils: equal and reactive? New asymmetry?
- [ ] Neck: tenderness? Hold C-spine if neck pain
- [ ] Extremities: range of motion (if tolerated), deformity, shortening/rotation (hip fracture)
- [ ] Ability to bear weight? If NO → immobilize, X-ray
- [ ] Anticoagulant status: **IS THIS PATIENT ON A BLOOD THINNER?** (Critical — subdural hematoma risk)
- [ ] Review circumstances: witnessed vs. unwitnessed, location, activity, reported mechanism

#### Post-Fall Algorithm Decision Tree

```
Was there head strike or loss of consciousness?
├── YES → Is patient on anticoagulant?
│   ├── YES → CT head non-contrast (transfer for imaging)
│   └── NO → Serial neurological checks q1h × 24h
│         └── Any deterioration → CT head
└── NO → Any new pain or inability to bear weight?
    ├── YES → X-ray affected area
    └── NO → Monitor per enhanced fall protocol
```

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| X-ray of painful area | Fracture assessment |
| CT head non-contrast | If head strike + anticoagulant, LOC, or neurological change |
| CBC | Baseline if injury; anemia as fall cause |
| BMP | Electrolyte abnormality as fall cause (hyponatremia, hypokalemia) |
| Glucose | Hypoglycemia as fall cause |
| INR | If on warfarin — supratherapeutic level as contributing factor |
| Orthostatic BP | Orthostatic hypotension as fall cause (dehydration, medication-related) |
| ECG | Syncope/arrhythmia as fall cause (if syncope suspected) |

#### In-Place Management
1. **Treat any injury**: wound care, splinting, ice, pain management
2. **Pain management**: Acetaminophen 650mg PO q6h scheduled (avoid NSAIDs if renal/cardiac risk; avoid opioids if possible due to fall risk)
3. **Medication review** (within 24 hours):
   - Blood pressure medications (orthostatic hypotension?)
   - Psychotropics (sedation, ataxia?)
   - Opioids (sedation, dizziness?)
   - Benzodiazepines (must taper if contributing — immediate discontinuation risks withdrawal)
   - Anticoagulants (risk/benefit reassessment after fall)
4. **Environmental review**: bed alarm, non-skid footwear, lighting, assistive device availability
5. **PT/OT evaluation** within 24–48 hours: gait, balance, strength, assistive device assessment
6. **Fall prevention care plan update**: individualized interventions
7. **Neurological checks**: q2h × 24h if head involvement; q1h if on anticoagulant with head strike

#### Transfer Criteria
- Suspected hip fracture (shortened/externally rotated leg, inability to bear weight)
- Head injury + anticoagulant (CT head required)
- Loss of consciousness (even brief) without clear cause
- New focal neurological deficit
- Unstable spine injury suspected
- Any fracture requiring surgical intervention
- Active bleeding not controlled with direct pressure

#### Documentation Template
> "[Date/Time] — Fall event. [Witnessed/Unwitnessed] fall in [location]. Resident found [position]. Mechanism: [if known]. Resident [able/unable] to describe event.
>
> Assessment: VS [details]. LOC: GCS [X]. Neurological: pupils [equal and reactive / other]. Pain: [location, severity]. ROM: [findings]. Weight-bearing: [able/unable]. Skin: [laceration/bruise/intact]. Anticoagulant status: [on/not on — name of medication].
>
> Head strike: [yes/no]. If yes and on anticoagulant: neurological checks initiated per protocol.
>
> Dr. [Name] notified at [time]. Orders: [specific]. Fall investigation: [contributing factors identified].
>
> Care plan updated: [interventions added]. Family notified at [time]."

---

### Template 7: Pressure Injury Deterioration (Stage 2 → 3 Progression)

**ICD-10:** L89.x (Pressure ulcer, stage-specific)  
**INTERACT II Category:** Skin / Wound  
**Expected Domain Triggers:** D7 (wounds), D6 (nutrition), D8 (infection risk)

#### STOP and WATCH Criteria
- **S**kin change — wound getting bigger, deeper, or changing color
- **W**ound drainage — increased volume, purulent, malodorous
- **A**rea around wound — redness spreading, warmth, swelling (cellulitis)
- **T**emperature — fever may indicate wound infection or sepsis
- **P**ain — new or increasing pain at wound site

#### Immediate Assessment Checklist
- [ ] Full wound measurement: length × width × depth (in cm)
- [ ] Wound bed assessment: tissue type (granulation, slough, eschar, necrotic)
- [ ] Wound edges: rolled, undermining, tunneling (document clock positions)
- [ ] Periwound skin: erythema, maceration, induration, warmth
- [ ] Drainage: type (serous, serosanguinous, purulent), amount (scant, moderate, copious)
- [ ] Odor: present/absent
- [ ] Compare to last wound assessment — document all changes
- [ ] Nutritional status: albumin, prealbumin, weight trend, dietary intake
- [ ] Pressure relief: current support surface, repositioning schedule compliance
- [ ] Continence status (moisture management)

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| Wound culture (tissue biopsy preferred > swab) | If signs of infection — identify organism and sensitivities |
| CBC with differential | WBC trending — systemic infection |
| CRP/ESR | Inflammatory markers — osteomyelitis screening |
| Albumin, prealbumin | Nutritional status — healing capacity |
| BMP | Renal function (affects healing), glucose (diabetes control) |
| HbA1c | Glycemic control (if diabetic) — poor control impairs healing |
| X-ray of underlying bone | If Stage 3/4 — osteomyelitis screening |
| MRI (if available/transfer) | Gold standard for osteomyelitis diagnosis |
| Blood cultures | If systemic signs of infection present |

#### In-Place Treatment Protocol
1. **Wound care reassessment**: Change wound care regimen per NPUAP/EPUAP 2019:
   - Stage 3: moist wound healing environment — hydrocolloid, foam, or alginate dressing based on drainage
   - Debridement: autolytic (moisture-retentive dressing), enzymatic (collagenase/Santyl), or sharp (by wound specialist)
   - Avoid cytotoxic agents (povidone-iodine, hydrogen peroxide) on healing tissue
2. **Pressure redistribution** (immediate):
   - Upgrade to Group 2 support surface (alternating pressure mattress) if not already on one
   - Strict repositioning schedule: q2h with documentation
   - Offloading device for heel wounds (heel suspension boot)
   - Avoid positioning on the wound
3. **Nutritional intervention** (ASPEN 2024):
   - Protein: 1.25–1.5 g/kg/day (wound healing requirement)
   - Calories: 30–35 kcal/kg/day
   - Supplement: vitamin C 500mg BID + zinc 220mg daily
   - Consider protein supplement drink TID with meals
   - Nutrition consult within 24 hours
4. **Glycemic control**: Target fasting glucose 100–180 mg/dL (optimize healing without hypoglycemia risk)
5. **Infection management**: If wound infection confirmed:
   - Topical antimicrobial (silver-based dressing: Mepilex Ag, Aquacel Ag)
   - Systemic antibiotics ONLY if cellulitis, bacteremia, or osteomyelitis — not for localized wound colonization
6. **Wound specialist consult** within 7 days if no improvement
7. **Photography**: Wound photos with ruler at each assessment for trajectory tracking
8. **Reassessment schedule**: Weekly wound measurements + progress documentation

#### Transfer Criteria
- Signs of wound sepsis (SIRS criteria + wound source)
- Suspected osteomyelitis requiring MRI and IV antibiotics beyond SNF capability
- Wound requiring surgical debridement beyond facility capability
- Necrotizing fasciitis (rapidly spreading erythema, crepitus, systemic toxicity)

---

### Template 8: Aspiration Pneumonia Risk

**ICD-10:** J69.0 (Aspiration pneumonitis/pneumonia)  
**INTERACT II Category:** Respiratory / Nutrition  
**Expected Domain Triggers:** D1 (vitals/respiratory), D6 (dysphagia), D8 (infection)

#### STOP and WATCH Criteria
- **S**wallowing difficulty — coughing, choking, wet/gurgling voice during or after meals
- **T**emperature — new low-grade or high fever after meals
- **O**xygen dropping — desaturation during or after meals
- **P**ulmonary — new crackles, rhonchi, increased secretions

#### Risk Factor Assessment
- Dysphagia level (from most recent SLP evaluation)
- Diet texture level and compliance
- Positioning during and after meals (HOB ≥ 30 degrees)
- Oral care frequency and quality
- Level of consciousness during meals
- Medication crush list (medications that should not be crushed for dysphagia patients)
- History of aspiration events

#### Immediate Assessment Checklist
- [ ] Full vital signs: SpO2 during and 30 minutes after meals
- [ ] Lung auscultation: pre-meal and post-meal comparison
- [ ] Assess swallowing at bedside: thin liquids, thickened liquids, puree, solids
- [ ] Review SLP evaluation date — is it current (within 90 days)?
- [ ] Review diet order vs. actual diet served
- [ ] Assess oral hygiene: oral care BID minimum reduces aspiration pneumonia by 40% (Sjögren et al., 2008)
- [ ] HOB elevation: confirm ≥ 30 degrees during meals and 30–60 minutes after

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| Chest X-ray | Infiltrate in dependent lobes (RLL, LLL) — aspiration pneumonia |
| CBC | WBC elevation — infection |
| BMP | Dehydration status if reducing PO intake |
| Blood cultures | If febrile — bacteremia |
| Modified barium swallow (VFSS) or FEES | Gold standard for aspiration assessment — may need to schedule or transfer |
| Sputum culture | If producing sputum — aspiration organisms (anaerobes, mixed flora) |

#### In-Place Treatment Protocol
1. **NPO temporarily** until SLP bedside evaluation (if acute aspiration event)
2. **HOB ≥ 45 degrees** during all meals and 60 minutes after
3. **SLP reassessment** — STAT referral for bedside swallow evaluation
4. **Diet modification** per SLP recommendation (texture upgrade/downgrade)
5. **Oral care BID** — chlorhexidine oral swabs reduce aspiration pneumonia (Sjögren et al., 2008)
6. **If aspiration pneumonia confirmed**:
   - Ampicillin-sulbactam 1.5g IV q6h OR Piperacillin-tazobactam 4.5g IV q6h (anaerobic coverage per IDSA)
   - Duration: 5–7 days (shorter course per recent evidence)
7. **Consider PPI/H2 blocker** to reduce gastric acid aspiration if GERD history
8. **Feeding assistance**: supervised meals, small bites, chin tuck technique
9. **Medication review**: liquid formulations for dysphagia patients; identify medications that should NOT be crushed

#### Transfer Criteria
- Respiratory failure (SpO2 < 88% on max O2)
- Large aspiration event with acute respiratory distress
- Need for bronchoscopy (large food particle aspiration)
- Hemodynamic instability
- NPO status requiring IV nutrition beyond 72 hours

---

### Template 9: Medication Toxicity / Adverse Drug Event

**ICD-10:** T36-T50 (Poisoning/adverse effects of drugs)  
**INTERACT II Category:** Medication Safety  
**Expected Domain Triggers:** D5 (medications), D1 (vitals), D3 (cognitive if CNS effects)

#### STOP and WATCH Criteria
- **S**eems different — new drowsiness, confusion, agitation, dizziness
- **T**iming — symptoms correlate with recent medication start or dose change
- **O**ther — new rash, GI symptoms, bleeding, tremor, or any unexplained new symptom
- **M**edication — new medication started within 14 days

#### High-Risk Medication Toxicity Patterns in SNF

| Medication Class | Toxicity Signs | Immediate Action |
|-----------------|----------------|-----------------|
| Warfarin (INR > 5) | Bleeding, bruising, dark stool, hematuria | Hold warfarin; INR stat; vitamin K if active bleeding |
| Digoxin | Nausea, confusion, visual changes (yellow halos), bradycardia | Hold digoxin; level stat; ECG; check K+ |
| Insulin | Sweating, tremor, confusion, seizure, unresponsive | Glucose stat; treat hypoglycemia per protocol |
| Opioids | Respiratory depression (RR < 10), pinpoint pupils, sedation | Hold opioid; Narcan 0.4mg IM if RR < 8 or unresponsive |
| Benzodiazepines | Excessive sedation, falls, respiratory depression | Hold/taper; flumazenil ONLY if life-threatening (risk of seizure) |
| Lithium | Tremor, diarrhea, confusion, ataxia | Hold lithium; level stat; BMP; hydration |
| Phenytoin | Ataxia, nystagmus, slurred speech, confusion | Hold phenytoin; level stat |
| Metformin | Lactic acidosis (nausea, hyperventilation, AMS) | Hold metformin; lactate; BMP |
| SSRIs + other serotonergic | Tremor, clonus, hyperthermia, agitation | Serotonin syndrome: hold agents, supportive care, cyproheptadine |
| Fluoroquinolones | Tendon pain, confusion, QTc prolongation | Stop fluoroquinolone; ECG; switch antibiotic class |

#### Immediate Assessment
- [ ] Full vital signs including temperature
- [ ] Medication reconciliation: what changed in last 14 days?
- [ ] Timeline: symptom onset vs. medication timing
- [ ] Focused exam based on suspected agent
- [ ] Drug levels for narrow therapeutic index medications
- [ ] ECG if QTc-prolonging agents involved

#### In-Place Treatment Protocol
1. **Hold suspected offending medication immediately**
2. **Supportive care**: IV fluids, monitoring, symptom management
3. **Antidote administration** (if available in facility and indicated):
   - Narcan (naloxone) for opioid toxicity
   - Vitamin K for warfarin over-anticoagulation
   - IV dextrose (D50) for hypoglycemia
   - Activated charcoal (only if ingestion within 1–2 hours, rare in SNF)
4. **Pharmacist review** within 4 hours for complete drug interaction analysis
5. **Alternative medication selection** with physician
6. **Report ADE**: MedWatch if appropriate; facility incident report
7. **Monitor for rebound**: some medications cause withdrawal symptoms (beta-blockers, opioids, benzodiazepines)

#### Transfer Criteria
- Life-threatening arrhythmia
- Severe hemorrhage (GI bleed, intracranial bleed suspected)
- Respiratory arrest/severe depression (Narcan temporarily effective, may need infusion)
- Serotonin syndrome with hyperthermia > 40°C
- Lithium level > 2.5 mEq/L
- Seizure activity

---

### Template 10: Acute Functional Decline Without Clear Cause

**ICD-10:** R53.1 (Weakness), R62.7 (Adult failure to thrive)  
**INTERACT II Category:** Other / Multisystem  
**Expected Domain Triggers:** D2 (functional), D3 (cognitive if affected), D4 (complexity)

**Why this matters:** Acute unexplained functional decline in SNF residents is a "red flag" that often precedes a major clinical event by 24–72 hours. It may be the earliest sign of occult infection, medication toxicity, depression, new cardiovascular event, or malignancy. It requires systematic evaluation.

#### STOP and WATCH Criteria
- **S**eems different — less engaged, weaker, not participating
- **T**alking less — withdrawn, not conversing as usual
- **O**ther — eating less, sleeping more, refusing activities
- **P**erformance — doing less than they could do yesterday

#### Systematic Evaluation — "DECLINE" Mnemonic
- **D**rugs — new medications or dose changes in 14 days?
- **E**lectrolytes — sodium, potassium, calcium, glucose abnormality?
- **C**ardiac — silent MI, CHF decompensation, arrhythmia?
- **L**ung — pneumonia, PE, COPD exacerbation?
- **I**nfection — UTI, pneumonia, skin, C. diff? (often afebrile in elderly)
- **N**eurological — stroke, subdural hematoma, seizure, delirium?
- **E**motional — depression, grief, loss of roommate/friend, family issues?

#### Immediate Assessment
- [ ] Full vital signs with orthostatic BPs
- [ ] Mental status assessment: BIMS or CAM
- [ ] Complete physical exam (head to toe — looking for what was missed)
- [ ] Pain assessment: PAINAD if non-verbal — uncontrolled pain causes functional decline
- [ ] Review MAR for last 14 days: any new starts, dose changes, PRN use patterns
- [ ] Review recent labs (if none in 7 days, order new)
- [ ] Functional assessment: compare current ADL performance to 7-day and 30-day baselines
- [ ] Mood assessment: PHQ-9 or observation-based tool
- [ ] Nutrition: has intake changed? Weight stable?
- [ ] Bowel function: constipation, impaction (major contributor to decline in elderly)

#### Diagnostic Workup
| Test | Rationale |
|------|-----------|
| CBC with differential | Infection, anemia (Hgb < 8 causes fatigue/weakness) |
| CMP (comprehensive metabolic) | Electrolytes, glucose, renal function, liver function, calcium |
| TSH | Hypothyroidism — common cause of functional decline in elderly |
| UA with culture | Occult UTI |
| Chest X-ray | Occult pneumonia, CHF |
| B12, folate | Deficiency causes weakness, cognitive change |
| ESR/CRP | Occult inflammatory/infectious process |
| ECG | Silent arrhythmia, MI |
| Vitamin D | Severe deficiency causes muscle weakness |
| Abdominal X-ray | Constipation/impaction assessment |

#### In-Place Treatment Protocol
1. **Treat identified cause** — this is the primary intervention
2. **If no cause identified after workup**: 
   - Intensify monitoring: VS q8h, nursing assessment q shift with functional focus
   - PT/OT evaluation within 24 hours for strength and safety assessment
   - Nutrition consult — ensure caloric and protein goals met
   - Reassess medications: trial hold of any medication that could contribute to fatigue/weakness
   - Consider depression: trial SSRI if mood assessment supports
   - Repeat labs in 1 week if initial labs unremarkable
   - Consider advanced imaging if concern for occult malignancy
3. **Activity/engagement plan**: structured daily activity, social interaction, goals
4. **Family conference**: if decline persists > 7 days without identified cause — discuss prognosis, goals of care, hospice eligibility

#### Transfer Criteria
- Acute new neurological deficit discovered on exam
- Critical lab value (K+ > 6.0, Na+ < 120, glucose < 40)
- Suspected MI on ECG
- Hemodynamic instability
- Severe anemia requiring transfusion (Hgb < 7 g/dL with symptoms)

#### Documentation & Family Communication
*[Follow standard template structure — emphasize the systematic workup being conducted and the timeline for results/reassessment]*

---

## 6. Technical Implementation Spec for Codex

### 6.1 Data Input Schema

The engine requires the following data from the PointClickCare (PCC) API. Each field maps to a PCC API endpoint or calculated value.

```python
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class RiskBand(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    STABLE = "STABLE"

class TrendDirection(Enum):
    RAPIDLY_RISING = "RAPIDLY_RISING"      # ↑↑ > 15 points in 7d
    RISING = "RISING"                       # ↑  5-15 points in 7d
    STABLE = "STABLE"                       # →  < 5 points in 7d
    IMPROVING = "IMPROVING"                 # ↓  5-15 points decrease in 7d
    RAPIDLY_IMPROVING = "RAPIDLY_IMPROVING" # ↓↓ > 15 points decrease in 7d

@dataclass
class VitalSigns:
    """Most recent vital signs + historical series for trend calculation."""
    timestamp: datetime
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    heart_rate: Optional[float] = None
    temperature_c: Optional[float] = None  # Celsius
    o2_saturation: Optional[float] = None  # Percentage
    o2_delivery: Optional[str] = None       # "room_air", "nasal_cannula_2L", etc.
    respiratory_rate: Optional[float] = None
    weight_lbs: Optional[float] = None

@dataclass
class VitalSignsSeries:
    """Time series of vital signs for trend analysis."""
    readings: List[VitalSigns] = field(default_factory=list)  # Ordered by timestamp
    
@dataclass
class MDSData:
    """MDS assessment data — Section C (cognitive), G (functional), D (mood), K (nutrition)."""
    assessment_date: Optional[date] = None
    # Section C - Cognitive
    bims_score: Optional[int] = None          # 0-15; ≤7 severe, 8-12 moderate, 13-15 intact
    bims_score_prior: Optional[int] = None    # Prior assessment for delta calculation
    bims_date_prior: Optional[date] = None
    # Section D - Mood
    phq9_score: Optional[int] = None          # 0-27
    phq9_score_prior: Optional[int] = None
    phq9_item9: Optional[int] = None          # Suicidal ideation item (0-3)
    # Section G - Functional
    adl_total_score: Optional[int] = None     # Composite ADL self-performance
    adl_total_prior: Optional[int] = None
    adl_prior_date: Optional[date] = None
    ambulation_status: Optional[str] = None   # "independent", "assistive_device", "wheelchair", "bedbound"
    ambulation_prior: Optional[str] = None
    locomotion_status: Optional[str] = None
    # Section K - Nutrition
    fluid_intake_concern: Optional[bool] = None
    weight_loss_flag: Optional[bool] = None   # MDS weight loss indicator
    # Section P - Restraints
    restraint_use: Optional[bool] = None
    restraint_new: Optional[bool] = None

@dataclass
class Diagnosis:
    """Active diagnosis entry."""
    icd10_code: str
    description: str
    onset_date: Optional[date] = None
    is_active: bool = True

@dataclass
class Medication:
    """Active medication entry."""
    name: str
    generic_name: Optional[str] = None
    drug_class: Optional[str] = None       # "anticoagulant", "insulin", "opioid", "psychotropic", "digoxin", etc.
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    is_prn: bool = False
    is_high_risk: bool = False             # Flag for high-risk medication classes

@dataclass
class MedicationChange:
    """Record of medication change."""
    medication_name: str
    change_type: str    # "new_start", "dose_increase", "dose_decrease", "discontinued", "hold"
    change_date: date
    drug_class: Optional[str] = None

@dataclass
class LabResult:
    """Laboratory result entry."""
    test_name: str
    value: Optional[float] = None
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    is_critical: bool = False
    result_date: date = None

@dataclass
class WoundEntry:
    """Wound/pressure injury assessment."""
    wound_id: str
    wound_type: str              # "pressure_injury", "surgical", "venous", "diabetic", "other"
    stage: Optional[int] = None  # 1, 2, 3, 4, None for unstageable
    is_unstageable: bool = False
    is_dti: bool = False         # Deep tissue injury
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    depth_cm: Optional[float] = None
    wound_bed: Optional[str] = None       # "granulation", "slough", "eschar", "necrotic", "mixed"
    drainage_type: Optional[str] = None   # "serous", "serosanguinous", "purulent"
    infection_signs: bool = False
    healing_trend: Optional[str] = None   # "improving", "stalled", "worsening"
    assessment_date: date = None
    prior_stage: Optional[int] = None     # Previous assessment stage for progression detection

@dataclass
class Incident:
    """Clinical incident record."""
    incident_type: str    # "fall", "behavioral", "hypoglycemia", "wandering", "other"
    incident_date: datetime
    injury_level: Optional[str] = None   # "none", "minor", "moderate", "major", "death"
    injury_type: Optional[str] = None    # "head_strike", "laceration", "fracture", "bruise"
    details: Optional[str] = None

@dataclass
class Hospitalization:
    """Hospital transfer/admission record."""
    admission_date: date
    discharge_date: Optional[date] = None
    reason: Optional[str] = None
    facility_name: Optional[str] = None
    is_er_visit: bool = False  # True = ER visit only (not admitted)

@dataclass
class AdvanceDirective:
    """Advance directive status."""
    has_directive: bool = False
    code_status: Optional[str] = None     # "full_code", "dnr", "dnh", "dnr_dnh", "comfort_only"
    polst_completed: bool = False
    last_review_date: Optional[date] = None

@dataclass
class TherapyStatus:
    """Physical/Occupational/Speech therapy status."""
    is_active: bool = False
    therapy_type: Optional[str] = None    # "PT", "OT", "SLP", "combined"
    participation_rate_7d: Optional[float] = None  # 0.0 to 1.0 (percentage)
    status: Optional[str] = None          # "active", "on_hold", "discontinued_planned", "discontinued_unplanned"

@dataclass
class CareEngagement:
    """Psychosocial and care engagement data."""
    family_engagement: Optional[str] = None     # "none", "minimal", "moderate", "active"
    care_plan_compliance_rate: Optional[float] = None  # 0.0 to 1.0
    care_refusals_7d: Optional[int] = None
    medication_refusals_7d: Optional[int] = None

@dataclass
class Demographics:
    """Basic resident demographics."""
    resident_id: str
    first_name: str
    last_name: str
    date_of_birth: date
    age: int
    sex: str
    room_number: Optional[str] = None
    admission_date: date = None
    facility_name: Optional[str] = None

@dataclass
class ResidentInput:
    """Complete input schema for one resident — all data needed for risk scoring."""
    demographics: Demographics
    vitals_current: Optional[VitalSigns] = None
    vitals_series: Optional[VitalSignsSeries] = None
    mds: Optional[MDSData] = None
    diagnoses: List[Diagnosis] = field(default_factory=list)
    medications_active: List[Medication] = field(default_factory=list)
    medication_changes_14d: List[MedicationChange] = field(default_factory=list)
    labs_recent: List[LabResult] = field(default_factory=list)
    wounds: List[WoundEntry] = field(default_factory=list)
    incidents_30d: List[Incident] = field(default_factory=list)
    hospitalizations_90d: List[Hospitalization] = field(default_factory=list)
    er_visits_30d: List[Hospitalization] = field(default_factory=list)
    advance_directive: Optional[AdvanceDirective] = None
    therapy: Optional[TherapyStatus] = None
    care_engagement: Optional[CareEngagement] = None
    physician_visits_scheduled: Optional[int] = None
    physician_visits_actual: Optional[int] = None
    diet_texture: Optional[str] = None        # "regular", "mechanical_soft", "pureed"
    thickened_liquids: Optional[str] = None    # "thin", "nectar", "honey", "pudding"
    tube_feeding: bool = False
    urinary_catheter: bool = False
    iv_therapy_active: bool = False
    dialysis_active: bool = False
```

### 6.2 Scoring Function Pseudocode — Per Domain

```python
def score_domain_1_vitals(resident: ResidentInput) -> DomainResult:
    """Score Domain 1: Vital Signs & Physiologic Instability."""
    raw_points = 0.0
    triggered_variables = []
    
    v = resident.vitals_current
    series = resident.vitals_series
    
    if v is None:
        return DomainResult(score=0.0, missing_data=True, note="No current vitals available")
    
    # Systolic BP
    if v.systolic_bp is not None:
        if v.systolic_bp < 90:
            raw_points += 3.0
            triggered_variables.append("SBP < 90 mmHg (hypotension)")
        elif v.systolic_bp > 180:
            raw_points += 2.0
            triggered_variables.append("SBP > 180 mmHg (hypertensive urgency)")
    
    # Check 72-hour SBP trend
    if series and len(series.readings) >= 2:
        sbp_72h_delta = calculate_trend(series, "systolic_bp", hours=72)
        if sbp_72h_delta is not None and sbp_72h_delta < -20:
            raw_points += 2.5
            triggered_variables.append(f"SBP trending down {abs(sbp_72h_delta):.0f} mmHg over 72h")
    
    # Heart Rate
    if v.heart_rate is not None:
        if v.heart_rate > 100:
            raw_points += 2.0
            triggered_variables.append("HR > 100 (tachycardia)")
        elif v.heart_rate < 50:
            raw_points += 2.5
            triggered_variables.append("HR < 50 (bradycardia)")
    
    # 48-hour HR trend
    if series:
        hr_48h_delta = calculate_trend(series, "heart_rate", hours=48)
        if hr_48h_delta is not None and hr_48h_delta > 20:
            raw_points += 2.0
            triggered_variables.append(f"HR trending up {hr_48h_delta:.0f} bpm over 48h")
    
    # Temperature
    if v.temperature_c is not None:
        is_immunocompromised = has_immunocompromised_diagnosis(resident.diagnoses)
        if v.temperature_c > 38.3:
            raw_points += 2.5
            triggered_variables.append(f"Temp {v.temperature_c:.1f}°C (fever)")
        elif v.temperature_c > 37.8 and is_immunocompromised:
            raw_points += 3.0
            triggered_variables.append(f"Temp {v.temperature_c:.1f}°C (immunocompromised — lower threshold)")
        elif v.temperature_c < 35.5:
            raw_points += 3.0
            triggered_variables.append(f"Temp {v.temperature_c:.1f}°C (hypothermia — ominous in elderly)")
    
    # O2 Saturation
    if v.o2_saturation is not None:
        if v.o2_delivery and v.o2_delivery != "room_air" and v.o2_saturation < 88:
            raw_points += 4.0
            triggered_variables.append(f"SpO2 {v.o2_saturation}% on supplemental O2 (refractory hypoxemia)")
        elif v.o2_saturation < 92:
            raw_points += 3.0
            triggered_variables.append(f"SpO2 {v.o2_saturation}% (hypoxemia)")
    
    # O2 sat 24h decline
    if series:
        o2_24h_delta = calculate_trend(series, "o2_saturation", hours=24)
        if o2_24h_delta is not None and o2_24h_delta < -4:
            raw_points += 2.5
            triggered_variables.append(f"SpO2 declined {abs(o2_24h_delta):.0f}% in 24h")
    
    # Respiratory Rate
    if v.respiratory_rate is not None:
        if v.respiratory_rate > 30:
            raw_points += 3.5
            triggered_variables.append("RR > 30 (severe respiratory distress)")
        elif v.respiratory_rate > 24:
            raw_points += 2.0
            triggered_variables.append("RR > 24 (tachypnea)")
    
    # Weight changes (from series)
    weight_3d = calculate_weight_change(series, days=3)
    weight_7d = calculate_weight_change(series, days=7)
    weight_30d_pct = calculate_weight_change_percent(series, days=30)
    
    if weight_3d is not None and weight_3d > 3.0:
        raw_points += 2.5
        triggered_variables.append(f"Weight gain {weight_3d:.1f} lbs in 3 days (fluid overload)")
    if weight_7d is not None and weight_7d > 5.0:
        raw_points += 3.0
        triggered_variables.append(f"Weight gain {weight_7d:.1f} lbs in 7 days")
    if weight_30d_pct is not None and weight_30d_pct < -5.0:
        raw_points += 2.5
        triggered_variables.append(f"Weight loss {abs(weight_30d_pct):.1f}% in 30 days")
    
    # Trending penalty: ≥3 vitals trending adversely in 48h
    adverse_trend_count = count_adverse_trends(series, hours=48)
    if adverse_trend_count >= 3:
        raw_points += 2.0
        triggered_variables.append(f"{adverse_trend_count} vitals trending adversely over 48h")
    
    # Diminishing returns for many abnormals
    abnormal_count = len(triggered_variables)
    if abnormal_count > 3:
        excess = abnormal_count - 3
        raw_points *= (1.0 - (excess * 0.0625))  # ~6% reduction per extra abnormal beyond 3
    
    # Normalize to 0-10
    MAX_POSSIBLE = 35.0  # Theoretical max raw points
    domain_score = min(10.0, (raw_points / MAX_POSSIBLE) * 10.0)
    
    return DomainResult(
        domain_id=1,
        domain_name="Vital Signs & Physiologic Instability",
        raw_score=raw_points,
        normalized_score=round(domain_score, 2),
        weight=1.2,
        weighted_contribution=round(domain_score * 1.2, 2),
        triggered_variables=triggered_variables,
        missing_data=False
    )
```

**Pattern for all domains:** Each domain scoring function follows this structure:
1. Extract relevant variables from `ResidentInput`
2. Apply threshold checks, accumulate points with clinical descriptions
3. Apply domain-specific modifiers (velocity multipliers, interaction flags, hard triggers)
4. Normalize to 0–10
5. Return `DomainResult` with full audit trail

### 6.3 Composite Score Aggregation

```python
@dataclass
class DomainResult:
    domain_id: int
    domain_name: str
    raw_score: float
    normalized_score: float      # 0-10
    weight: float
    weighted_contribution: float  # normalized_score * weight
    triggered_variables: List[str] = field(default_factory=list)
    missing_data: bool = False
    missing_fields: List[str] = field(default_factory=list)
    hard_triggers: List[str] = field(default_factory=list)
    annotations: List[str] = field(default_factory=list)

@dataclass
class InteractionResult:
    interaction_name: str
    bonus_points: float
    triggered_domains: List[int]
    clinical_significance: str

@dataclass
class RiskAssessment:
    resident_id: str
    assessment_timestamp: datetime
    composite_score: float        # 0-100
    risk_band: RiskBand
    trend: TrendDirection
    domain_results: List[DomainResult]
    interactions: List[InteractionResult]
    management_plan: 'ManagementPlan'
    triggered_scenarios: List[str]
    score_history_7d: List[float]
    
def calculate_composite_score(domain_results: List[DomainResult]) -> tuple[float, List[InteractionResult]]:
    """Aggregate domain scores into composite score with interaction bonuses."""
    
    # Step 1: Weighted sum
    weighted_sum = sum(dr.weighted_contribution for dr in domain_results)
    
    # Step 2: Calculate interaction bonuses
    interactions = []
    d = {dr.domain_id: dr for dr in domain_results}
    
    # CHF + CKD synergy
    if has_chf(d.get(4)) and has_ckd_3b_plus(d.get(4)):
        interactions.append(InteractionResult(
            interaction_name="CHF + CKD Synergy",
            bonus_points=3.0,
            triggered_domains=[4],
            clinical_significance="Combined cardiorenal syndrome increases decompensation risk exponentially"
        ))
    
    # Triple comorbidity
    if has_chf(d.get(4)) and has_ckd_3b_plus(d.get(4)) and has_diabetes(d.get(4)):
        interactions.append(InteractionResult(
            interaction_name="Triple Comorbidity Amplifier",
            bonus_points=5.0,
            triggered_domains=[4],
            clinical_significance="CHF + CKD + DM triad — very high baseline risk"
        ))
    
    # Vital instability + Infection (sepsis signal)
    if d.get(1) and d.get(8) and d[1].normalized_score >= 6.0 and d[8].normalized_score >= 6.0:
        interactions.append(InteractionResult(
            interaction_name="Vital Instability + Infection (Sepsis Signal)",
            bonus_points=5.0,
            triggered_domains=[1, 8],
            clinical_significance="Combined physiologic instability and infection markers suggest sepsis"
        ))
    
    # Cognitive change + Infection (delirium from infection)
    if d.get(3) and d.get(8) and d[3].normalized_score >= 5.0 and d[8].normalized_score >= 5.0:
        interactions.append(InteractionResult(
            interaction_name="Cognitive Change + Infection (Delirium)",
            bonus_points=4.0,
            triggered_domains=[3, 8],
            clinical_significance="Cognitive decline concurrent with infection — delirium evaluation mandatory"
        ))
    
    # Functional + Cognitive decline (delirium screen)
    if d.get(2) and d.get(3) and d[2].normalized_score >= 5.0 and d[3].normalized_score >= 5.0:
        interactions.append(InteractionResult(
            interaction_name="Functional + Cognitive Decline (Delirium Screen)",
            bonus_points=3.0,
            triggered_domains=[2, 3],
            clinical_significance="Concurrent functional and cognitive decline — delirium must be ruled out"
        ))
    
    # Falls + Anticoagulation
    if has_falls(d.get(2)) and has_anticoagulant(d.get(5)):
        interactions.append(InteractionResult(
            interaction_name="Falls + Anticoagulation (ICH Risk)",
            bonus_points=4.0,
            triggered_domains=[2, 5],
            clinical_significance="Fall risk on anticoagulant — intracranial hemorrhage risk"
        ))
    
    # Malnutrition + Wounds
    if d.get(6) and d.get(7) and d[6].normalized_score >= 5.0 and d[7].normalized_score >= 5.0:
        interactions.append(InteractionResult(
            interaction_name="Malnutrition + Wound Burden",
            bonus_points=3.0,
            triggered_domains=[6, 7],
            clinical_significance="Nutritional deficiency impairs wound healing — synergistic risk"
        ))
    
    # Post-discharge + medication changes
    if has_recent_hospitalization(d.get(10)) and d.get(5) and d[5].normalized_score >= 4.0:
        interactions.append(InteractionResult(
            interaction_name="Post-Discharge Medication Risk",
            bonus_points=3.0,
            triggered_domains=[5, 10],
            clinical_significance="Transition-of-care medication reconciliation failure risk"
        ))
    
    # Post-discharge + vital instability
    if d.get(10) and d.get(1) and d[10].normalized_score >= 6.0 and d[1].normalized_score >= 5.0:
        interactions.append(InteractionResult(
            interaction_name="Post-Discharge Decompensation",
            bonus_points=4.0,
            triggered_domains=[1, 10],
            clinical_significance="Hemodynamic instability in recent post-discharge period"
        ))
    
    # Step 3: Sum interaction bonuses (cap at 15)
    interaction_bonus = min(15.0, sum(i.bonus_points for i in interactions))
    
    # Step 4: Final score
    composite = min(100.0, weighted_sum + interaction_bonus)
    
    return round(composite, 1), interactions

def classify_risk_band(score: float) -> RiskBand:
    """Map composite score to risk band."""
    if score >= 80:
        return RiskBand.CRITICAL
    elif score >= 60:
        return RiskBand.HIGH
    elif score >= 40:
        return RiskBand.MODERATE
    elif score >= 20:
        return RiskBand.LOW
    else:
        return RiskBand.STABLE

def calculate_trend(score_history_7d: List[float]) -> TrendDirection:
    """Calculate 7-day score trend direction."""
    if len(score_history_7d) < 2:
        return TrendDirection.STABLE
    
    delta = score_history_7d[-1] - score_history_7d[0]
    
    if delta > 15:
        return TrendDirection.RAPIDLY_RISING
    elif delta > 5:
        return TrendDirection.RISING
    elif delta < -15:
        return TrendDirection.RAPIDLY_IMPROVING
    elif delta < -5:
        return TrendDirection.IMPROVING
    else:
        return TrendDirection.STABLE

def apply_trend_override(band: RiskBand, trend: TrendDirection) -> RiskBand:
    """Apply trend-based risk band override."""
    if trend == TrendDirection.RAPIDLY_RISING:
        # Elevate one band
        band_order = [RiskBand.STABLE, RiskBand.LOW, RiskBand.MODERATE, RiskBand.HIGH, RiskBand.CRITICAL]
        current_idx = band_order.index(band)
        return band_order[min(current_idx + 1, len(band_order) - 1)]
    return band
```

### 6.4 Management Plan Selection Logic

```python
@dataclass
class ManagementAction:
    category: str              # "assessment", "medication_review", "diagnostic", "communication",
                               # "monitoring", "intervention", "documentation", "escalation"
    priority: str              # "immediate", "within_4h", "within_24h", "within_72h", "routine"
    action: str                # Specific action description
    clinical_rationale: str    # Why this action
    guideline_reference: str   # Guideline citation
    domain_source: int         # Which domain triggered this action

@dataclass
class ScenarioTemplate:
    scenario_id: str           # "chf_exacerbation", "sepsis", etc.
    scenario_name: str
    stop_and_watch: List[str]
    immediate_assessment: List[str]
    diagnostics: List[dict]    # [{test, rationale}]
    treatment_protocol: List[str]
    transfer_criteria: List[str]
    documentation_template: str
    family_script: str

@dataclass
class ManagementPlan:
    risk_band: RiskBand
    response_timeline: str
    actions: List[ManagementAction]
    triggered_scenarios: List[ScenarioTemplate]
    interact_ii_pathway: Optional[str] = None
    goals_of_care_flag: bool = False

def generate_management_plan(assessment: RiskAssessment) -> ManagementPlan:
    """Generate actionable management plan based on risk assessment."""
    
    actions = []
    scenarios = []
    
    # Step 1: Risk-band-based actions
    if assessment.risk_band == RiskBand.CRITICAL:
        actions.extend(generate_critical_actions(assessment))
    elif assessment.risk_band == RiskBand.HIGH:
        actions.extend(generate_high_actions(assessment))
    elif assessment.risk_band == RiskBand.MODERATE:
        actions.extend(generate_moderate_actions(assessment))
    # LOW and STABLE get minimal/no additional actions
    
    # Step 2: Domain-specific actions
    for dr in assessment.domain_results:
        if dr.normalized_score >= 4.0:  # Domain is significantly triggered
            actions.extend(generate_domain_actions(dr, assessment.risk_band))
    
    # Step 3: Interaction-specific actions
    for interaction in assessment.interactions:
        actions.extend(generate_interaction_actions(interaction))
    
    # Step 4: Scenario matching
    scenarios = match_clinical_scenarios(assessment)
    
    # Step 5: Deduplicate and prioritize actions
    actions = deduplicate_actions(actions)
    actions.sort(key=lambda a: priority_order(a.priority))
    
    # Step 6: Goals of care flag
    goc_flag = should_flag_goals_of_care(assessment)
    
    return ManagementPlan(
        risk_band=assessment.risk_band,
        response_timeline=get_response_timeline(assessment.risk_band),
        actions=actions,
        triggered_scenarios=scenarios,
        interact_ii_pathway=get_interact_pathway(assessment),
        goals_of_care_flag=goc_flag
    )

def match_clinical_scenarios(assessment: RiskAssessment) -> List[ScenarioTemplate]:
    """Match resident's triggered domains to clinical scenario templates."""
    matched = []
    
    # CHF Exacerbation
    if has_chf_diagnosis(assessment) and (
        has_weight_gain(assessment) or has_respiratory_distress(assessment)
    ):
        matched.append(load_scenario("chf_exacerbation"))
    
    # Sepsis
    if meets_sirs_criteria(assessment) or (
        assessment.domain_results_by_id(8).normalized_score >= 7.0 and
        assessment.domain_results_by_id(1).normalized_score >= 5.0
    ):
        matched.append(load_scenario("sepsis"))
    
    # Delirium
    if has_acute_cognitive_change(assessment):
        matched.append(load_scenario("delirium"))
    
    # UTI with systemic signs
    if has_uti_indicators(assessment) and has_systemic_signs(assessment):
        matched.append(load_scenario("uti_systemic"))
    
    # COPD exacerbation
    if has_copd_diagnosis(assessment) and has_respiratory_distress(assessment):
        matched.append(load_scenario("copd_exacerbation"))
    
    # Fall with injury
    if has_recent_fall_with_injury(assessment):
        matched.append(load_scenario("fall_with_injury"))
    
    # Pressure injury deterioration
    if has_wound_progression(assessment):
        matched.append(load_scenario("pressure_injury_deterioration"))
    
    # Aspiration risk
    if has_dysphagia(assessment) and has_respiratory_signs(assessment):
        matched.append(load_scenario("aspiration_pneumonia"))
    
    # Medication toxicity
    if has_medication_toxicity_signs(assessment):
        matched.append(load_scenario("medication_toxicity"))
    
    # Functional decline without cause
    if has_unexplained_functional_decline(assessment):
        matched.append(load_scenario("functional_decline_unexplained"))
    
    return matched
```

### 6.5 Output Schema

```python
@dataclass
class EngineOutput:
    """Complete output for one resident from the risk engine."""
    resident_id: str
    resident_name: str
    room_number: str
    facility: str
    assessment_timestamp: datetime
    
    # Scores
    composite_score: float              # 0-100
    risk_band: str                      # "CRITICAL", "HIGH", "MODERATE", "LOW", "STABLE"
    trend: str                          # "RAPIDLY_RISING", "RISING", "STABLE", "IMPROVING", "RAPIDLY_IMPROVING"
    score_history_7d: List[dict]        # [{date, score}]
    
    # Domain breakdown
    domain_scores: List[dict]           # [{domain_id, name, score, weight, contribution, triggered_vars, missing}]
    
    # Interactions
    interactions: List[dict]            # [{name, bonus, domains, significance}]
    
    # Management Plan
    management_plan: dict               # {risk_band, timeline, actions[], scenarios[], goc_flag}
    
    # Annotations
    critical_alerts: List[str]          # Immediate-attention items
    goals_of_care_flag: bool
    interact_ii_pathway: Optional[str]
    
    # Data quality
    data_completeness: float            # 0.0 to 1.0 — percentage of expected fields populated
    missing_domains: List[str]          # Domains with insufficient data

# Example JSON output:
example_output = {
    "resident_id": "PCC-12345",
    "resident_name": "Smith, John",
    "room_number": "204A",
    "facility": "Complete Care at Multi-Medical Center",
    "assessment_timestamp": "2026-04-15T08:30:00Z",
    "composite_score": 73.4,
    "risk_band": "HIGH",
    "trend": "RISING",
    "score_history_7d": [
        {"date": "2026-04-08", "score": 45.2},
        {"date": "2026-04-09", "score": 48.7},
        {"date": "2026-04-10", "score": 52.1},
        {"date": "2026-04-11", "score": 58.3},
        {"date": "2026-04-12", "score": 62.0},
        {"date": "2026-04-13", "score": 67.8},
        {"date": "2026-04-14", "score": 71.2},
        {"date": "2026-04-15", "score": 73.4}
    ],
    "domain_scores": [
        {
            "domain_id": 1,
            "name": "Vital Signs & Physiologic Instability",
            "score": 6.2,
            "weight": 1.2,
            "contribution": 7.44,
            "triggered_variables": [
                "HR > 100 (tachycardia)",
                "SpO2 91% (hypoxemia)",
                "Weight gain 4.2 lbs in 3 days (fluid overload)"
            ],
            "missing_data": False
        }
        # ... remaining 9 domains
    ],
    "interactions": [
        {
            "name": "CHF + CKD Synergy",
            "bonus": 3.0,
            "domains": [4],
            "significance": "Combined cardiorenal syndrome increases decompensation risk"
        }
    ],
    "management_plan": {
        "risk_band": "HIGH",
        "response_timeline": "Review within 24 hours",
        "actions": [
            {
                "category": "monitoring",
                "priority": "within_4h",
                "action": "Initiate VS q4h x 24 hours with daily weight",
                "rationale": "Fluid overload monitoring for CHF decompensation",
                "guideline": "AHA/ACC 2023 Stage C Heart Failure",
                "domain_source": 1
            },
            {
                "category": "diagnostic",
                "priority": "within_24h",
                "action": "Order BMP, BNP, Chest X-ray",
                "rationale": "Assess renal function, heart failure severity, pulmonary edema",
                "guideline": "AHA/ACC 2023",
                "domain_source": 4
            }
        ],
        "scenarios": ["chf_exacerbation"],
        "goals_of_care_flag": False
    },
    "critical_alerts": [],
    "goals_of_care_flag": False,
    "interact_ii_pathway": "Cardiovascular — Acute Heart Failure",
    "data_completeness": 0.87,
    "missing_domains": []
}
```

### 6.6 Edge Cases and Null Data Handling

```python
# PRINCIPLE: Missing data should degrade gracefully — never produce false negatives.
# A missing domain should NOT count as zero risk. It should be flagged as unknown risk.

MISSING_DATA_RULES = {
    # Strategy: When a domain has missing data, apply the median population score
    # for that domain (conservative estimate) and flag as "estimated."
    
    "vitals_missing": {
        "action": "Apply median domain score (3.5/10) as baseline estimate",
        "flag": "Vital signs data unavailable — risk may be underestimated",
        "escalation": "If vitals have not been recorded in > 24 hours, generate alert: 'Vital signs overdue'"
    },
    
    "mds_missing": {
        "action": "Use last available MDS data; if > 90 days old, flag as stale",
        "flag": "MDS data > 90 days old — functional and cognitive baselines may be inaccurate",
        "escalation": "If MDS is overdue per regulatory schedule, generate compliance alert"
    },
    
    "labs_missing": {
        "action": "Score lab-dependent variables as 0 (cannot confirm abnormality)",
        "flag": "Recent labs unavailable — consider ordering baseline labs",
        "escalation": "If patient is CRITICAL/HIGH and no labs in 30 days, auto-recommend lab orders"
    },
    
    "medications_missing": {
        "action": "This should never happen in PCC — medication list is core data",
        "flag": "CRITICAL: Medication data unavailable — scoring unreliable",
        "escalation": "Immediate data quality alert to nursing staff and pharmacy"
    },
    
    "wounds_missing": {
        "action": "Score as 0 (no known wounds)",
        "flag": "Wound assessment may be pending — verify with nursing",
        "note": "Absence of wound data is often legitimate (no wounds)"
    },
    
    "partial_domain_data": {
        "action": "Score only available variables; adjust max possible proportionally",
        "example": "If 8 of 12 domain variables have data, normalize against 8-variable max",
        "flag": "Domain X scored with partial data (Y/Z variables available)"
    }
}

def handle_missing_data(resident: ResidentInput) -> List[DataQualityFlag]:
    """Assess data completeness and apply missing-data rules."""
    flags = []
    total_fields = 0
    populated_fields = 0
    
    # Check each critical data category
    if resident.vitals_current is None:
        flags.append(DataQualityFlag(
            domain="vitals",
            severity="high",
            message="No current vital signs available",
            recommendation="Obtain vital signs stat"
        ))
    else:
        # Count populated vital sign fields
        vital_fields = ['systolic_bp', 'heart_rate', 'temperature_c', 'o2_saturation', 'respiratory_rate']
        for f in vital_fields:
            total_fields += 1
            if getattr(resident.vitals_current, f) is not None:
                populated_fields += 1
    
    # Check MDS staleness
    if resident.mds and resident.mds.assessment_date:
        days_since_mds = (date.today() - resident.mds.assessment_date).days
        if days_since_mds > 90:
            flags.append(DataQualityFlag(
                domain="mds",
                severity="medium",
                message=f"MDS assessment is {days_since_mds} days old",
                recommendation="MDS reassessment may be needed per CMS schedule"
            ))
    elif resident.mds is None:
        flags.append(DataQualityFlag(
            domain="mds",
            severity="high",
            message="No MDS data available",
            recommendation="Functional and cognitive baselines unknown — apply conservative estimates"
        ))
    
    # Check lab recency for high-risk patients
    if resident.labs_recent:
        most_recent_lab = max(resident.labs_recent, key=lambda l: l.result_date)
        days_since_labs = (date.today() - most_recent_lab.result_date).days
        if days_since_labs > 30:
            flags.append(DataQualityFlag(
                domain="labs",
                severity="medium",
                message=f"Most recent labs are {days_since_labs} days old",
                recommendation="Consider ordering updated CBC, BMP, albumin"
            ))
    
    data_completeness = populated_fields / max(total_fields, 1)
    
    return flags, data_completeness
```

### 6.7 API Integration Points

```python
# PCC API endpoints required (to be confirmed with PCC API documentation):

PCC_API_ENDPOINTS = {
    "residents": "/api/v1/residents",                    # List all residents
    "resident_detail": "/api/v1/residents/{id}",         # Resident demographics
    "vitals": "/api/v1/residents/{id}/vitals",           # Vital signs (current + historical)
    "medications": "/api/v1/residents/{id}/medications",  # Active medications
    "med_changes": "/api/v1/residents/{id}/medication-changes",  # Recent changes
    "diagnoses": "/api/v1/residents/{id}/diagnoses",     # Active diagnoses
    "labs": "/api/v1/residents/{id}/lab-results",        # Lab results
    "mds": "/api/v1/residents/{id}/mds-assessments",     # MDS data
    "wounds": "/api/v1/residents/{id}/wound-assessments", # Wound data
    "incidents": "/api/v1/residents/{id}/incidents",      # Falls, behavioral
    "hospitalizations": "/api/v1/residents/{id}/hospitalizations",  # Transfer history
    "orders": "/api/v1/residents/{id}/orders",           # Active orders
    "advance_directives": "/api/v1/residents/{id}/advance-directives",
    "therapy": "/api/v1/residents/{id}/therapy-status",
    "care_plan": "/api/v1/residents/{id}/care-plan",
    "physician_visits": "/api/v1/residents/{id}/physician-visits",
}

# Note: Actual PCC API endpoint structure will be confirmed once API key is received.
# The data transformation layer should be isolated to allow easy remapping.
```

---

## 7. Evidence Base & References

### Primary Clinical Guidelines Cited

1. **INTERACT II** (Interventions to Reduce Acute Care Transfers) — Ouslander JG, et al. (2011). *J Am Geriatr Soc*, 59(4):745-753. — Foundation for SNF early warning and acute change management.

2. **AHA/ACC 2023 Heart Failure Guidelines** — Heidenreich PA, et al. (2022 update). *Circulation*. — CHF staging, pharmacotherapy, diuretic management.

3. **Surviving Sepsis Campaign 2021** — Evans L, et al. (2021). *Intensive Care Med*, 47:1181-1247. — Sepsis bundle (hour-1), fluid resuscitation, antibiotic timing.

4. **GOLD 2024** (Global Initiative for Chronic Obstructive Lung Disease) — COPD exacerbation classification and management.

5. **KDIGO 2024** (Kidney Disease: Improving Global Outcomes) — AKI staging, CKD management, hyperkalemia protocols.

6. **IDSA 2024** (Infectious Diseases Society of America) — UTI management, antibiotic stewardship, procalcitonin guidance.

7. **NPUAP/EPUAP 2019** (National/European Pressure Ulcer Advisory Panel) — Pressure injury staging, prevention, wound care protocols.

8. **ASPEN 2024** (American Society for Parenteral and Enteral Nutrition) — Malnutrition screening, protein requirements for wound healing.

9. **AMDA 2024** (American Medical Directors Association) — SNF clinical practice guidelines, transitions of care, delirium management.

10. **ADA 2024** (American Diabetes Association) — Standards of care, glycemic targets in elderly, hypoglycemia management.

11. **CMS SNF Quality Measures** (2024) — QM 401.2 (weight loss), QM 402.1/402.2 (pressure injuries), SNF VBP readmission measures.

12. **FDA Boxed Warnings** — Opioid + benzodiazepine concurrent use; serotonin syndrome risk; antipsychotic use in dementia (Black Box).

### Key Evidence for Scoring Model

13. **Charlson ME, et al.** (1987). A new method of classifying prognostic comorbidity in longitudinal studies. *J Chronic Dis*, 40(5):373-383. — Charlson Comorbidity Index.

14. **Mor V, et al.** (2010). The revolving door of rehospitalization from skilled nursing facilities. *Health Aff*, 29(1):57-64. — 30-day rehospitalization rates and predictors.

15. **Jencks SF, et al.** (2009). Rehospitalizations among patients in the Medicare fee-for-service program. *NEJM*, 360(14):1418-1428. — Rehospitalization epidemiology.

16. **Volpato S, et al.** (2007). Characteristics of nondisabled older patients developing new disability associated with medical illnesses and hospitalization. *J Gen Intern Med*, 22(5):668-674. — Functional decline as predictor.

17. **Inouye SK, et al.** (2014). Delirium in elderly people. *Lancet*, 383(9920):911-922. — Delirium epidemiology and detection.

18. **Gurwitz JH, et al.** (2005). The incidence of adverse drug events in two large academic long-term care facilities. *Am J Med*, 118(3):251-258. — ADE epidemiology in SNFs.

19. **Sullivan DH, et al.** (1999). Protein-energy undernutrition among elderly hospitalized patients. *JAMA*, 281(21):2013-2019. — Malnutrition and mortality.

20. **Ouslander JG, et al.** (2010). Potentially avoidable hospitalizations from long-term care facilities. *J Am Geriatr Soc*, 58(4):627-635. — Infection as leading cause of transfers.

21. **Teno JM, et al.** (2002). Decision-making and outcomes of feeding tube insertion. *J Am Geriatr Soc*, 50(1):174-180. — Advance directives and hospitalization patterns.

22. **Subbe CP, et al.** (2001). Validation of a modified Early Warning Score in medical admissions. *QJM*, 94(10):521-526. — Sequential vital sign monitoring.

23. **Saliba D, et al.** (2012). Appropriateness of the decision to transfer nursing facility residents to the hospital. *J Am Geriatr Soc*, 60(5):816-821. — Transfer appropriateness criteria.

24. **Seymour CW, et al.** (2016). Assessment of Clinical Criteria for Sepsis. *JAMA*, 315(8):762-774. — qSOFA validation.

25. **Sjögren P, et al.** (2008). A systematic review of the preventive effect of oral hygiene on pneumonia and respiratory tract infection in elderly people in hospitals and nursing homes. *J Am Geriatr Soc*, 56(11):2124-2130. — Oral care and aspiration pneumonia prevention.

26. **Lyder CH & Ayello EA.** (2008). Pressure ulcers: a patient safety issue. Chapter 12 in Hughes RG (ed), *Patient Safety and Quality: An Evidence-Based Handbook for Nurses*. AHRQ.

---

**End of Specification**

*Document Version: 1.0 | Classification: Confidential — Internal Use Only*  
*Prepared by: Ibrahim M. Rizqui, M.D., CMD*  
*Apex Healthcare Advanced Medicine Division*
