export class ShopError extends Error {
    constructor(message) {
        super(message);
        this.name = "ShopError";
    }
}
