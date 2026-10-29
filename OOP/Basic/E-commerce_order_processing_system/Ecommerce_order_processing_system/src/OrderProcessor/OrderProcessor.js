import { ShopError } from "../errors/ShopError";
import { Product } from "../Product/Product";
import { Customer } from "../Customer/Customer";
import { Order } from "../Order/Order";

export class OrderProcessor {
  #orders = new Map();
  #customers = new Map();
  #products = new Map();
  registerCustomer(customer) {
    if (!(customer instanceof Customer)) {
      throw new ShopError("Invalid Customer Input");
    }
    if (this.#customers.has(customer.id)) {
      throw new ShopError("Customer already Exist");
    }
    this.#customers.set(customer.id, customer);
    return this;
  }
  registerProduct(product) {
    if(!(product instanceof Product)) {
        throw new ShopError("Invalid Product Input")
    }
    if(this.#products.has(product.sku)) {
        throw new ShopError("Product already registered")
    }
    this.#products.set(product.sku, product);
    return this;
  }
  async placeOrder(customerId, items) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const customer = this.#customers.get(customerId);
    if(!customer) throw new ShopError("Customer could not found");
    
  }
}
