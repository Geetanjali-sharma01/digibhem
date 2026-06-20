// Utility functions for MediBook

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Format appointment details for copying
 * @param {object} appointment - Appointment object
 * @returns {string} Formatted appointment details
 */
export function formatAppointmentDetails(appt) {
  const feeDisplay = appt.doctorFee !== undefined && appt.doctorFee !== null ? `₹${appt.doctorFee}` : 'N/A';
  const lines = [
    `Appointment Details`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Doctor: ${appt.doctorName}`,
    `Specialty: ${appt.doctorSpecialty}`,
    `Date: ${new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Time: ${appt.slot}`,
    `Status: ${appt.status.toUpperCase()}`,
    `Fee: ${feeDisplay}`,
    appt.reason ? `Reason: ${appt.reason}` : '',
    appt.doctorNote ? `Doctor's Note: ${appt.doctorNote}` : '',
    `━━━━━━━━━━━━━━━━━━━━`,
    `Booked on: ${new Date(appt.bookedAt).toLocaleString('en-IN')}`,
  ].filter(Boolean);
  
  return lines.join('\n');
}

/**
 * Generate ICS calendar file content
 * @param {object} appointment - Appointment object
 * @returns {string} ICS file content
 */
export function generateICS(appt) {
  const startDate = new Date(appt.date + 'T' + (appt.slot || '09:00:00'));
  const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 min appointment
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MediBook//EN',
    'BEGIN:VEVENT',
    `UID:medibook-${appt.id}@medibook.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:Appointment with ${appt.doctorName}`,
    `DESCRIPTION:Specialty: ${appt.doctorSpecialty}\\nReason: ${appt.reason || 'N/A'}`,
    `LOCATION:${appt.doctorHospital || 'TBD'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Download ICS file
 * @param {object} appointment - Appointment object
 */
export function downloadICS(appt) {
  const icsContent = generateICS(appt);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${appt.id}-${appt.date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF-like printable view
 * @param {object} appointment - Appointment object
 */
export function printAppointment(appt) {
  const feeDisplay = appt.doctorFee !== undefined && appt.doctorFee !== null ? `₹${appt.doctorFee}` : 'N/A';
  const printWindow = window.open('', '_blank');
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointment - ${appt.doctorName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        h1 { color: #00b4a6; border-bottom: 2px solid #00b4a6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        td:first-child { font-weight: bold; width: 40%; color: #666; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>🏥 MediBook Appointment</h1>
      <table>
        <tr><td>Doctor</td><td>${appt.doctorName}</td></tr>
        <tr><td>Specialty</td><td>${appt.doctorSpecialty}</td></tr>
        <tr><td>Date</td><td>${new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td>Time</td><td>${appt.slot}</td></tr>
        <tr><td>Status</td><td>${appt.status.toUpperCase()}</td></tr>
        <tr><td>Consultation Fee</td><td>${feeDisplay}</td></tr>
        ${appt.reason ? `<tr><td>Reason</td><td>${appt.reason}</td></tr>` : ''}
        ${appt.symptoms ? `<tr><td>Symptoms</td><td>${appt.symptoms}</td></tr>` : ''}
        ${appt.doctorNote ? `<tr><td>Doctor's Note</td><td>${appt.doctorNote}</td></tr>` : ''}
        <tr><td>Booked On</td><td>${new Date(appt.bookedAt).toLocaleString('en-IN')}</td></tr>
      </table>
      <div class="footer">
        <p>Generated by MediBook on ${new Date().toLocaleString('en-IN')}</p>
        <p>Appointment ID: ${appt.id}</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Format appointment details as PDF blob
 * @param {object} appointment - Appointment object
 * @returns {Blob} PDF-like HTML blob
 */
export function generatePDFBlob(appt) {
  const feeDisplay = appt.doctorFee !== undefined && appt.doctorFee !== null ? appt.doctorFee : 'N/A';
  const feeStyle = appt.doctorFee !== undefined && appt.doctorFee !== null ? 'font-size: 18px; font-weight: bold; color: #00b4a6;' : 'font-size: 18px; font-weight: bold; color: #999;';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment - ${appt.doctorName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
        h1 { color: #00b4a6; border-bottom: 3px solid #00b4a6; padding-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 25px 0; }
        td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        td:first-child { font-weight: bold; width: 35%; color: #666; background: #f9f9f9; }
        .header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
        .logo { width: 50px; height: 50px; background: #00b4a6; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.accepted { background: #d4edda; color: #155724; }
        .status.completed { background: #d1ecf1; color: #0c5460; }
        .status.cancelled { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🩺</div>
        <div>
          <h1 style="margin: 0; border: none;">MediBook</h1>
          <p style="margin: 5px 0 0; color: #666;">Appointment Confirmation</p>
        </div>
      </div>
      
      <table>
        <tr><td>Doctor Name</td><td>${appt.doctorName}</td></tr>
        <tr><td>Specialty</td><td>${appt.doctorSpecialty}</td></tr>
        <tr><td>Date</td><td>${new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td>Time Slot</td><td>${appt.slot}</td></tr>
        <tr><td>Status</td><td><span class="status ${appt.status}">${appt.status.toUpperCase()}</span></td></tr>
        <tr><td>Consultation Fee</td><td style="${feeStyle}">₹${feeDisplay}</td></tr>
        ${appt.reason ? `<tr><td>Reason for Visit</td><td>${appt.reason}</td></tr>` : ''}
        ${appt.symptoms ? `<tr><td>Symptoms</td><td>${appt.symptoms}</td></tr>` : ''}
        ${appt.doctorNote ? `<tr><td>Doctor's Note</td><td style="color: #00b4a6;">${appt.doctorNote}</td></tr>` : ''}
        <tr><td>Booking Date</td><td>${new Date(appt.bookedAt).toLocaleString('en-IN')}</td></tr>
        <tr><td>Appointment ID</td><td><code>${appt.id}</code></td></tr>
      </table>
      
      <div class="footer">
        <p><strong>MediBook - Smart Healthcare Booking</strong></p>
        <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
        <p>For any queries, contact support@medibook.com</p>
      </div>
    </body>
    </html>
  `;
  
  return new Blob([htmlContent], { type: 'text/html' });
}

/**
 * Download appointment as HTML file (PDF-like)
 * @param {object} appointment - Appointment object
 */
export function downloadAppointmentPDF(appt) {
  const blob = generatePDFBlob(appt);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${appt.id}-${appt.date}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculate days since a given date
 * @param {string} date - Date string
 * @returns {number} Number of days
 */
export function daysSince(date) {
  const then = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - then);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string} date - ISO date string
 * @returns {string} Relative time
 */
export function getRelativeTime(date) {
  const then = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString('en-IN');
}
