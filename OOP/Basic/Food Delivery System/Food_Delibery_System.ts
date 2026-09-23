class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

abstract class OrderItem {
  private id: string;
  private name: string;
  private price: number;
  private static totalItems: number = 0;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
    this.id = this.generateId();
    OrderItem.totalItems++;
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }

  getSummary(): string {
    return `[${this.id}] ${this.name} - $${this.price}`;
  }

  abstract getFinalPrice(): number;

  getCategory(): string {
    return "Generic";
  }

  static getTotalItems(): number {
    return OrderItem.totalItems;
  }

  static create(
    type: string,
    name: string,
    price: number,
    extra: string | boolean | OrderItem[]
  ): OrderItem {
    if (type === "food") return new FoodItem(name, price, extra as boolean);
    if (type === "drink") return new DrinkItem(name, price, extra as string);
    if (type === "combo") return new ComboItem(name, price, extra as OrderItem[]);
    throw new OrderError(`Unknown type: ${type}`);  
  }
}

class FoodItem extends OrderItem {
  private isVeg: boolean;

  constructor(name: string, price: number, isVeg: boolean) {
    super(name, price);
    this.isVeg = isVeg;
  }

  getFinalPrice(): number {
    const base = this.getPrice();
    const taxRate = this.isVeg ? 0.05 : 0.10;
    return base + base * taxRate;
  }

  getCategory(): string {
    return "Food";
  }
}

class DrinkItem extends OrderItem {
  private size: string;

  constructor(name: string, price: number, size: string) {
    super(name, price);
    this.size = size;
  }

  getFinalPrice(): number {
    const base = this.getPrice();
    if (this.size === "small") return base;
    if (this.size === "medium") return base + base * 0.10;
    if (this.size === "large") return base + base * 0.20;
    return base;   
  }

  getCategory(): string {
    return "Drink";
  }
}

class ComboItem extends OrderItem {
  private items: OrderItem[];

  constructor(name: string, price: number, items: OrderItem[] = []) {
    super(name, price);
    this.items = items;
  }

  getFinalPrice(): number {
    const base = this.getPrice();
    return base - base * 0.15;
  }

  getCategory(): string {
    return "Combo";
  }
}

class Order {
  private customerName: string;
  private orderId: string;
  private items: OrderItem[] = [];
  private discount: number = 0;
  private static totalOrders: number = 0;

  constructor(customerName: string) {
    this.customerName = customerName;
    this.orderId = this.generateOrderId();
    Order.totalOrders++;
  }
  private generateOrderId(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  getCustomerName(): string {
    return this.customerName;
  }

  addItem(item: OrderItem): this {
    if (!(item instanceof OrderItem)) {
      throw new OrderError("Invalid order item");   
    }
    this.items.push(item);
    return this;
  }

  applyDiscount(percent: number): this {
    if (typeof percent !== "number" || percent < 0 || percent > 100) {
      throw new OrderError("Discount must be between 0 and 100");   
    }
    this.discount = percent;
    return this;
  }

  getTotal(): number {
    let subTotal: number = 0;
    for (const item of this.items) {
      subTotal += item.getFinalPrice();
    }
    const finalTotal = subTotal - subTotal * (this.discount / 100);
    return finalTotal;
  }

  getAllCategories(): string[] {
    return this.items.map(item => item.getCategory());
  }

  getOrderSummary(): string {
    return `Order ${this.orderId} for ${this.customerName}: $${this.getTotal()}`;
  }

  static getTotalOrders(): number {
    return Order.totalOrders;
  }
}

const f1 = OrderItem.create("food", "Burger", 100, true);
const f2 = OrderItem.create("food", "Chicken", 200, false);
const d1 = OrderItem.create("drink", "Coke", 50, "medium");
const c1 = OrderItem.create("combo", "Family Pack", 500, []);

console.log(f1.getSummary());
console.log(f1.getFinalPrice());
console.log(f2.getFinalPrice());
console.log(d1.getFinalPrice());
console.log(c1.getFinalPrice());

console.log(f1.getCategory());
console.log(d1.getCategory());
console.log(c1.getCategory());

const order = new Order("Atik");
order.addItem(f1).addItem(d1).addItem(c1);

console.log(order.getTotal());
console.log(order.getAllCategories());
console.log(order.getOrderSummary());

order.applyDiscount(10);
console.log(order.getTotal());
console.log(order.getOrderSummary());

console.log(OrderItem.getTotalItems());
console.log(Order.getTotalOrders());

