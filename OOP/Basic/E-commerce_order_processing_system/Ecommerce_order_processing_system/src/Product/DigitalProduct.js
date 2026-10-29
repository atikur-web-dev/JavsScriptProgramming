import { ShopError } from "../errors/ShopError";
import { Product } from "./Product";

export class DigitalProduct extends Product {
  #fileSize;
  constructor(name, basePrice, stock, fileSize) {
    super(name, basePrice, stock);
    this.fileSize = fileSize;
  }
  get fileSize() {
    return this.#fileSize;
  }
  set fileSize(newFileSize) {
    this.#fileSize = this.validateFileSize(newFileSize);
  }
  validateFileSize(fileSize) {
    if (typeof fileSize != "number" || fileSize < 0) {
      throw new ShopError("File size Must be a Postive Number");
    }
    return fileSize;
  }
  getFinalPrice() {
    return super.basePrice;
  }
  getInfo() {
    return `[${this.sku}] [${this.name}] - $${this.basePrice} (${this.getFileSize()} MB, Stock:          ${this.stock})`;
  }
}
