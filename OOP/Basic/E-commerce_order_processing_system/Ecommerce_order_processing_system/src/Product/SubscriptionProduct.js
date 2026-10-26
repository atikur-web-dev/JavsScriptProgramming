import { ShopError } from "../errors/ShopError";
import { Product } from "./Product";

export class SubscriptionProduct extends Product {
  #duration;
  #discountPercent;
  constructor(name, basePrice, stock, duration, discountPercent) {
    super(name, basePrice, stock);
    this.duration = duration;
    this.discountPercent = discountPercent;
  }
  get duration() {
    return this.#duration;
  }
  set duration(newDuration) {
    this.#duration = this.validateDuration(newDuration);
  }
  validateDuration(duration) {
    if (
      typeof duration != "number" ||
      duration < 0 ||
      !Number.isInteger(duration)
    ) {
      throw new ShopError("Duraton must be Positive Integer");
    }
    return duration;
  }
  get discountPercent() {
    this.#discountPercent;
  }
  set discountPercent(newDiscountPercentage) {
    this.#discountPercent = this.validateDiscountPercentage(
      newDiscountPercentage,
    );
  }
  validateDiscountPercentage(value) {
    if (typeof value != "number" || value < 0 || value > 100) {
      throw new ShopError("Discount Percentage Must be a Number");
    }
    return value;
  }
  getFinalPrice() {
    const total = this.basePrice * this.#duration;
    return total - total * (this.#discountPercent / 100);
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] - $${this.getFinalPrice()} (${this.#duration} 
    months, Stock: ${this.stock})`;
  }
}
