class LibraryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LibraryError";
  }
}

abstract class LibraryItem {
  private id: string;
  protected title: string;
  protected author: string;
  private static totalItem: number = 0;

  constructor(title: string, author: string) {
    this.title = title;
    this.author = author;
    this.id = this.generateID();
    LibraryItem.totalItem++;
  }

  private generateID(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  getID(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getSummary(): string {
    return `[${this.id}] ${this.title} by ${this.author}`;
  }

  abstract borrow(): string;

  getType(): string {
    return "Generic";
  }

  static getTotalItem(): number {
    return LibraryItem.totalItem;
  }

  static create(
    type: string,
    title: string,
    author: string,
    extra: string | number,
  ): LibraryItem {
    if (type === "book") {
      return new Book(title, author, extra as string);
    }

    if (type === "magazine") {
      return new Magazine(title, author, extra as number);
    }

    if (type === "dvd") {
      return new DVD(title, author, extra as number);
    }

    throw new LibraryError(`Unknown type: ${type}`);
  }
}

class Book extends LibraryItem {
  private isbn: string;

  constructor(title: string, author: string, isbn: string) {
    super(title, author);
    this.isbn = isbn;
  }

  borrow(): string {
    return `Book: ${this.title} borrowed`;
  }

  getType(): string {
    return "Book";
  }
}

class Magazine extends LibraryItem {
  private issueNumber: number;

  constructor(title: string, author: string, issueNumber: number) {
    super(title, author);
    this.issueNumber = issueNumber;
  }

  borrow(): string {
    return `Magazine: ${this.title} issue ${this.issueNumber} borrowed`;
  }

  getType(): string {
    return "Magazine";
  }
}

class DVD extends LibraryItem {
  private duration: number;

  constructor(title: string, author: string, duration: number) {
    super(title, author);
    this.duration = duration;
  }

  borrow(): string {
    return `DVD: ${this.title} (${this.duration} mins) borrowed`;
  }

  getType(): string {
    return "DVD";
  }
}

class Library {
  private items: LibraryItem[] = [];

  addItem(item: LibraryItem): this {
    if (!(item instanceof LibraryItem)) {
      throw new LibraryError("Invalid Library Item");
    }

    this.items.push(item);

    return this;
  }

  findById(id: string): LibraryItem {
    for (const item of this.items) {
      if (item.getID() === id) {
        return item;
      }
    }

    throw new LibraryError("Item not found");
  }

  borrowItem(id: string): string {
    const item = this.findById(id);

    return item.borrow();
  }

  getAllTypes(): string[] {
    const types: string[] = [];

    for (const item of this.items) {
      types.push(item.getType());
    }

    return types;
  }
}

const book = LibraryItem.create(
  "book",
  "The Alchemist",
  "Paulo Coelho",
  "9780061122415"
);

const magazine = LibraryItem.create(
  "magazine",
  "Time Magazine",
  "Time Editorial Team",
  125
);

const dvd = LibraryItem.create(
  "dvd",
  "Inception",
  "Christopher Nolan",
  148
);

console.log(book.getID());
console.log(book.getTitle());
console.log(book.getAuthor());
console.log(book.getSummary());
console.log(book.borrow());
console.log(book.getType());

console.log(magazine.getID());
console.log(magazine.getTitle());
console.log(magazine.getAuthor());
console.log(magazine.getSummary());
console.log(magazine.borrow());
console.log(magazine.getType());

console.log(dvd.getID());
console.log(dvd.getTitle());
console.log(dvd.getAuthor());
console.log(dvd.getSummary());
console.log(dvd.borrow());
console.log(dvd.getType());

console.log(LibraryItem.getTotalItem());

const library = new Library();

library
  .addItem(book)
  .addItem(magazine)
  .addItem(dvd);

console.log(library.findById(book.getID()).getSummary());
console.log(library.findById(magazine.getID()).getSummary());
console.log(library.findById(dvd.getID()).getSummary());

console.log(library.borrowItem(book.getID()));
console.log(library.borrowItem(magazine.getID()));
console.log(library.borrowItem(dvd.getID()));

console.log(library.getAllTypes());

console.log(LibraryItem.getTotalItem());

try {
  library.findById("invalid-id");
} catch (error) {
  console.log(error);
}

try {
  library.addItem({} as LibraryItem);
} catch (error) {
  console.log(error);
}

try {
  LibraryItem.create(
    "phone",
    "iPhone",
    "Apple",
    "123"
  );
} catch (error) {
  console.log(error);
}