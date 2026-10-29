import { ShopError } from "../errors/ShopError";
import { Order } from "../Order/Order";
const useCustomerId = new Set();
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class Customer {
  #name;
  #email;
  #orderHistory = [];
  constructor(name, email) {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (useCustomerId.had(id));
    useCustomerId.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    this.name = name;
    this.email = email;
  }
  get name() {
    return this.#name;
  }
  set name(newName) {
    this.#name = this.validateName(newName);
  }
  validateName(name) {
    if (typeof name != "string" || name.trim().length < 3) {
      throw new ShopError(
        "Name must be string and contain at least 3 Charecters",
      );
    }
    return name;
  }
  get email() {
    this.#email;
  }
  set email(newEmail) {
    this.#email = this.validateEmail(newEmail);
  }
  validateEmail(email) {
    if (!EMAIL_REGEX.test(email)) {
      throw new ShopError("Invalid Email Input");
    }
    return email;
  }
  addOrder(order) {
    if (!(order instanceof Order)) {
      throw new ShopError("Invalid Order Input");
    }
    if (this.#orderHistory.includes(order)) {
      throw new ShopError("Order already exist");
    }
    this.#orderHistory.push(order);
  }
  getOrderHistory() {
    return [...this.#orderHistory];
  }
  getTotalOrder() {
    return this.#orderHistory.length;
  }
  getTotalSpent() {
    return this.#orderHistory
      .filter((o) => o.status != "cancelled")
      .reduce((sum, o) => sum + o.getTotal(), 0);
  }
  getInfo() {
    return `[${this.id}] [${this.name}] ([${this.email}]) - Orders: [${this.getTotalOrder()}]`;
  }
}
