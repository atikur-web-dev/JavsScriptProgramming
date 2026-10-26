import { ShopError } from "../errors/ShopError";
import { Product } from "./Product";

export class PhysicalProduct extends Product {
  #weight;
  constructor(name, basePrice, stock, weight) {
    super(name, basePrice, stock);
    this.weight = weight;
  }
  get weight() {
    return this.#weight;
  }
  set weight(newWeight) {
    this.#weight = this.validateWeight(newWeight);
  }
  validateWeight(weight) {
    if (typeof weight != "number" || weight < 0) {
      throw new ShopError("Weight cannot be String or Negative value");
    }
    return weight;
  }
  shippingCost() {
    return this.weight * 2;
  }
  getFinalPrice() {
    let TotalPrice = super.basePrice + this.shippingCost();
    return TotalPrice;
  }
}
