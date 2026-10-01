class HospitalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HospitalError";
  }
}

abstract class Patient {
  private id: string;
  private name: string;
  private days: number;
  private medicalRecords: string[] = [];
  private active: boolean = true;

  private static totalPatients: number = 0;
  private static usedIds: Set<string> = new Set();

  constructor(name: string, days: number) {
    this.validateName(name);

    this.name = name;
    this.days = days;
    this.id = this.generateId();
    Patient.totalPatients++;
  }

  private generateId(): string {
    let id: string;

    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (Patient.usedIds.has(id));

    Patient.usedIds.add(id);
    return id;
  }

  private validateName(name: string): void {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new HospitalError("Name cannot be empty");
    }

    if (/\d/.test(name)) {
      throw new HospitalError("Name cannot contain any digits");
    }
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDays(): number {
    return this.days;
  }

  get isActive(): boolean {
    return this.active;
  }

  getSummary(): string {
    if (!this.active) {
      return `[${this.id}] ${this.name} - Discharged`;
    }

    return `[${this.id}] ${this.name} (${this.days})`;
  }

  addMedicalRecord(entry: string): this {
    if (!this.active) {
      throw new HospitalError(
        `Patient [${this.id}] has been discharged, cannot add record`
      );
    }

    this.medicalRecords.push(entry);
    return this;
  }

  getMedicalRecords(): string[] {
    return [...this.medicalRecords];
  }

  abstract getTotalCost(): number;

  discharge(): this {
    if (!this.active) {
      throw new HospitalError(
        `Patient [${this.id}] is already discharged`
      );
    }

    this.active = false;
    return this;
  }

  static getTotalPatients(): number {
    return Patient.totalPatients;
  }

  static create(
    type: string,
    name: string,
    days: number
  ): Patient {
    if (type === "general") {
      return new GeneralPatient(name, days, 100);
    }

    if (type === "emergency") {
      return new EmergencyPatient(name, days, 100);
    }

    throw new HospitalError(`Invalid patient type : ${type}`);
  }
}

class GeneralPatient extends Patient {
  private dailyRate: number;

  constructor(
    name: string,
    days: number,
    dailyRate: number = 100
  ) {
    super(name, days);
    this.dailyRate = dailyRate;
  }

  getTotalCost(): number {
    return this.getDays() * this.dailyRate;
  }
}

class EmergencyPatient extends Patient {
  private dailyRate: number;

  constructor(
    name: string,
    days: number,
    dailyRate: number = 100
  ) {
    super(name, days);
    this.dailyRate = dailyRate;
  }

  getTotalCost(): number {
    const baseCost = this.getDays() * this.dailyRate;
    return baseCost * 1.3;
  }
}

class Ward {
  private name: string;
  private patients: Patient[] = [];

  constructor(name: string) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new HospitalError("Ward name cannot be empty");
    }

    this.name = name;
  }

  private validatePatient(patient: Patient): void {
    if (!(patient instanceof Patient)) {
      throw new HospitalError(
        "Invalid patient : Only Patient instances are allowed"
      );
    }
  }

  getName(): string {
    return this.name;
  }

  addPatient(patient: Patient): this {
    this.validatePatient(patient);

    if (this.patients.includes(patient)) {
      throw new HospitalError(
        `Patient [${patient.getId()}] is already in Ward [${this.name}]`
      );
    }

    this.patients.push(patient);
    Hospital.registerPatient(patient);

    return this;
  }

  getAllPatients(): Patient[] {
    return [...this.patients];
  }

  getPatientSummaries(): string[] {
    return this.patients.map((patient) => patient.getSummary());
  }

  findPatientById(id: string): Patient {
    const patient = this.patients.find(
      (patient) => patient.getId() === id
    );

    if (!patient) {
      throw new HospitalError(
        `Patient with ID: ${id} not found in Ward: ${this.name}`
      );
    }

    return patient;
  }

  removePatient(id: string): this {
    const patient = this.findPatientById(id);

    if (patient.isActive) {
      throw new HospitalError(
        `Cannot remove active patient [${id}]. Discharge first`
      );
    }

    this.patients = this.patients.filter(
      (patient) => patient.getId() !== id
    );

    Hospital.unregisterPatient(id);

    return this;
  }
}

class Hospital {
  private static patients: Patient[] = [];

  static registerPatient(patient: Patient): void {
    if (!Hospital.patients.includes(patient)) {
      Hospital.patients.push(patient);
    }
  }

  static unregisterPatient(id: string): void {
    Hospital.patients = Hospital.patients.filter(
      (patient) => patient.getId() !== id
    );
  }

  static getAllPatients(): Patient[] {
    return [...Hospital.patients];
  }

  static getTotalPatients(): number {
    return Patient.getTotalPatients();
  }
}

console.log("Test 1: Patient creation & summary");

const p1 = Patient.create("general", "Atik", 25);
const p2 = Patient.create("emergency", "Rahim", 40);

console.log(p1.getSummary());
console.log(p2.getSummary());

console.log("\nTest 2: Medical records");

p1.addMedicalRecord("Fever diagnosed");
p1.addMedicalRecord("Blood test done");

console.log(p1.getMedicalRecords());

console.log("\nTest 3: Total cost");

console.log(p1.getTotalCost());
console.log(p2.getTotalCost());

console.log("\nTest 4: Discharge");

p1.discharge();

console.log(p1.getSummary());
console.log(p1.isActive);

try {
  p1.addMedicalRecord("Fail");
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}

console.log("\nTest 5: Ward");

const ward = new Ward("ICU");

ward.addPatient(p1).addPatient(p2);

console.log(ward.getAllPatients().length);
console.log(ward.getPatientSummaries());
console.log(ward.findPatientById(p2.getId()).getName());

console.log("\nTest 6: Remove discharged");

ward.removePatient(p1.getId());

console.log(ward.getAllPatients().length);

console.log("\nTest 7: Hospital level");

console.log(Hospital.getAllPatients().length);
console.log(Patient.getTotalPatients());
console.log(Hospital.getTotalPatients());

console.log("\nTest 8: Error cases");

