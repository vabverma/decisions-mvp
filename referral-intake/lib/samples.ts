import type { TemplateId } from "@/lib/templates";

export interface Sample {
  id: string;
  label: string;
  templateId: TemplateId;
  text: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "cardio",
    label: "Load cardiology sample",
    templateId: "generic",
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
    templateId: "generic",
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
  {
    id: "gynonc",
    label: "Load gynecologic oncology sample",
    templateId: "gyn-onc",
    text: `Referring Physician: Dr. Bradley Goldberg
Date: 07/30/2026

Reason for Referral:
64-year-old female with a pelvic mass identified on CT scan. Referring for evaluation and management.

History of Present Illness:
Patient reports generalized abdominal pain, abdominal bloating, and early satiety, with associated reflux symptoms. She first noticed these symptoms approximately 4 to 5 months ago but had difficulty being seen sooner due to insurance issues. She was worked up by her PCP, who ordered a CT scan, prompting this referral. She denies postmenopausal bleeding.

Past Medical History:
Menopause. Hypertension.

Surgical History:
Two prior C-sections. Prior hysterectomy for abnormal uterine bleeding (AUB), both via lower midline incisions. She reports significant difficulty with gas pains after that surgery.

Social History:
Current smoker.

Imaging/Labs:
7/8/2026: Transvaginal ultrasound - uterus measured 11.0 cm.
7/21/2026: CT Abdomen/Pelvis with contrast - 30x19x11 cm complex midline pelvic cyst with multiple internal thin enhancing septations, no definite mural nodularity. Additional midline cysts, favor right ovarian origin.
7/29/2026: CA 125: 16. CEA: 4.0.

Assessment/Diagnosis:
Pelvic mass, R19.00. Cyst of ovary, unspecified laterality, N83.209.

Plan:
Referring for gynecologic oncology evaluation and management.`,
  },
];
