// Enhanced doctor profiles with detailed background, achievements, and reviews

export const DOCTOR_PROFILES = {
  d1: {
    education: [
      { degree: 'MBBS', institution: 'AIIMS New Delhi', year: '2009' },
      { degree: 'MD (Cardiology)', institution: 'PGIMER Chandigarh', year: '2012' },
      { degree: 'DM (Interventional Cardiology)', institution: 'Fortis Heart Institute', year: '2015' }
    ],
    achievements: [
      'Performed 5000+ successful cardiac procedures',
      'Best Young Cardiologist Award 2018 - Indian Heart Association',
      'Published 25+ research papers in international journals',
      'Member of European Society of Cardiology'
    ],
    about: 'Dr. Priya Sharma is one of India\'s leading cardiologists with over 14 years of experience in interventional cardiology. She specializes in complex angioplasty, valve repairs, and preventive cardiology. Her patient-centric approach and expertise in minimally invasive techniques have earned her recognition nationwide.',
    specialties: ['Angioplasty', 'Heart Failure Management', 'Preventive Cardiology', 'Arrhythmia Treatment'],
    reviews: [
      { patient: 'Rajesh K.', rating: 5, date: '2024-01-15', comment: 'Excellent doctor! Very thorough and explains everything clearly. Saved my father\'s life with timely intervention.' },
      { patient: 'Meera S.', rating: 5, date: '2024-01-10', comment: 'Very compassionate and skilled. Made us feel comfortable throughout the treatment.' },
      { patient: 'Amit P.', rating: 4, date: '2023-12-28', comment: 'Great expertise. Wait time was a bit long but the consultation was worth it.' }
    ]
  },
  d2: {
    education: [
      { degree: 'MBBS', institution: 'KEM Hospital Mumbai', year: '2013' },
      { degree: 'MD (Medicine)', institution: 'JIPMER Puducherry', year: '2016' },
      { degree: 'DM (Neurology)', institution: 'NIMHANS Bangalore', year: '2019' }
    ],
    achievements: [
      'Specialized in stroke management and epilepsy treatment',
      'Research fellowship at Mayo Clinic, USA',
      '15+ publications in neuroscience journals',
      'Founder of Brain Health Awareness Initiative'
    ],
    about: 'Dr. Arjun Mehta is a highly skilled neurologist with expertise in treating complex neurological disorders. His areas of specialization include stroke, epilepsy, movement disorders, and headache management. He believes in a holistic approach to neurological care, combining latest medical advances with compassionate patient care.',
    specialties: ['Stroke Management', 'Epilepsy', 'Parkinson\'s Disease', 'Migraine Treatment'],
    reviews: [
      { patient: 'Sunita M.', rating: 5, date: '2024-01-12', comment: 'Very knowledgeable and patient. Took time to explain my condition thoroughly.' },
      { patient: 'Vikram R.', rating: 4, date: '2024-01-05', comment: 'Good doctor, helped manage my chronic migraines effectively.' }
    ]
  },
  d3: {
    education: [
      { degree: 'MBBS', institution: 'B.J. Medical College Pune', year: '2015' },
      { degree: 'DVD (Dermatology)', institution: 'Grant Medical College Mumbai', year: '2018' },
      { degree: 'DNB', institution: 'National Board of Examinations', year: '2019' }
    ],
    achievements: [
      'Advanced training in cosmetic dermatology from Korea',
      'Treated 10,000+ patients with skin conditions',
      'Expert in laser treatments and aesthetic procedures',
      'Active member of Indian Association of Dermatologists'
    ],
    about: 'Dr. Sneha Kulkarni is a renowned dermatologist combining medical and cosmetic dermatology expertise. She specializes in treating complex skin conditions, acne, hair loss, and anti-aging treatments. Her approach combines evidence-based medicine with the latest dermatological advances.',
    specialties: ['Acne Treatment', 'Hair Restoration', 'Laser Therapy', 'Cosmetic Dermatology'],
    reviews: [
      { patient: 'Priya T.', rating: 5, date: '2024-01-18', comment: 'Amazing results with my acne treatment! Very professional and caring.' },
      { patient: 'Neha G.', rating: 5, date: '2024-01-14', comment: 'Best dermatologist in Pune. Her skin care advice is spot on!' },
      { patient: 'Rahul D.', rating: 4, date: '2024-01-08', comment: 'Very good experience. Staff is friendly and clinic is well-maintained.' }
    ]
  },
  d4: {
    education: [
      { degree: 'MBBS', institution: 'Sri Ramachandra Medical College', year: '2011' },
      { degree: 'MS (Orthopedics)', institution: 'KEM Hospital Mumbai', year: '2015' },
      { degree: 'Fellowship in Joint Replacement', institution: 'Singapore General Hospital', year: '2017' }
    ],
    achievements: [
      'Performed 3000+ joint replacement surgeries',
      'Sports medicine specialist for Maharashtra State Team',
      'Pioneer in minimally invasive spine surgery',
      'Organizer of free bone health camps in rural areas'
    ],
    about: 'Dr. Rohit Patil is an experienced orthopedic surgeon specializing in joint replacements, sports injuries, and spine surgery. His expertise in arthroscopic and minimally invasive techniques ensures faster recovery for patients. He is passionate about helping athletes and active individuals return to their optimal performance.',
    specialties: ['Joint Replacement', 'Sports Injuries', 'Spine Surgery', 'Fracture Management'],
    reviews: [
      { patient: 'Sanjay P.', rating: 5, date: '2024-01-16', comment: 'Excellent surgeon! My knee replacement surgery was successful and recovery was quick.' },
      { patient: 'Anita K.', rating: 4, date: '2024-01-09', comment: 'Very skilled doctor. Explained the procedure well and outcomes were great.' }
    ]
  },
  d5: {
    education: [
      { degree: 'MBBS', institution: 'Grant Medical College Mumbai', year: '2007' },
      { degree: 'MD (Pediatrics)', institution: 'AIIMS New Delhi', year: '2010' },
      { degree: 'Fellowship in Neonatology', institution: 'Boston Children\'s Hospital', year: '2013' }
    ],
    achievements: [
      '16 years of dedicated pediatric care',
      'Neonatal ICU specialist with 5000+ premature babies treated',
      'Child nutrition and development expert',
      'Recipient of Best Pediatrician Award 2020'
    ],
    about: 'Dr. Anita Desai is a beloved pediatrician with a gentle touch that puts children at ease. She specializes in newborn care, childhood illnesses, vaccination, and developmental disorders. Her holistic approach to child healthcare focuses on preventive care and parental education.',
    specialties: ['Newborn Care', 'Child Vaccination', 'Developmental Disorders', 'Child Nutrition'],
    reviews: [
      { patient: 'Kavita S.', rating: 5, date: '2024-01-17', comment: 'Wonderful doctor! My kids love her. She\'s very patient and thorough.' },
      { patient: 'Ravi M.', rating: 5, date: '2024-01-11', comment: 'Best pediatrician. Always available for emergencies and gives excellent advice.' },
      { patient: 'Pooja L.', rating: 5, date: '2024-01-06', comment: 'Very caring and knowledgeable. Helped my child overcome feeding issues.' }
    ]
  },
  d6: {
    education: [
      { degree: 'MBBS', institution: 'Seth GS Medical College', year: '2014' },
      { degree: 'MD (General Medicine)', institution: 'Topiwala National Medical College', year: '2017' }
    ],
    achievements: [
      'Comprehensive primary care provider',
      'Diabetes and hypertension management specialist',
      'Health screening program coordinator',
      'Member of Association of Physicians of India'
    ],
    about: 'Dr. Vikram Joshi is a trusted general physician providing comprehensive healthcare for adults. He focuses on preventive care, chronic disease management, and early diagnosis. His patient-first approach and thorough consultations have made him a preferred family doctor for many households.',
    specialties: ['Diabetes Management', 'Hypertension', 'Fever & Infections', 'Health Checkups'],
    reviews: [
      { patient: 'Manoj D.', rating: 5, date: '2024-01-13', comment: 'Very thorough doctor. Takes time to listen and explains everything well.' },
      { patient: 'Shilpa R.', rating: 4, date: '2024-01-07', comment: 'Good consultation. Helped manage my blood sugar levels effectively.' }
    ]
  },
  d7: {
    education: [
      { degree: 'MBBS', institution: 'Calicut Medical College', year: '2016' },
      { degree: 'MS (ENT)', institution: 'Madras Medical College', year: '2019' },
      { degree: 'Fellowship in Cochlear Implants', institution: 'Christian Medical College Vellore', year: '2021' }
    ],
    achievements: [
      'Performed 1000+ ENT surgeries',
      'Cochlear implant specialist',
      'Sleep apnea and snoring treatment expert',
      'Conducted free hearing camps for children'
    ],
    about: 'Dr. Kavya Nair is a skilled ENT surgeon with expertise in treating ear, nose, and throat disorders. She specializes in hearing restoration, sinus surgery, and voice disorders. Her compassionate care and surgical precision have helped thousands of patients regain their quality of life.',
    specialties: ['Hearing Loss', 'Sinus Surgery', 'Tonsillitis', 'Sleep Apnea'],
    reviews: [
      { patient: 'Deepak N.', rating: 5, date: '2024-01-15', comment: 'Excellent ENT specialist. My sinus surgery was successful and pain-free.' },
      { patient: 'Anjali P.', rating: 4, date: '2024-01-10', comment: 'Very good doctor. Helped my child with recurrent ear infections.' }
    ]
  },
  d8: {
    education: [
      { degree: 'MBBS', institution: 'Osmania Medical College', year: '2012' },
      { degree: 'MS (Ophthalmology)', institution: 'LVP Eye Institute', year: '2015' },
      { degree: 'Fellowship in Retina', institution: 'Sankara Nethralaya', year: '2017' }
    ],
    achievements: [
      'Performed 8000+ cataract surgeries',
      'Retinal disease and diabetic eye care specialist',
      'LASIK and refractive surgery expert',
      'Conducted 100+ free eye camps in rural areas'
    ],
    about: 'Dr. Suresh Reddy is a renowned ophthalmologist specializing in cataract surgery, retinal diseases, and refractive surgery. His microsurgical skills and use of latest technology ensure optimal visual outcomes. He is committed to preventing blindness through early detection and treatment.',
    specialties: ['Cataract Surgery', 'LASIK', 'Diabetic Retinopathy', 'Glaucoma'],
    reviews: [
      { patient: 'Ramesh K.', rating: 5, date: '2024-01-16', comment: 'Excellent surgeon! My cataract surgery was quick and vision is perfect now.' },
      { patient: 'Lakshmi T.', rating: 5, date: '2024-01-12', comment: 'Very professional and caring. Best eye doctor in the city.' }
    ]
  },
  d9: {
    education: [
      { degree: 'MBBS', institution: 'Lady Hardinge Medical College', year: '2017' },
      { degree: 'MD (Psychiatry)', institution: 'NIMHANS Bangalore', year: '2020' }
    ],
    achievements: [
      'Mental health advocate and counselor',
      'Specialized in depression, anxiety, and PTSD treatment',
      'Conducted workplace mental wellness programs',
      'Published research on adolescent mental health'
    ],
    about: 'Dr. Neha Gupta is a compassionate psychiatrist dedicated to mental health and emotional well-being. She provides evidence-based treatment for depression, anxiety, bipolar disorder, and stress-related conditions. Her therapeutic approach combines medication management with counseling for holistic healing.',
    specialties: ['Depression', 'Anxiety Disorders', 'Bipolar Disorder', 'Stress Management'],
    reviews: [
      { patient: 'Anonymous', rating: 5, date: '2024-01-14', comment: 'Very understanding and non-judgmental. Helped me through my darkest times.' },
      { patient: 'Karan M.', rating: 5, date: '2024-01-08', comment: 'Excellent psychiatrist. Her counseling sessions changed my life.' }
    ]
  },
  d10: {
    education: [
      { degree: 'MBBS', institution: 'Madras Medical College', year: '2010' },
      { degree: 'MD (Medicine)', institution: 'CMC Vellore', year: '2013' },
      { degree: 'DM (Gastroenterology)', institution: 'SGPGI Lucknow', year: '2016' }
    ],
    achievements: [
      'Performed 5000+ endoscopic procedures',
      'Liver disease and IBD specialist',
      'Advanced therapeutic endoscopy expert',
      'Member of Indian Society of Gastroenterology'
    ],
    about: 'Dr. Rajan Iyer is a leading gastroenterologist with extensive experience in digestive diseases and liver disorders. He specializes in advanced endoscopic procedures, inflammatory bowel disease, and hepatology. His comprehensive approach ensures accurate diagnosis and effective treatment.',
    specialties: ['Liver Diseases', 'Endoscopy', 'IBD', 'Acid Reflux'],
    reviews: [
      { patient: 'Suresh B.', rating: 5, date: '2024-01-17', comment: 'Very experienced doctor. My endoscopy was smooth and diagnosis was accurate.' },
      { patient: 'Meena J.', rating: 4, date: '2024-01-11', comment: 'Good specialist. Helped manage my chronic acidity problem.' }
    ]
  },
  d11: {
    education: [
      { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: '2013' },
      { degree: 'MD (Medicine)', institution: 'Safdarjung Hospital', year: '2016' },
      { degree: 'DM (Endocrinology)', institution: 'AIIMS New Delhi', year: '2019' }
    ],
    achievements: [
      'Diabetes and thyroid disorder specialist',
      'PCOS and hormonal imbalance expert',
      'Conducted 50+ diabetes awareness camps',
      'Active researcher in metabolic disorders'
    ],
    about: 'Dr. Pooja Malhotra is a trusted endocrinologist specializing in diabetes, thyroid disorders, and hormonal imbalances. She provides personalized treatment plans for complex endocrine conditions. Her patient education focus empowers individuals to manage their health effectively.',
    specialties: ['Diabetes', 'Thyroid Disorders', 'PCOS', 'Hormonal Imbalances'],
    reviews: [
      { patient: 'Ritu S.', rating: 5, date: '2024-01-15', comment: 'Excellent doctor for diabetes management. My sugar levels are under control now.' },
      { patient: 'Amit K.', rating: 4, date: '2024-01-09', comment: 'Very knowledgeable. Helped with my thyroid issues.' }
    ]
  },
  d12: {
    education: [
      { degree: 'MBBS', institution: 'Medical College Kolkata', year: '2008' },
      { degree: 'MD (Pulmonary Medicine)', institution: 'PGI Chandigarh', year: '2012' },
      { degree: 'Fellowship in Critical Care', institution: 'Apollo Hospital', year: '2014' }
    ],
    achievements: [
      'Respiratory and critical care specialist',
      'Asthma and COPD management expert',
      'Sleep disorder and bronchoscopy specialist',
      'Led COVID-19 ICU team during pandemic'
    ],
    about: 'Dr. Arnab Bose is a seasoned pulmonologist with expertise in respiratory diseases and critical care. He specializes in asthma, COPD, sleep apnea, and interstitial lung diseases. His comprehensive pulmonary function testing and treatment protocols ensure optimal respiratory health.',
    specialties: ['Asthma', 'COPD', 'Sleep Apnea', 'Lung Infections'],
    reviews: [
      { patient: 'Subrata G.', rating: 5, date: '2024-01-18', comment: 'Outstanding pulmonologist. My asthma is much better under his care.' },
      { patient: 'Dipali R.', rating: 5, date: '2024-01-13', comment: 'Very thorough and caring. Best lung specialist in the region.' }
    ]
  },
  d13: {
    education: [
      { degree: 'MBBS', institution: 'Lady Hardinge Medical College', year: '2015' },
      { degree: 'MD (Medicine)', institution: 'RML Hospital Delhi', year: '2018' },
      { degree: 'DM (Rheumatology)', institution: 'SGPGI Lucknow', year: '2021' }
    ],
    achievements: [
      'Autoimmune and joint disease specialist',
      'Arthritis and lupus treatment expert',
      'Conducted rheumatology awareness programs',
      'Member of Indian Rheumatology Association'
    ],
    about: 'Dr. Simran Kapoor is a dedicated rheumatologist specializing in autoimmune diseases, arthritis, and musculoskeletal disorders. She provides comprehensive care for rheumatoid arthritis, lupus, osteoporosis, and fibromyalgia. Her empathetic approach and latest treatment protocols improve patients\' quality of life.',
    specialties: ['Rheumatoid Arthritis', 'Lupus', 'Osteoporosis', 'Joint Pain'],
    reviews: [
      { patient: 'Harpreet K.', rating: 5, date: '2024-01-16', comment: 'Very caring doctor. My joint pain has reduced significantly with her treatment.' },
      { patient: 'Manisha D.', rating: 4, date: '2024-01-10', comment: 'Good rheumatologist. Explains the condition and treatment well.' }
    ]
  },
  d14: {
    education: [
      { degree: 'MBBS', institution: 'Stanley Medical College', year: '2011' },
      { degree: 'MS (General Surgery)', institution: 'Madras Medical College', year: '2015' },
      { degree: 'MCh (Urology)', institution: 'CMC Vellore', year: '2018' }
    ],
    achievements: [
      'Performed 4000+ urological surgeries',
      'Kidney transplant and stone management expert',
      'Pioneer in minimally invasive urology',
      'Member of Urological Society of India'
    ],
    about: 'Dr. Karthik Sundaram is a distinguished urologist with expertise in kidney transplants, stone management, and urological oncology. His minimally invasive surgical techniques ensure faster recovery and better outcomes. He is committed to providing comprehensive urological care.',
    specialties: ['Kidney Stones', 'Prostate Surgery', 'Urological Oncology', 'Kidney Transplant'],
    reviews: [
      { patient: 'Venkat R.', rating: 5, date: '2024-01-17', comment: 'Excellent surgeon! My kidney stone removal was smooth and painless.' },
      { patient: 'Lakshmi N.', rating: 5, date: '2024-01-11', comment: 'Very professional and skilled. Best urologist in Chennai.' }
    ]
  },
  d15: {
    education: [
      { degree: 'MBBS', institution: 'Bangalore Medical College', year: '2014' },
      { degree: 'MD (Obstetrics & Gynecology)', institution: 'St. Johns Medical College', year: '2017' },
      { degree: 'Fellowship in Reproductive Medicine', institution: 'Nova IVF Fertility', year: '2020' }
    ],
    achievements: [
      'IVF and infertility specialist',
      'High-risk pregnancy management expert',
      'Delivered 5000+ babies successfully',
      'Member of Federation of Obstetric and Gynaecological Societies'
    ],
    about: 'Dr. Deepa Rao is a leading gynecologist and fertility specialist providing comprehensive women\'s healthcare. Her expertise includes IVF, high-risk pregnancies, minimally invasive gynecological surgery, and adolescent health. Her compassionate care has helped thousands of women.',
    specialties: ['IVF & Fertility', 'High-Risk Pregnancy', 'Gynecological Surgery', 'Menstrual Disorders'],
    reviews: [
      { patient: 'Anjali M.', rating: 5, date: '2024-01-18', comment: 'Wonderful doctor! Helped us conceive after years of trying. Forever grateful!' },
      { patient: 'Priya K.', rating: 5, date: '2024-01-12', comment: 'Very caring and supportive throughout my pregnancy. Highly recommended!' }
    ]
  },
  d16: {
    education: [
      { degree: 'MBBS', institution: 'King George Medical University', year: '2010' },
      { degree: 'MD (Dermatology)', institution: 'SGPGI Lucknow', year: '2014' },
      { degree: 'DNB (Plastic Surgery)', institution: 'Apollo Hospital', year: '2017' }
    ],
    achievements: [
      'Reconstructive and cosmetic surgery expert',
      'Performed 3000+ plastic surgeries',
      'Burn reconstruction and trauma specialist',
      'Member of Association of Plastic Surgeons of India'
    ],
    about: 'Dr. Aditya Verma is a renowned plastic surgeon specializing in reconstructive and cosmetic procedures. His expertise includes breast augmentation, rhinoplasty, liposuction, and reconstructive surgery after trauma or cancer. His artistic eye and surgical precision deliver natural-looking results.',
    specialties: ['Cosmetic Surgery', 'Breast Augmentation', 'Rhinoplasty', 'Reconstructive Surgery'],
    reviews: [
      { patient: 'Neha S.', rating: 5, date: '2024-01-16', comment: 'Amazing results! Very professional and made me feel comfortable throughout.' },
      { patient: 'Rahul T.', rating: 5, date: '2024-01-09', comment: 'Excellent reconstructive surgery after my accident. Life-changing experience!' }
    ]
  },
  d17: {
    education: [
      { degree: 'MBBS', institution: 'Grant Medical College Mumbai', year: '2013' },
      { degree: 'MD (Radiology)', institution: 'Tata Memorial Hospital', year: '2016' },
      { degree: 'Fellowship in Interventional Radiology', institution: 'AIIMS New Delhi', year: '2019' }
    ],
    achievements: [
      'Image-guided procedures specialist',
      'Interventional oncology expert',
      'Performed 10,000+ radiological procedures',
      'Member of Radiological Society of India'
    ],
    about: 'Dr. Meera Singh is a skilled radiologist specializing in diagnostic imaging and interventional procedures. Her expertise includes MRI, CT scans, ultrasound-guided biopsies, and minimally invasive cancer treatments. Her accurate diagnoses and advanced techniques ensure optimal patient care.',
    specialties: ['MRI & CT Scan', 'Ultrasound', 'Interventional Radiology', 'Cancer Imaging'],
    reviews: [
      { patient: 'Sanjay P.', rating: 5, date: '2024-01-15', comment: 'Very thorough and accurate diagnosis. Explained everything clearly.' },
      { patient: 'Kavita R.', rating: 5, date: '2024-01-08', comment: 'Excellent radiologist. Her biopsy procedure was quick and painless.' }
    ]
  },
  d18: {
    education: [
      { degree: 'MBBS', institution: 'Christian Medical College Vellore', year: '2009' },
      { degree: 'MD (Anesthesiology)', institution: 'PGIMER Chandigarh', year: '2013' },
      { degree: 'Fellowship in Pain Management', institution: 'Mayo Clinic, USA', year: '2016' }
    ],
    achievements: [
      'Pain management and palliative care specialist',
      'Chronic pain and cancer pain expert',
      'Developed innovative pain relief protocols',
      'Member of Indian Society of Anaesthesiologists'
    ],
    about: 'Dr. Rajesh Khanna is a leading pain management specialist providing relief for chronic pain conditions. His expertise includes nerve blocks, epidural injections, cancer pain management, and palliative care. His holistic approach combines medical and interventional treatments for optimal outcomes.',
    specialties: ['Chronic Pain', 'Cancer Pain', 'Nerve Blocks', 'Palliative Care'],
    reviews: [
      { patient: 'Amit K.', rating: 5, date: '2024-01-17', comment: 'Finally found relief from chronic back pain. Life-changing treatment!' },
      { patient: 'Sunita M.', rating: 5, date: '2024-01-10', comment: 'Very compassionate doctor. Helped manage my mother\'s cancer pain effectively.' }
    ]
  },
  d19: {
    education: [
      { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: '2012' },
      { degree: 'MD (Pediatrics)', institution: 'AIIMS New Delhi', year: '2015' },
      { degree: 'DM (Pediatric Neurology)', institution: 'NIMHANS Bangalore', year: '2018' }
    ],
    achievements: [
      'Pediatric neurology specialist',
      'Childhood epilepsy and seizure disorders expert',
      'Developmental delay assessment expert',
      'Member of Indian Academy of Pediatrics'
    ],
    about: 'Dr. Anjali Mehta is a dedicated pediatric neurologist specializing in childhood neurological disorders. Her expertise includes epilepsy, ADHD, autism spectrum disorders, and developmental delays. Her gentle approach and family-centered care ensure the best outcomes for children.',
    specialties: ['Childhood Epilepsy', 'ADHD', 'Autism', 'Developmental Delays'],
    reviews: [
      { patient: 'Priya S.', rating: 5, date: '2024-01-18', comment: 'Excellent with kids! My son\'s seizures are well-controlled under her care.' },
      { patient: 'Ravi M.', rating: 5, date: '2024-01-11', comment: 'Very patient and understanding. Helped us navigate our daughter\'s autism diagnosis.' }
    ]
  },
  d20: {
    education: [
      { degree: 'MBBS', institution: 'Seth GS Medical College', year: '2011' },
      { degree: 'MS (ENT)', institution: 'KEM Hospital Mumbai', year: '2015' },
      { degree: 'Fellowship in Head & Neck Surgery', institution: 'Tata Memorial Hospital', year: '2018' }
    ],
    achievements: [
      'Head and neck surgical oncology expert',
      'Thyroid and parotid surgery specialist',
      'Performed 2000+ head & neck surgeries',
      'Member of Head and Neck Surgeons Society'
    ],
    about: 'Dr. Vikram Shah is a distinguished ENT and head & neck surgeon specializing in cancer surgery and complex procedures. His expertise includes thyroid surgery, parotid tumors, laryngeal cancer, and reconstructive surgery. His surgical skills and compassionate care have transformed thousands of lives.',
    specialties: ['Head & Neck Cancer', 'Thyroid Surgery', 'Voice Disorders', 'Skull Base Surgery'],
    reviews: [
      { patient: 'Deepak N.', rating: 5, date: '2024-01-16', comment: 'Excellent surgeon! My thyroid surgery was successful with minimal scarring.' },
      { patient: 'Meera K.', rating: 5, date: '2024-01-09', comment: 'Very skilled and caring. Best head & neck surgeon in Mumbai.' }
    ]
  }
};
