class BankError extends Error {
  constructor(message) {
    super(message);
    this.name = "BankError";
  }
}

class BankAccount {
  #owner;
  #balance;
  #id;

  static #totalAccounts = 0;

  constructor(owner, initialDeposit = 0) {
    this.#validateName(owner);
    this.#validateInitialDeposit(initialDeposit);

    this.#owner = owner;
    this.#balance = initialDeposit;
    this.#id = this.#generateId();

    BankAccount.#totalAccounts++;
  }

  #generateId() {
    return Math.random().toString(36).slice(2, 8);
  }

  #validateName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new BankError("Name cannot be empty");
    }

    if (/\d/.test(name)) {
      throw new BankError("Name cannot contain digits");
    }
  }

  #validateInitialDeposit(amount) {
    if (typeof amount !== "number" || amount < 0) {
      throw new BankError("Initial deposit cannot be negative");
    }
  }

  get id() {
    return this.#id;
  }

  get owner() {
    return this.#owner;
  }

  set owner(newName) {
    this.#validateName(newName);
    this.#owner = newName;
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

    return this;
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

  getAccountInfo() {
    return `[${this.#id}] ${this.#owner} - Balance: $${this.#balance}`;
  }

  static create(ownerName, initialDeposit = 0) {
    return new BankAccount(ownerName, initialDeposit);
  }

  static getTotalAccounts() {
    return BankAccount.#totalAccounts;
  }
}

class SavingsAccount extends BankAccount {
  #interestRate;

  constructor(ownerName, initialDeposit, interestRate = 0.05) {
    super(ownerName, initialDeposit);

    if (
      typeof interestRate !== "number" ||
      interestRate < 0
    ) {
      throw new BankError("Interest rate cannot be negative");
    }

    this.#interestRate = interestRate;
  }

  addInterest() {
    const interest = this.balance * this.#interestRate;

    this._setBalance(this.balance + interest);

    return this;
  }

  getAccountInfo() {
    return `${super.getAccountInfo()} | Savings @ ${
      this.#interestRate * 100
    }%`;
  }
}

class CurrentAccount extends BankAccount {
  #overdraftLimit;

  constructor(ownerName, initialDeposit, overdraftLimit = 1000) {
    super(ownerName, initialDeposit);

    if (
      typeof overdraftLimit !== "number" ||
      overdraftLimit < 0
    ) {
      throw new BankError("Overdraft limit cannot be negative");
    }

    this.#overdraftLimit = overdraftLimit;
  }

  withdraw(amount) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new BankError("Withdraw amount must be positive");
    }

    const newBalance = this.balance - amount;

    if (newBalance < -this.#overdraftLimit) {
      throw new BankError("Overdraft limit exceeded");
    }

    this._setBalance(newBalance);

    return this;
  }

  getAccountInfo() {
    return `${super.getAccountInfo()} | Current (Overdraft: ${this.#overdraftLimit})`;
  }
}

const acc1 = BankAccount.create("Atik", 500);

console.log(acc1.getAccountInfo());

acc1.deposit(200).deposit(300);

console.log(acc1.balance);
console.log(acc1.getAccountInfo());

acc1.owner = "Atikur";

console.log(acc1.owner);
console.log(acc1.id);

const savings = new SavingsAccount("Rahim", 1000);

console.log(savings.getAccountInfo());

savings.addInterest();

console.log(savings.balance);
console.log(savings.getAccountInfo());

const current = new CurrentAccount("Karim", 500);

console.log(current.getAccountInfo());

current.withdraw(1200);

console.log(current.balance);
console.log(current.getAccountInfo());

console.log(BankAccount.getTotalAccounts());

try {
  new BankAccount("123");
} catch (error) {
  console.log(error.name, error.message);
}

try {
  new BankAccount("", 500);
} catch (error) {
  console.log(error.name, error.message);
}

try {
  new BankAccount("Atik", -100);
} catch (error) {
  console.log(error.name, error.message);
}

try {
  acc1.deposit(-50);
} catch (error) {
  console.log(error.name, error.message);
}

try {
  acc1.withdraw(5000);
} catch (error) {
  console.log(error.name, error.message);
}

try {
  current.withdraw(5000);
} catch (error) {
  console.log(error.name, error.message);
}

try {
  acc1.owner = "Atik123";
} catch (error) {
  console.log(error.name, error.message);
}