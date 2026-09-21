// Custom Error class
class BankError extends Error {
  constructor(message) {
    super(message);
    this.name = "BankError";
  }
}

// Base Class
class BankAccount {
  #owner;
  #balance;
  #id;
  static #totalAccounts = 0;
  constructor(owner, initialDeposit = 0) {
    this.#owner = owner;
    this.#id = this.#generateId();
    this.#balance = initialDeposit;
    BankAccount.#totalAccounts++;
  }

  // Unique id generator
  #generateId() {
    return Math.random().toString(32).slice(2, 8);
  }

  // Name Validation
  #validateName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new BankError("Name Cannot be Empty");
    }
    if (/\d/.test(name)) {
      throw new BankError("Name cannot contain Digits");
    }
  }

  // ID can only be read
  get id() {
    return this.#id;
  }

  // can update owner using setter
  set owner(newName) {
    this.#owner = this.#validateName(newName);
  }

  get balance() {
    return this.#balance;
  }

  _setBalance(amount) {
    this.#balance = amount;
  }

  deposit(amount) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new BankError("Deposit amount must be positive");
    }
    this.#balance += amount;
    return this; // For chaining
  }

  withdraw(amount) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new BankError("Withdraw amount must be positive");
    }
    if (amount > this.#balance) {
      throw new BankError("Insufficient balance");
    }
    this.#balance -= amount;
    return this;
  }

  static create(ownerName, initialDeposit = 0) {
    if (initialDeposit < 0) {
      throw new BankError("Initial deposit cannot be negative");
    }
    return new BankAccount(ownerName, initialDeposit);
  }

  static getTotalAccount() {
    return BankAccount.#totalAccounts;
  }
}

// Saving account extends
class SavingAccount extends BankAccount {
  #interestRate;
  constructor(ownerName, initialDeposit, interestRate = 0.5) {
    super(ownerName, initialDeposit);
    this.#interestRate = interestRate;
  }

  addInterest() {
    const interest = this.balance * this.#interestRate;
    this._setBalance(this.balance + interest);
  }

  getAccountInfo() {
    return `${super.getAccountInfo()} | Savings @ ${this.#interestRate * 100}%`;
  }
}

class CurrentAccount extends BankAccount {
  #overdraftLimit;
  constructor(ownerName, initialDeposit, overdraftLimit = 1000) {
    super(ownerName, initialDeposit);
    this.#overdraftLimit = overdraftLimit;
  }

  withdraw(amount) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new BankError("Withdraw amount must be Positive");
    }
    const newBalance = this.balance - amount;
    if (newBalance < -this.#overdraftLimit) {
      throw new BankError("Overdraft limit exceeded");
    }
    this._setBalance(newBalance);
    return this;
  }
  getAccountInfo() {
    return `${super.getAccountInfo()} | Current (Overdraft : ${this.#overdraftLimit})`;
  }
}


const acc1 = BankAccount.create("Atik", 500);
acc1.deposit(200).deposit(300);
console.log(acc1.getAccountInfo());
console.log(acc1.balance);        
acc1.balance = 5000;               
console.log(acc1.balance);        

const savings = new SavingAccount("Rahim", 1000);
savings.addInterest();
console.log(savings.getAccountInfo());

const current = new CurrentAccount("Karim", 500);
current.withdraw(1200);
console.log(current.getAccountInfo());

console.log(BankAccount.getTotalAccount());

// try { new BankAccount("123"); } catch (e) { console.log(e.name, e.message); }
// try { acc1.withdraw(-50); } catch (e) { console.log(e.name, e.message); }
// try { current.withdraw(5000); } catch (e) { console.log(e.name, e.message); }