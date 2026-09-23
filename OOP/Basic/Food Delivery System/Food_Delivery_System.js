class OrderError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrderError";
  }
}

class OrderItem {
  #name;
  #id;
  #price;

  static #totalItems = 0;

  constructor(name, price) {
    this.#name = name;
    this.#price = price;

    OrderItem.#totalItems++;

    this.#id = this.#generateId();
  }

  #generateId() {
    return Math.random().toString(36).slice(2, 8);
  }

  getId() {
    return this.#id;
  }

  getPrice() {
    return this.#price;
  }

  getName() {
    return this.#name;
  }

  getSummary() {
    return `[${this.#id}] ${this.#name} - $${this.#price}`;
  }

  getFinalPrice() {
    throw new OrderError(
      "getFinalPrice() must be implemented by subclass"
    );
  }

  getCategory() {
    return "Generic";
  }

  static getTotalItems() {
    return OrderItem.#totalItems;
  }

  static create(type, name, price, extra) {
    if (type === "food") {
      return new FoodItem(name, price, extra);
    }

    if (type === "drink") {
      return new DrinkItem(name, price, extra);
    }

    if (type === "combo") {
      return new ComboItem(name, price, extra);
    }

    throw new OrderError(`Unknown type: ${type}`);
  }
}

class FoodItem extends OrderItem {
  #isVeg;

  constructor(name, price, isVeg) {
    super(name, price);
    this.#isVeg = isVeg;
  }

  getFinalPrice() {
    const base = this.getPrice();
    const taxRate = this.#isVeg ? 0.05 : 0.1;

    return base + base * taxRate;
  }

  getCategory() {
    return "Food";
  }
}

class DrinkItem extends OrderItem {
  #size;

  constructor(name, price, size) {
    super(name, price);
    this.#size = size;
  }

  getFinalPrice() {
    const base = this.getPrice();

    if (this.#size === "small") {
      return base;
    }

    if (this.#size === "medium") {
      return base + base * 0.1;
    }

    if (this.#size === "large") {
      return base + base * 0.2;
    }

    return base;
  }

  getCategory() {
    return "Drink";
  }
}

class ComboItem extends OrderItem {
  #items;

  constructor(name, price, items) {
    super(name, price);
    this.#items = items;
  }

  getFinalPrice() {
    const base = this.getPrice();

    return base - base * 0.15;
  }

  getCategory() {
    return "Combo";
  }
}

class Order {
  #customerName;
  #orderId;
  #items = [];
  #discount = 0;

  static #totalOrders = 0;

  constructor(customerName) {
    this.#customerName = customerName;
    this.#orderId = this.#generateOrderId();

    Order.#totalOrders++;
  }

  #generateOrderId() {
    return Math.random().toString(36).slice(2, 8);
  }

  getCustomerName() {
    return this.#customerName;
  }

  addItem(item) {
    if (!(item instanceof OrderItem)) {
      throw new OrderError("Invalid order item");
    }

    this.#items.push(item);

    return this;
  }

  applyDiscount(percent) {
    if (
      typeof percent !== "number" ||
      percent < 0 ||
      percent > 100
    ) {
      throw new OrderError("Discount must be between 0 and 100");
    }

    this.#discount = percent;

    return this;
  }

  getTotal() {
    let subTotal = 0;

    for (const item of this.#items) {
      subTotal += item.getFinalPrice();
    }

    const finalTotal =
      subTotal - subTotal * (this.#discount / 100);

    return finalTotal;
  }

  getAllCategories() {
    return this.#items.map((item) => item.getCategory());
  }

  getOrderSummary() {
    return `Order ${this.#orderId} for ${this.#customerName}: $${this.getTotal()}`;
  }

  static getTotalOrders() {
    return Order.#totalOrders;
  }
}

const f1 = OrderItem.create("food", "Burger", 100, true);
const f2 = OrderItem.create("food", "Chicken", 200, false);
const d1 = OrderItem.create("drink", "Coke", 50, "medium");
const c1 = OrderItem.create(
  "combo",
  "Family Pack",
  500,
  ["Burger", "Fries", "Coke"]
);

console.log(f1.getSummary());

console.log(f1.getFinalPrice());
console.log(f2.getFinalPrice());
console.log(d1.getFinalPrice());
console.log(c1.getFinalPrice());

console.log(f1.getCategory());
console.log(d1.getCategory());
console.log(c1.getCategory());

const order = new Order("Atikur");

order
  .addItem(f1)
  .addItem(d1)
  .addItem(c1);

console.log(order.getTotal());

console.log(order.getAllCategories());

console.log(order.getOrderSummary());

order.applyDiscount(10);

console.log(order.getTotal());

console.log(order.getOrderSummary());

console.log(OrderItem.getTotalItems());
console.log(Order.getTotalOrders());