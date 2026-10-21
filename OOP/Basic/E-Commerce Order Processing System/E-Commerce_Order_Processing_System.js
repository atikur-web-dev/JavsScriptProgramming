class ShopError extends Error {
  constructor(message) {
    super(message);
    this.name = "ShopError";
  }
}

class Product {
  static sku = new Set();
  static global_product_counter = 0;
  #name;
  #basePrice;
  #stock;
  constructor(name, basePrice, stock) {
    if (new.target === Product) {
      throw new ShopError("Abstruct cannot be implemented");
    }
    // Code for SKU
    let sku;
    do {
      sku = Math.random().toString(36).slice(2, 10);
    } while (Product.sku.has(sku));
    Product.sku.add(sku);
    Object.defineProperty(this, "sku", {
      value: sku,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    this.name = name;
    this.basePrice = basePrice;
    this.stock = stock;
    Product.global_product_counter++;
  }
  get name() {
    return this.#name;
  }
  set name(newName) {
    this.#name = this.validateName(newName);
  }
  validateName(name) {
    if (typeof name != "string" || name.trim().length < 3) {
      throw new ShopError("Product name must be at least 3 char");
    }
    return name.trim();
  }
  get basePrice() {
    return this.#basePrice;
  }
  set basePrice(newPrice) {
    this.#basePrice = this.validateBasePrice(newPrice);
  }
  validateBasePrice(price) {
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
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
    if (!Number.isInteger(stock) || stock < 0) {
      throw new ShopError("Stock must be a non-negative integer");
    }
    return stock;
  }
  _getFinalPrice() {
    return "This is an Abstruct method dude";
  }
  isInStock() {
    return this.#stock > 0;
  }
  getStock() {
    return this.#stock;
  }
  reduceStock(quantity) {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new ShopError("Quantity must be a Positive Intiger Number");
    }
    if (this.#stock < quantity) {
      throw new ShopError("Insufficient Stock");
    }
    this.#stock -= quantity;
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] - $[${this.basePrice}] (Stock: [${this.getStock()}])`;
  }
  static getTotalProducts() {
    return Product.global_product_counter;
  }
  static create(type, name, basePrice, stock, extra, extra2) {
    if (type === "physical")
      return new PhysicalProduct(name, basePrice, stock, extra);
    if (type === "digital")
      return new DigitalProduct(name, basePrice, stock, extra);
    if (type === "subscription")
      return new SubscriptionProduct(
        name,
        basePrice,
        stock,
        extra,
        extra2
      );
    throw new ShopError("Invalid Type Input");
  }
}

class PhysicalProduct extends Product {
  #weight;
  constructor(name, basePrice, stock, weight) {
    super(name, basePrice, stock);
    this.#weight = this.validateWaight(weight);
  }
  validateWeight(weight) {
  if (
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight < 0
  ) {
    throw new ShopError(
      "Weight must be a non-negative finite number"
    );
  }

  return weight;
}
  shippingCost() {
    let shippingCost = this.#weight * 2;
    return shippingCost;
  }
  getFinalPrice() {
    let finalPrice = this.shippingCost() + this.basePrice;
    return finalPrice;
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] - $[${this.getFinalPrice()}] (Stock: [${this.getStock()}])`;
  }
}

// class DigitalProduct extends Product {
//   #fileSize;
//   constructor(name, basePrice, stock, fileSize) {
//     super(name, basePrice, stock);
//     this.#fileSize = fileSize;
//   }
//   validateFileSize(fileSize) {
//     if(fileSize < 0) {
//         throw new ShopError("File Size must be positive")
//     }
//   }
//   getFileSize() {
//     return this.#fileSize;
//   }
//   getFinalPrice() {
//     return this.basePrice;
//   }
//   getInfo() {
//     return `[${this.sku}] [${this.name}] [${this.getFileSize()} MB]- $[${this.basePrice}] (Stock: [${this.getStock()}])`;
//   }
// }

// Prototype Version
function DigitalProduct(name, basePrice, stock, fileSize) {
  Product.call(this,name,basePrice,stock);
  validateFilesize(fileSize) {
    if(fileSize < 0) {
      throw new ShopError("File size must me positive")
    }
    this.fileSize = fileSize
  }
}

DigitalProduct.prototype = Object.create(Product.prototype);
DigitalProduct.prototype.constructor = DigitalProduct;
DigitalProduct.prototype.getFileSize = function() {
  return this.fileSize;
}
DigitalProduct.prototype.getFinalPrice = function() {
  return this.basePrice;
}
DigitalProduct.prototype.getInfo = function() {
  return `[${this.sku}] [${this.name}] [${this.getFileSize()} MB]- $[${this.basePrice}] (Stock: [${this.getStock()}])`;
}

class SubscriptionProduct extends Product {
  #duration;
  #discountPercent;
  constructor(name, basePrice, stock, duration, discountPercent) {
    super(name, basePrice, stock);
    this.#duration = this.validateDuration(duration)
    this.#discountPercent = this.validateBasePrice(discountPercent)
  }
  validateDuration(duration) {
    if(duration < 0) {
        throw new ShopError("Durtion must be positive")
    }
  }
  validatePercente(percent) {
    if(percent < 0) {
      throw new ShopError("Percentage must be Positive")
    }
  }
  convertPercentage() {
    let actualPercentage = this.#discountPercent / 100;
    return actualPercentage;
  }
  discountPrice() {
    let totalPrice = this.basePrice * this.#duration;
    let discount = this.totalPrice * this.convertPercentage();
    return discount;
  }
  getFinalPrice() {
    let total = this.basePrice * this.#duration;
    return total - this.discountPrice()
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] [${this.#duration} Month]- $[${this.getFinalPrice()}] (Stock: [${this.getStock()}])`;
  }
}

function createCustomer(name, email) {
  
}


class Customer {
  static customerId = new Set();
  #name;
  #email;
  #orderHistory = new Set();
  constructor(name, email) {
    let id;
    do {
      id = Math.random().toString(36).slice(2,9)
    } while(Customer.customerId.has(id));
    Customer.customerId.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    this.name = name;
  }
  get name() {
    return this.#name;
  }
  set name(newName) {
    this.#name = this.validateName(newName);
  }
  validateName(name) {
    if(typeof name != "string" || name.trim().length < 3) {
      throw new ShopError("Name must be string with more then 3 charecters")
    }
    return name;
  }
  get email() {
    return this.#email;
  }
  set email(newEmail) {
    this.#email = newEmail;
  }
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) {
      throw new ShopError("Invalid Email input");
    }
    return email;
  }
  addOrder(order){
    if(!(order instanceof Order)) {
      throw new ShopError("Invalid Order Input");
    }
    for(const odr of order) {
      if(this.#orderHistory.has(order.id)) {
        throw new ShopError("Order already exist")
      }
    }
    this.#orderHistory.add(order);
    return this;
  }
  getOrderHistory() {
    return [...this.#orderHistory]
  }
  getTotalSpent(){

  }
  getTotalOrders() {
    return this.#orderHistory.size;
  }
  getInfo() {
    return `[${this.id}] [${this.name}] (${this.email}) - Orders: ${this.getTotalOrders()}`
  }
}
class Order {
  static orderIds = new Set();
  #customer;
  static #items = new Map();
  constructor(customer){
    let id;
    do {
      id = Math.random().toString(36).slice(2,9)
    } while(Order.orderIds.had(id));
    Order.orderIds.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    if(!(customer instanceof Customer)) {
      throw new ShopError("Invalid Customer Input")
    }
    this.#customer = customer;
  }
}
class OrderProcessor {}