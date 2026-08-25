export interface Sample {
  id: string;
  label: string;
  text: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "cardio",
    label: "Load cardiology sample",
    text: `Dear Dr. Reyes,

I am referring my patient, Margaret Coyle (DOB 03/14/1962), for cardiology evaluation.

Reason for Referral:
New onset palpitations and two episodes of near-syncope over the past three weeks. Requesting evaluation for possible arrhythmia. Please see within 1-2 weeks given symptom frequency; should not be delayed.

History of Present Illness:
Patient reports intermittent palpitations lasting 30-60 seconds, occurring 3-4x/week, sometimes associated with lightheadedness. Denies chest pain. One episode occurred while climbing stairs, associated with brief near-syncope, no loss of consciousness. No prior cardiac workup.

Past Medical History:
Hypertension (dx 2015), hyperlipidemia, hypothyroidism.

Current Medications:
Lisinopril 10mg daily, Atorvastatin 20mg daily, Levothyroxine 75mcg daily.

Allergies:
Penicillin (rash).

Laboratory:
TSH 2.1 (WNL), BMP unremarkable, CBC unremarkable. No troponin obtained (outpatient, non-emergent presentation).

Assessment/Diagnosis:
Palpitations, R00.2, likely supraventricular in origin; rule out paroxysmal AFib vs SVT.

Thank you for seeing this patient.
Sincerely,
Dr. A. Patel, Internal Medicine`,
  },
  {
    id: "ortho",
    label: "Load orthopedics sample",
    text: `Referring Physician: Dr. K. Nomura, Family Medicine
Date: 08/18/2026

Reason for Referral:
Right knee pain x 6 weeks following a twisting injury during recreational soccer. Suspect meniscal tear. Requesting orthopedic evaluation, routine priority.

History of Present Illness:
Patient is a 34-year-old male who twisted his right knee during a soccer match on 07/05/2026. Immediate swelling and difficulty bearing weight. Symptoms improved with rest and ice but patient continues to have medial joint line pain, occasional locking, and instability with pivoting.

Past Medical History:
Non-contributory. No prior knee injuries.

Current Medications:
Ibuprofen 600mg PRN for pain.

Allergies:
NKDA.

Assessment/Diagnosis:
Suspected medial meniscus tear, right knee, S83.241A.

Plan:
Referring for orthopedic evaluation and consideration of MRI if not already obtained.`,
  },
];
