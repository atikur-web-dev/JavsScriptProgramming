import { ShopError } from "../errors/ShopError";
import { Customer } from "../Customer/Customer";
import { Product } from "../Product/Product";

const generatedIds = new Set();
const validStatus = ["pending", "processing", "shipped", "delivered", "cancelled"];
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
    if(!(customer instanceof Customer)) {
        throw new ShopError("Invalid Customer Input")
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
    if(!(product instanceof Product)) {
        throw new ShopError("Invalid Product Input");
    }
    if(quantity <= 0 || !Number.isInteger(quantity)) {
        throw new ShopError("Quantity Must be a Positive intiger")
    }
    if(!product.isInStock()) {
        throw new ShopError("In sufficient stock")
    }
  }
}
