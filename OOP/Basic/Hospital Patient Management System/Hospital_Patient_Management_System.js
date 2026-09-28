class HospitalError extends Error {
  constructor(message) {
    super(message);
    this.name = "HospitalError";
  }
}

class Patient {
  #id;
  #name;
  #days;
  #medicalRecords = [];
  #active = true;
  static #totalPatients = 0;

  constructor(name, days) {
    if (new.target === Patient) {
      throw new HospitalError("Patient is abstract, cannot be instantiated");
    }

    this.#validateName(name);

    this.#name = name;
    this.#days = days;
    this.#id = this.#generateID();

    Patient.#totalPatients++;
  }

  #generateID() {
    let id;

    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (Patient.#idExists(id));

    return id;
  }

  static #idExists(id) {
    return Hospital.getAllPatients().some(
      (patient) => patient.getId() === id
    );
  }

  #validateName(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new HospitalError("Name cannot be empty");
    }

    if (/\d/.test(name)) {
      throw new HospitalError("Name cannot contain any digits");
    }
  }

  getId() {
    return this.#id;
  }

  getName() {
    return this.#name;
  }

  getDays() {
    return this.#days;
  }

  get isActive() {
    return this.#active;
  }

  getSummary() {
    if (!this.#active) {
      return `[${this.#id}] ${this.#name} - Discharged`;
    }

    return `[${this.#id}] ${this.#name} - Stayed: (${this.#days})`;
  }

  addMedicalRecord(entry) {
    if (!this.#active) {
      throw new HospitalError(
        `Patient [${this.#id}] has been discharged, cannot add record`
      );
    }

    this.#medicalRecords.push(entry);

    return this;
  }

  getMedicalRecords() {
    return [...this.#medicalRecords];
  }

  getTotalCost() {
    throw new HospitalError(
      "getTotalCost() must be implemented by subclass"
    );
  }

  discharge() {
    if (!this.#active) {
      throw new HospitalError(
        `Patient [${this.#id}] is already discharged`
      );
    }

    this.#active = false;

    return this;
  }

  static getTotalPatients() {
    return Patient.#totalPatients;
  }

  static create(type, name, days) {
    if (type === "general") {
      return new GeneralPatient(name, days);
    }

    if (type === "emergency") {
      return new EmergencyPatient(name, days);
    }

    throw new HospitalError(`Invalid patient type: ${type}`);
  }
}

class GeneralPatient extends Patient {
  #dailyRate;

  constructor(name, days, dailyRate = 100) {
    super(name, days);
    this.#dailyRate = dailyRate;
  }

  getTotalCost() {
    return this.getDays() * this.#dailyRate;
  }
}

class EmergencyPatient extends Patient {
  #dailyRate;

  constructor(name, days, dailyRate = 100) {
    super(name, days);
    this.#dailyRate = dailyRate;
  }

  getTotalCost() {
    const baseCost = this.getDays() * this.#dailyRate;

    return baseCost * 1.3;
  }
}

class Ward {
  #name;
  #patients = [];

  constructor(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new HospitalError("Ward name cannot be empty");
    }

    this.#name = name;
  }

  #validatePatient(patient) {
    if (!(patient instanceof Patient)) {
      throw new HospitalError(
        "Invalid patient: Only Patient instances are allowed"
      );
    }
  }

  getName() {
    return this.#name;
  }

  addPatient(patient) {
    this.#validatePatient(patient);

    if (this.#patients.includes(patient)) {
      throw new HospitalError(
        `Patient [${patient.getId()}] is already in Ward [${this.#name}]`
      );
    }

    this.#patients.push(patient);
    Hospital.registerPatient(patient);

    return this;
  }

  getAllPatients() {
    return [...this.#patients];
  }

  getPatientSummaries() {
    return this.#patients.map((patient) => patient.getSummary());
  }

  findPatientById(id) {
    const patient = this.#patients.find(
      (patient) => patient.getId() === id
    );

    if (!patient) {
      throw new HospitalError(
        `Patient with ID: ${id} not found in Ward: ${this.#name}`
      );
    }

    return patient;
  }

  removePatient(id) {
    const patient = this.findPatientById(id);

    if (patient.isActive) {
      throw new HospitalError(
        `Cannot remove active patient [${id}]. Discharge first`
      );
    }

    this.#patients = this.#patients.filter(
      (patient) => patient.getId() !== id
    );

    Hospital.unregisterPatient(id);

    return this;
  }
}

class Hospital {
  static #patients = [];

  static registerPatient(patient) {
    if (!Hospital.#patients.includes(patient)) {
      Hospital.#patients.push(patient);
    }
  }

  static unregisterPatient(id) {
    Hospital.#patients = Hospital.#patients.filter(
      (patient) => patient.getId() !== id
    );
  }

  static getAllPatients() {
    return [...Hospital.#patients];
  }

  static getTotalPatients() {
    return Patient.getTotalPatients();
  }
}


const p1 = Patient.create("general", "Atik", 25);
const p2 = Patient.create("emergency", "Rahim", 40);

console.log(p1.getSummary());

console.log(p2.getSummary());

p1.addMedicalRecord("Fever diagnosed");
p1.addMedicalRecord("Blood test done");

console.log(p1.getMedicalRecords());

console.log(p1.getTotalCost()); 
console.log(p2.getTotalCost()); 

p1.discharge();
console.log(p1.getSummary());

try { p1.addMedicalRecord("Fail"); }
catch (e) { console.log(e.name, e.message); }

const ward = new Ward("ICU");
ward.addPatient(p1).addPatient(p2);

console.log(ward.getAllPatients().length);    
console.log(ward.getPatientSummaries());

console.log(ward.findPatientById(p2.getId()).getName());  

ward.removePatient(p1.getId());
console.log(ward.getAllPatients().length);    

console.log(Hospital.getAllPatients().length);   
console.log(Patient.getTotalPatients());         
console.log(Hospital.getTotalPatients());        

