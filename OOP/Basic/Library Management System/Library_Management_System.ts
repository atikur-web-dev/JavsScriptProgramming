// Custom Error
class LibraryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Library Error";
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
    return `[${this.id}] [${this.title} by ${this.author}]`;
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
  ) {
    if (type === "book") {
      return new Book(title, author, extra as string);
    }
    if (type === "magazine") {
      return new Magazine(title, author, extra as number);
    }
    if (type === "dvd") {
      return new DVD(title, author, extra as number);
    }
  }
}

class Book extends LibraryItem {
  private isban: string;
  constructor(title: string, author: string, isban: string) {
    super(title, author);
    this.isban = isban;
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
    return `Magazine : ${this.title} issue ${this.issueNumber} borrowed`;
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
    return `DVD ${this.title} (${this.duration} mins) borrowed`;
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
    throw new LibraryError("Item not Found");
  }
  borrowItem(id: string): string {
    const item = this.findById(id);
    return item.borrow();
  }
  getAllTypes(): string[] {
    const type: string[] = [];
    for (const item of this.items) {
      type.push(item.getType());
    }
    return type;
  }
}
