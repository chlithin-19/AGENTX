/**
 * Atlas Demo Campus Infrastructure & Maintenance Data Layer
 * 
 * CLASSIFICATION: DEMO / DEVELOPMENT DATA
 * Note: Clearly marked demo data for Atlas Campus Agent MVP.
 */

export const DEMO_BUILDINGS = [
  { id: 'bld_acad_a', name: 'Academic Block A', code: 'ABA', floors: 4, departments: ['CSE', 'IT'] },
  { id: 'bld_acad_b', name: 'Academic Block B', code: 'ABB', floors: 4, departments: ['ECE', 'EEE', 'Mechanical', 'Civil'] },
  { id: 'bld_library', name: 'Central Library Building', code: 'CLB', floors: 3, description: 'Main institutional library, digital reading rooms, and quiet research cubicles.' },
  { id: 'bld_student_center', name: 'Student Activity Center', code: 'SAC', floors: 2, description: 'Auditorium, indoor sports facility, and cafeteria.' },
  { id: 'bld_science', name: 'Science & Advanced Research Block', code: 'SAR', floors: 3, description: 'Chemistry labs, Physics labs, and High-Performance Computing cluster.' }
]

export const DEMO_ROOMS = [
  { id: 'room_lab_204', name: 'Lab 204', buildingId: 'bld_acad_a', buildingName: 'Academic Block A', floor: 2, type: 'Computer Laboratory', capacity: 60, status: 'Active', equipment: ['60 Dell Desktops', 'Ceiling HD Projector', 'Gigabit Ethernet', 'Dual Whiteboards'] },
  { id: 'room_101', name: 'Classroom 101', buildingId: 'bld_acad_a', buildingName: 'Academic Block A', floor: 1, type: 'Lecture Hall', capacity: 80, status: 'Active', equipment: ['Smart Podium', 'Projector', 'PA System'] },
  { id: 'room_sem_1', name: 'Seminar Hall 1', buildingId: 'bld_student_center', buildingName: 'Student Activity Center', floor: 1, type: 'Auditorium', capacity: 250, status: 'Active', equipment: ['Stage Lighting', 'Surround Sound', 'Dual 4K Displays'] },
  { id: 'room_lib_reading', name: 'Main Reading Room', buildingId: 'bld_library', buildingName: 'Central Library Building', floor: 1, type: 'Library Study Area', capacity: 200, status: 'Active', equipment: ['Wi-Fi 6', 'Power Outlets at all desks', 'Digital OPAC Kiosks'] }
]

export const DEMO_FACILITIES = [
  {
    id: 'fac_library',
    name: 'Central Library',
    location: 'Central Library Building (Ground & 1st Floor)',
    timings: 'Monday - Saturday: 8:00 AM - 10:00 PM; Sunday: 10:00 AM - 5:00 PM',
    services: ['Book Borrowing (Up to 4 books for 14 days)', 'IEEE / ACM Digital Library Access', 'Quiet Study Zone', 'Photocopying & Printing']
  },
  {
    id: 'fac_sports',
    name: 'Sports & Fitness Center',
    location: 'Student Activity Center (SAC)',
    timings: 'Daily: 6:00 AM - 9:00 AM & 4:30 PM - 8:30 PM',
    services: ['Gymnasium', 'Badminton Courts', 'Table Tennis Arena', 'Outdoor Football & Cricket Ground']
  },
  {
    id: 'fac_cafeteria',
    name: 'Campus Food Court & Cafeteria',
    location: 'Ground Floor, Student Activity Center',
    timings: 'Daily: 7:30 AM - 9:30 PM',
    services: ['Multi-cuisine meals', 'Healthy Juice Bar', 'Snacks & Beverages', 'Digital Payment Available']
  },
  {
    id: 'fac_health',
    name: 'Campus Health Center',
    location: 'Ground Floor, Science Block',
    timings: '24/7 Emergency Care; Regular Outpatient: 9:00 AM - 5:00 PM',
    services: ['First Aid & Emergency Triage', 'Resident Medical Officer', 'Basic Pharmacy', 'Ambulance Service on Call']
  }
]

export const DEMO_CAMPUS_SERVICES = [
  { name: 'IT Helpdesk & Wi-Fi Support', contact: 'it-support@campus.edu', location: 'Academic Block A, Room 102', hours: '9:00 AM - 5:00 PM' },
  { name: 'Campus Transport & Shuttle Bus', contact: 'transport@campus.edu', location: 'Security Gate 1', hours: '6:30 AM - 9:00 PM' },
  { name: 'Student Academic Section', contact: 'academics@campus.edu', location: 'Administrative Block, Ground Floor', hours: '10:00 AM - 4:00 PM' },
  { name: 'Hostel & Residential Office', contact: 'hostel-warden@campus.edu', location: 'Boys & Girls Hostel Blocks', hours: '9:00 AM - 7:00 PM' }
]

// In-memory maintenance tickets store for demo ticket creation and tracking
export const DEMO_MAINTENANCE_TICKETS = [
  {
    id: 'MR-2026-00101',
    location: 'Lab 204',
    category: 'Projector',
    description: 'Ceiling projector lamp flicker and HDMI input error',
    priority: 'Medium',
    status: 'In Progress',
    reportedAt: '2026-10-02T09:30:00.000Z',
    assignedTo: 'Audio-Visual Tech Team'
  }
]

export function createDemoMaintenanceTicket({ location, issue, priority = 'Medium', reportedBy = 'Alex Kumar' }) {
  const ticketId = `MR-2026-${String(DEMO_MAINTENANCE_TICKETS.length + 102).padStart(5, '0')}`
  const ticket = {
    id: ticketId,
    location: location || 'Campus Classroom',
    category: issue && issue.toLowerCase().includes('projector') ? 'Projector' : 'General Maintenance',
    description: issue || 'Reported maintenance issue',
    priority,
    status: 'Submitted',
    reportedBy,
    reportedAt: new Date().toISOString(),
    assignedTo: 'Campus Facilities Support'
  }
  DEMO_MAINTENANCE_TICKETS.unshift(ticket)
  return ticket
}
