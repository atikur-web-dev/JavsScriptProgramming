import { ShopError } from "../errors/ShopError";
import { Product } from "../Product/Product";
import { Customer } from "../Customer/Customer";
import { Order } from "../Order/Order";

export class OrderProcessor {
    #orders = new Map();
    #customers = new Map();
    #products = new Map();
}