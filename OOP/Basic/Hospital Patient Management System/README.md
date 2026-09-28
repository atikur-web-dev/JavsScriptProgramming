# Hospital Patient Management System

You have to build a **Hospital Patient Management System**. There are two types of patients:

* General Patient
* Emergency Patient

## Requirements

### Patient ID

Every patient must have a **unique patient ID**.

* The ID must be generated automatically by the system.
* No one can manually provide the ID.
* Once generated, the ID can never be changed.

### Patient Name

Every patient must have a name.

The name must be validated before it is read:

* The name cannot be empty.
* The name cannot contain any numbers.

If the name is invalid, a custom `HospitalError` must be thrown.

`HospitalError` must inherit from the built-in `Error` class, and its `name` must be:

```text
HospitalError
```

### Total Patient Count

Whenever a patient is admitted, the hospital's **total number of admitted patients** must increase by 1.

This count:

* Must be readable from outside.
* Must not be directly modifiable from outside.

### Medical Record

Every patient must have a **medical record** that is completely encapsulated.

* The medical record cannot be accessed directly from outside.
* New medical record entries can be added.
* All existing entries can be read.

After a patient is discharged, no new medical record entry can be added. Attempting to do so must throw a `HospitalError`.

### General Patient

A General Patient has a **fixed daily charge**.

The total cost should be calculated based on the daily charge and the number of admitted days.

### Emergency Patient

An Emergency Patient has a daily charge that is **30% higher** than the General Patient's charge.

Each patient must have a mechanism to calculate their total cost, but the base `Patient` class must not contain a specific implementation for this calculation.

Each subclass must calculate the total cost according to its own charge rate.

### Discharge

Every patient must have a way to be discharged.

After discharge:

* The patient is no longer active.
* No new medical record entry can be added.

### Ward

There must be a `Ward` class that works as a **collection class** and can contain multiple patients.

When adding a patient to a Ward, the system must verify that the object is actually a `Patient`.

The Ward must allow:

* Reading a summary of all patients.
* Finding a specific patient by Patient ID.
* Throwing a `HospitalError` if the patient is not found.
* Removing discharged patients when required.

### Single Source of Truth

The system must have a **single source of truth** where all patients from all Wards can be accessed together.

The hospital administrator should be able to use this centralized source to view information about all patients across all Wards.
