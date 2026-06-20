import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Fix encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

BASE_URL = 'http://localhost:5000'

def test_endpoint(method, path, data=None, headers=None):
    """Test an API endpoint"""
    url = f'{BASE_URL}{path}'
    if headers is None:
        headers = {}
    if data and method in ['POST', 'PATCH']:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = Request(url, data=data, headers=headers, method=method)
    
    try:
        with urlopen(req) as resp:
            print(f'[PASS] {method} {path} - Status: {resp.status}')
            return json.loads(resp.read().decode())
    except HTTPError as e:
        print(f'[FAIL] {method} {path} - Status: {e.code}')
        try:
            error_body = e.read().decode()
            print(f'  Error: {error_body}')
        except:
            pass
        return None

print('='*60)
print('MediBook API Debug Test')
print('='*60)

# Test 1: Get doctors
print('\n[Test 1] GET /api/doctors')
doctors = test_endpoint('GET', '/api/doctors')
if doctors:
    print(f'  Found {len(doctors)} doctors')
    if len(doctors) > 0:
        print(f'  First doctor: {doctors[0]["name"]} ({doctors[0]["specialty"]})')

# Test 2: Get patients
print('\n[Test 2] GET /api/patients')
patients = test_endpoint('GET', '/api/patients')
if patients:
    print(f'  Found {len(patients)} patients')

# Test 3: Get appointments
print('\n[Test 3] GET /api/appointments')
appointments = test_endpoint('GET', '/api/appointments')
if appointments:
    print(f'  Found {len(appointments)} appointments')

# Test 4: Admin login
print('\n[Test 4] POST /api/auth/login (admin)')
admin_login = test_endpoint('POST', '/api/auth/login', {
    'email': 'admin@medibook.com',
    'password': 'admin123'
})
admin_token = None
if admin_login:
    print(f'  User: {admin_login["user"]["name"]} ({admin_login["user"]["role"]})')
    admin_token = admin_login.get('token')

# Test 5: Doctor login
print('\n[Test 5] POST /api/auth/login (doctor)')
doctor_login = test_endpoint('POST', '/api/auth/login', {
    'email': 'sharma@medibook.com',
    'password': 'doctor123'
})
doctor_token = None
if doctor_login:
    print(f'  User: {doctor_login["user"]["name"]} ({doctor_login["user"]["role"]})')
    print(f'  Doctor ID: {doctor_login["user"].get("doctorId")}')
    doctor_token = doctor_login.get('token')

# Test 6: Register new patient
print('\n[Test 6] POST /api/auth/register (new patient)')
new_patient = test_endpoint('POST', '/api/auth/register', {
    'name': 'Test Patient',
    'email': 'testpatient@medibook.com',
    'password': 'patient123',
    'role': 'patient',
    'phone': '9876543210',
    'dob': '1990-01-01',
    'gender': 'Male'
})
patient_token = None
if new_patient:
    print(f'  User: {new_patient["user"]["name"]} ({new_patient["user"]["role"]})')
    print(f'  Patient ID: {new_patient["user"].get("patientId")}')
    patient_token = new_patient.get('token')

# Test 7: Book appointment
if patient_token and doctors:
    print('\n[Test 7] POST /api/appointments (book appointment)')
    headers = {'Authorization': f'Bearer {patient_token}'}
    appointment = test_endpoint('POST', '/api/appointments', {
        'doctor_code': doctors[0]['doctor_code'],
        'patient_id': new_patient['user']['id'],
        'appointment_date': '2026-06-25',
        'appointment_time': '09:00',
        'reason': 'General Checkup',
        'symptoms': 'None'
    }, headers)
    if appointment:
        print(f'  Appointment ID: {appointment["id"]}')
        print(f'  Status: {appointment["status"]}')

# Test 8: Get user profile
if patient_token:
    print('\n[Test 8] GET /api/auth/me (patient profile)')
    headers = {'Authorization': f'Bearer {patient_token}'}
    profile = test_endpoint('GET', '/api/auth/me', headers=headers)
    if profile:
        print(f'  Profile: {profile["user"]["name"]} ({profile["user"]["email"]})')

# Test 9: Update appointment status
if admin_token and appointments and len(appointments) > 0:
    print('\n[Test 9] PATCH /api/appointments/:id (update status)')
    headers = {'Authorization': f'Bearer {admin_token}'}
    appt_id = appointments[0]['id']
    updated = test_endpoint('PATCH', f'/api/appointments/{appt_id}', {
        'status': 'accepted'
    }, headers)
    if updated:
        print(f'  Appointment {appt_id} status: {updated["status"]}')

# Test 10: Get reviews
print('\n[Test 10] GET /api/reviews')
reviews = test_endpoint('GET', '/api/reviews')
if reviews:
    print(f'  Found {len(reviews)} reviews')

# Test 11: Get notifications
if patient_token:
    print('\n[Test 11] GET /api/notifications/:userId')
    notifications = test_endpoint('GET', f'/api/notifications/1')
    if notifications is not None:
        print(f'  Found {len(notifications)} notifications')

print('\n' + '='*60)
print('Debug test complete!')
print('='*60)
