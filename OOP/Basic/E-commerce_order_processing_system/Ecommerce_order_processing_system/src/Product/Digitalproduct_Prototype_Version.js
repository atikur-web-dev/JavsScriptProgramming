import { ShopError } from "../errors/ShopError";
import { Product } from "./Product";

function digitalProduct(name, basePrice, stock, fileSize) {
  Product.call(this, name, basePrice, stock);
  if (typeof fileSize != "number" || fileSize < 0) {
    throw new ShopError("File size Must be a Postive Number");
  }
  this.fileSize = fileSize;
}

digitalProduct.prototype = Object.create(Product.prototype);
digitalProduct.prototype.constructor = digitalProduct;

digitalProduct.prototype.getFileSize = function () {
  return this.fileSize;
};

digitalProduct.prototype.getFinalPrice = function () {
  return this.basePrice;
};

digitalProduct.prototype.getInfo = function () {
  return `[${this.sku}] [${this.name}] - $${this.basePrice} (${this.getFileSize()} 
    MB, Stock: ${this.stock})`;
};
