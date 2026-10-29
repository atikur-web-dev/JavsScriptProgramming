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
      return new SubscriptionProduct(name, basePrice, stock, extra, extra2);
    throw new ShopError("Invalid Type Input");
  }
}

class PhysicalProduct extends Product {
  #weight;
  constructor(name, basePrice, stock, weight) {
    super(name, basePrice, stock);
    this.#weight = this.validateWeight(weight);
  }
  validateWeight(weight) {
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
      throw new ShopError("Weight must be a non-negative finite number");
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
// function DigitalProduct(name, basePrice, stock, fileSize) {
//   Product.call(this,name,basePrice,stock);
//   validateFilesize(fileSize) {
//     if(fileSize < 0) {
//       throw new ShopError("File size must me positive")
//     }
//     this.fileSize = fileSize
//   }
// }

DigitalProduct.prototype = Object.create(Product.prototype);
DigitalProduct.prototype.constructor = DigitalProduct;
DigitalProduct.prototype.getFileSize = function () {
  return this.fileSize;
};
DigitalProduct.prototype.getFinalPrice = function () {
  return this.basePrice;
};
DigitalProduct.prototype.getInfo = function () {
  return `[${this.sku}] [${this.name}] [${this.getFileSize()} MB]- $[${this.basePrice}] (Stock: [${this.getStock()}])`;
};

class SubscriptionProduct extends Product {
  #duration;
  #discountPercent;
  constructor(name, basePrice, stock, duration, discountPercent) {
    super(name, basePrice, stock);
    this.#duration = this.validateDuration(duration);
    this.#discountPercent = this.validateDiscountPercent(discountPercent);
  }
  validateDuration(duration) {
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new ShopError("Duration must be a positive integer");
    }
    return duration;
  }
  validateDiscountPercent(discount) {
    if (discount < 0 || discount > 100) {
      throw new ShopError("Discount cannot be Negative");
    }
    if (!Number.isInteger(discount)) {
      throw new ShopError("Discount must be Integer value");
    }
    return discount;
  }
  validatePercente(percent) {
    if (percent < 0) {
      throw new ShopError("Percentage must be Positive");
    }
    return percent;
  }
  convertPercentage() {
    let actualPercentage = this.#discountPercent / 100;
    return actualPercentage;
  }
  discountPrice() {
    let totalPrice = this.basePrice * this.#duration;
    let discount = totalPrice * this.convertPercentage();
    return discount;
  }
  getFinalPrice() {
    let total = this.basePrice * this.#duration;
    return total - this.discountPrice();
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] [${this.#duration} Month]- $[${this.getFinalPrice()}] (Stock: [${this.getStock()}])`;
  }
}

let _orderHistory = new Set();
let _customerId = new Set();
function createCustomer(name, email) {
  let _name;
  let _email;
  let _id;
  do {
    id = Math.random().toString(36).slice(2, 9);
  } while (_customerId.has(id));
  _id = id;
  if (name.trim().length < 3 || typeof name != "string") {
    throw new ShopError("Invalid Name input");
  }
  _name = name.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new ShopError("Invalid Email input");
  }
  _email = email;
  return {
    getName() {
      return _name;
    },
    getEmail() {
      return _email;
    },
    getID() {
      return _id;
    },
    setName(newName) {
      if (typeof newName != "string" || newName.trim().length < 3) {
        throw new ShopError("New Name must be at lear 3 char");
      }
      _name = newName;
    },
    setEmail(newEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        throw new ShopError("Invalid Email input");
      }
      _email = newEmail;
    },
    addOrder(order) {
      if (!(order instanceof Order)) {
        throw new ShopError("Invalid Order Input");
      }
      for (const odr of order) {
        if (this.#orderHistory.has(order.id)) {
          throw new ShopError("Order already exist");
        }
      }
      _orderHistory.add(order);
      return this;
    },
    getOrderHistory() {
      return [..._orderHistory];
    },
    getTotalSpent() {},
    getTotalOrders() {
      return _orderHistory.size;
    },
    getInfo() {
      return `[${this.id}] [${this.name}] (${this.email}) - Orders: ${this.getTotalOrders()}`;
    },
  };
}

class Customer {
  static customerId = new Set();
  #name;
  #email;
  #orderHistory = new Set();
  constructor(name, email) {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Customer.customerId.has(id));
    Customer.customerId.add(id);
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
      throw new ShopError("Name must be string with more then 3 charecters");
    }
    return name;
  }
  get email() {
    return this.#email;
  }
  set email(newEmail) {
    this.#email = this.validateEmail(newEmail);
  }
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new ShopError("Invalid Email input");
    }
    return email;
  }
  addOrder(order) {
    if (!(order instanceof Order)) {
      throw new ShopError("Invalid Order Input");
    }
    if (this.#orderHistory.has(order)) {
      throw new ShopError("Order already exist");
    }
    this.#orderHistory.add(order);
    return this;
  }
  getOrderHistory() {
    return [...this.#orderHistory];
  }
  getTotalSpent() {}
  getTotalOrders() {
    return this.#orderHistory.size;
  }
  getInfo() {
    return `[${this.id}] [${this.name}] (${this.email}) - Orders: ${this.getTotalOrders()}`;
  }
}
class Order {
  static orderIds = new Set();
  #customer;
  #items = new Map();
  #discountPercent;
  constructor(customer, discountPercent, quantity) {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Order.orderIds.has(id));
    Order.orderIds.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    if (!(customer instanceof Customer)) {
      throw new ShopError("Invalid Customer Input");
    }
    this.#customer = customer;
    this.#discountPercent = this.validatePercentage(discountPercent);
    this.quantity = this.validateQuantity(quantity);
  }
  validateQuantity(quantity) {
    if (quantity < 0) {
      throw new ShopError("Quantity cannot be negative");
    }
    return quantity;
  }
  validatePercentage(percentage) {
    if (
      typeof percentage !== "number" ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      throw new ShopError("Percentage must be a number between 0 and 100");
    }
    return percentage;
  }

  addItem(product, quantity) {
    if (!(product instanceof Product)) {
      throw new ShopError("Invalid Product input");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ShopError("Product quantity must be a positive integer");
    }

    if (product.stock < quantity) {
      throw new ShopError("Stock is not available");
    }
    const previousQuantity = this.#items.get(product) || 0;
    this.#items.set(product, previousQuantity + quantity);

    product.stock -= quantity;

    return this;
  }

  applyDiscount(percent) {
    this.#discountPercent = this.validatePercentage(percent);
    return this;
  }
  getSubtotal() {
    return this.getFilePrice() * this.quantity;
  }
}
class OrderProcessor {}
