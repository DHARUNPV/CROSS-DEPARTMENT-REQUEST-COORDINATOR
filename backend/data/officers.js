const officers = [
  // Water Supply Department
  { officerId: 'OFF101', name: 'Ravi Kumar', email: 'ravi@water.gov', password: '123456', department: 'Water Supply Department', contact: '9876543210', area: 'Anna Nagar' },
  { officerId: 'OFF102', name: 'Arun Raj', email: 'arun@water.gov', password: '123456', department: 'Water Supply Department', contact: '9876543211', area: 'T Nagar' },
  { officerId: 'OFF103', name: 'Meena Devi', email: 'meena@water.gov', password: '123456', department: 'Water Supply Department', contact: '9876543212', area: 'Adyar' },

  // Electricity Department
  { officerId: 'OFF201', name: 'Suresh Kumar', email: 'suresh@electricity.gov', password: '123456', department: 'Electricity Department', contact: '9876543220', area: 'Velachery' },
  { officerId: 'OFF202', name: 'Priya Raman', email: 'priya@electricity.gov', password: '123456', department: 'Electricity Department', contact: '9876543221', area: 'Guindy' },
  { officerId: 'OFF203', name: 'Karthik S', email: 'karthik@electricity.gov', password: '123456', department: 'Electricity Department', contact: '9876543222', area: 'Ashok Nagar' },

  // Municipality
  { officerId: 'OFF301', name: 'Lakshmi Iyer', email: 'lakshmi@municipality.gov', password: '123456', department: 'Municipality', contact: '9876543230', area: 'Mylapore' },
  { officerId: 'OFF302', name: 'Vijay Anand', email: 'vijay@municipality.gov', password: '123456', department: 'Municipality', contact: '9876543231', area: 'Nungambakkam' },
  { officerId: 'OFF303', name: 'Farah Khan', email: 'farah@municipality.gov', password: '123456', department: 'Municipality', contact: '9876543232', area: 'Royapettah' },

  // Revenue Department
  { officerId: 'OFF401', name: 'Senthil Nathan', email: 'senthil@revenue.gov', password: '123456', department: 'Revenue Department', contact: '9876543240', area: 'Tambaram' },
  { officerId: 'OFF402', name: 'Divya S', email: 'divya@revenue.gov', password: '123456', department: 'Revenue Department', contact: '9876543241', area: 'Porur' },
  { officerId: 'OFF403', name: 'Ganesh P', email: 'ganesh@revenue.gov', password: '123456', department: 'Revenue Department', contact: '9876543242', area: 'Pallavaram' },

  // Health Department
  { officerId: 'OFF501', name: 'Dr. Nisha', email: 'nisha@health.gov', password: '123456', department: 'Health Department', contact: '9876543250', area: 'Kodambakkam' },
  { officerId: 'OFF502', name: 'Dr. Manoj', email: 'manoj@health.gov', password: '123456', department: 'Health Department', contact: '9876543251', area: 'Triplicane' },
  { officerId: 'OFF503', name: 'Dr. Keerthi', email: 'keerthi@health.gov', password: '123456', department: 'Health Department', contact: '9876543252', area: 'Perambur' },
];

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

function getOfficerById(officerId) {
  const id = (officerId || '').trim();
  return officers.find((o) => o.officerId === id) || null;
}

function findOfficer({ officerId, email, password }) {
  const id = (officerId || '').trim();
  const e = normalize(email);
  const p = (password || '').toString();

  return (
    officers.find(
      (o) =>
        o.officerId === id &&
        normalize(o.email) === e &&
        o.password === p
    ) || null
  );
}

function listOfficersByDepartment(department) {
  return officers.filter((o) => o.department === department);
}

function getOfficerDepartments() {
  return [...new Set(officers.map((o) => o.department))];
}

module.exports = {
  officers,
  getOfficerById,
  findOfficer,
  listOfficersByDepartment,
  getOfficerDepartments,
};