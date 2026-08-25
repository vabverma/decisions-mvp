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
  {
    id: "derm",
    label: "Load dermatology sample",
    templateId: "generic",
    text: `Westside Family Medicine
482 Elm Street, Suite 200
Springfield, IL

August 20, 2026

Dr. Priya Anand
Springfield Dermatology Associates

Re: Referral for Daniel Ruiz, DOB 11/02/1978

Dear Dr. Anand,

I am referring Mr. Ruiz for urgent dermatologic evaluation of a changing pigmented lesion on his right upper back, first noticed by his wife approximately 6 weeks ago. He reports the lesion has become darker and slightly raised, with irregular borders. No bleeding or itching reported. He has no personal history of skin cancer; his father had a melanoma removed at age 62.

Relevant Findings:
On exam, the lesion measures approximately 9mm, asymmetric, with irregular, notched borders and variegated brown-black pigmentation. No palpable regional lymphadenopathy noted on exam today.

Past Medical History:
Type 2 diabetes, well controlled. Seasonal allergies.

Current Medications:
Metformin 500mg twice daily.

Allergies:
NKDA.

Given the ABCDE features noted on exam, I am requesting urgent dermoscopic evaluation and consideration of excisional biopsy to rule out melanoma. Please see within 1-2 weeks if possible.

Thank you for your prompt attention to this referral.

Sincerely,
Dr. Melissa Farrow, Family Medicine`,
  },
  {
    id: "neuro-messy",
    label: "Load neurology sample (messy EHR paste)",
    templateId: "generic",
    text: `PT: Harold Whitfield MRN 88213741 DOB 4/2/1955
REFERRAL TO: NEUROLOGY - c/o new onset tremor
referring prov: J Okafor MD int med

pt is a 71yo M who p/w progressive rt hand tremor x 8 mo, worse at rest, improves w/ voluntary movement per pt report. also c/o subtle gait changes per wife - shuffling, decreased arm swing on right. no falls. denies memory issues. handwriting has become smaller (wife noticed). no tremor w/ intention/action. pmhx htn, bph, gerd. meds: lisinopril 20mg qd, tamsulosin 0.4mg qhs, omeprazole 20mg qd. nkda.

exam limited in office but tremor noted at rest in rt hand, appears to improve somewhat with distraction. mild rigidity rt upper extremity on passive rom. gait slightly stooped, decreased rt arm swing.

labs from 6/2026 - tsh wnl, b12 wnl, cbc/cmp unremarkable

pls eval for parkinsons vs essential tremor vs other etiology. would appreciate relatively soon given progression - within next month if possible. pt worried, would like plan of care.

thx
J Okafor`,
  },
];
