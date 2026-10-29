import { ShopError } from "../errors/ShopError";

const usedSkus = new Set();
let globalProductCount = 0;

export class Product {
  #name;
  #basePrice;
  #stock;
  constructor(name, basePrice, stock) {
    if (new.target === Product) {
      throw new ShopError("Product is abstract and cannot be instantiated");
    }
    let sku;
    do {
      sku = Math.random().toString(36).slice(2, 9);
    } while (usedSkus.has(sku));
    usedSkus.add(sku);
    Object.defineProperty(this, "sku", {
      value: sku,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    this.name = name;
    this.basePrice = basePrice;
    this.#stock = stock;
    globalProductCount++;
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
  get basePrice() {
    return this.#basePrice;
  }
  set basePrice(newPrice) {
    this.#basePrice = this.validateBasePrice(newPrice);
  }
  validateBasePrice(price) {
    if (typeof price != "number" || !Number.isFinite(price) || price <= 0) {
      throw new ShopError("Base price must be a positive number");
    }
    return price;
  }
  get stock() {
    return this.#stock;
  }
  set stock(newStock) {
    this.#stock = this.validateStock(newStock);
  }
  validateStock(stock) {
    if (typeof stock != "number" || !Number.isInteger(stock) || stock < 0) {
      throw new ShopError("Stock must be a non-negative integer");
    }
    return stock;
  }
  getFinalPrice() {
    throw new ShopError("getFinalPrice() must be implemented by subclass");
  }
  isInStock() {
    return this.#stock > 0;
  }
  reduceStock(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ShopError("No stock available");
    }
    if (this.#stock < quantity) {
      throw new ShopError("Insufficient Stock");
    }
    this.#stock -= quantity;
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] - $[${this.basePrice}] (Stock: [${this.stock}])`;
  }
  static getGlobalCounter() {
    return globalProductCount;
  }
  static create(type, name, basePrice, stock, extra1, extra2) {
    switch(type) {
        case "physical" : 
            return new PhysicalProduct(name, basePrice,stock, extra1);
        case "digital" :
            return new DigitalProduct(name, basePrice, stock, extra1);
        case "subscription" :
            return new SubscriptionProduct(name, basePrice, stock, extra1, extra2);
        default :
            throw new ShopError(`Invalid Product Type : ${type}`)
    }
  }
}
