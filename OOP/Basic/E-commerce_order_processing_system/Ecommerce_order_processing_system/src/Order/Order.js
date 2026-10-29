import { ShopError } from "../errors/ShopError";
import { Customer } from "../Customer/Customer";
import { Product } from "../Product/Product";

const generatedIds = new Set();
const validStatus = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const VALID_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export class Order {
  #customer;
  #items = new Map();
  #status = "pending";
  #discountPercent = 0;
  constructor(customer) {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (generatedIds.has(id));
    generatedIds.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    this.#customer = customer;
  }
  validateCustomer(customer) {
    if (!(customer instanceof Customer)) {
      throw new ShopError("Invalid Customer Input");
    }
    return customer;
  }
  get customer() {
    return this.#customer;
  }
  get status() {
    return this.#status;
  }
  get discountPercent() {
    return this.#discountPercent;
  }
  addItem(product, quantity) {
    if (!(product instanceof Product)) {
      throw new ShopError("Invalid Product Input");
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new ShopError("Quantity Must be a Positive intiger");
    }
    if (!product.isInStock()) {
      throw new ShopError("In sufficient stock");
    }
    const prev = this.#items.get(product) || 0;
    this.#items.set(product, pre + quantity);
    product.reduceStock(quantity);
    return this;
  }
  applyDiscount(percent) {
    if (typeof percent != "number" || percent < 0 || percent > 100) {
      throw new ShopError(
        "Percent must be a positive number and in between 0 and 100",
      );
    }
    this.#discountPercent = percent;
    return this;
  }
  getSubtotal() {
    let sum = 0;
    for (const [product, qty] of this.#items) {
      sum += product.getFinalPrice() * qty;
    }
    return sum;
  }
  getTotal() {
    const total = this.getSubtotal();
    return total - total * (this.#discountPercent / 100);
  }
  updateStatus(newStatus) {
    if (!validStatus.includes(newStatus)) {
      throw new ShopError(`Invalid status input ${newStatus}`);
    }
    const allowed = VALID_TRANSITIONS[this.#status];
    if (!allowed.includes(newStatus)) {
      throw new ShopError(
        `Cannot transaction from ${this.#status} to ${newStatus}`,
      );
    }
    this.#status = newStatus;
    return this;
  }
  cancel() {
    if (this.#status === "delivered" || this.#status === "cancelled") {
      throw new ShopError(`Cannot cancel order with status: ${this.#status}`);
    }
    for (const [product, qty] of this.#items) {
      product.stock += qty;
    }
    this.#status = "cancelled";
    return this;
  }
  getItems() {
    return [...this.#items.entries()].map(([product, qty]) => ({
      product,
      quantity: qty,
    }));
  }
  getInfo() {
    return `Order ${this.id} - ${this.customer.name} - ${this.#status} - $${this.getTotal()}`;
  }
}
