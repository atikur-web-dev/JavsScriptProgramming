class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskError";
  }
}

class Task {
  static #generateIDs = new Set();
  static globalTaskCounter = 0;
  #title;
  #priority;
  completed = false;
  constructor(title, priority) {
    if (new.target === Task) {
      throw new TaskError(
        "Task is an abstract class and cannot be instantiated directly",
      );
    }
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Task.#generateIDs.has(id));
    Task.#generateIDs.add(id);
    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    this.#title = title;
    this.#priority = priority;
    Task.globalTaskCounter++;
  }
  get title() {
    return this.#title;
  }
  set title(newTitle) {
    this.#title = this.validateTitle(newTitle);
  }
  validateTitle(title) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must be 3 char");
    }
    return title.trim();
  }
  get priority() {
    return this.#priority;
  }
  set priority(newPriority) {
    this.#priority = this.validatePriority(newPriority);
  }
  validatePriority(priority) {
    const validPriority = ["low", "medium", "high"];
    if (
      typeof priority !== "string" ||
      !validPriority.includes(priority.toLowerCase())
    ) {
      throw new TaskError("Priority must be Low Medium or High");
    }
    return priority.toLowerCase();
  }
  complete() {
    this.completed = true;
  }
  completeStatus() {
    this.completed ? "Completed" : "Not Completed";
  }
  getId() {
    return this.id;
  }
  getSummary() {
    return `[${this.getId()}] [${this.title}] (${this.priority}) - [${this.completeStatus()}]`;
  }
  static getTotalTask() {
    return Task.getTotalTask;
  }
  static create(type, title, priority, extra) {
    if (type === "simple") return new SimpleTask(title, priority);
    if (type === "recurring") return new RecurringTask(title, priority, extra);
    if (type === "deadline") return new Deadline(title, priority, extra);
    throw new TaskError(`Unknown task type : ${type}`);
  }
}

class SimpleTask extends Task {
  constructor(title, priority) {
    super(title, priority)
  }
  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.completeStatus()}]`;
  }
}

function createSimpleTask(title, priority) {
  let _id;
  let _title;
  let _priority;
  let _completed;
  const generatedIds = new Set();
  let id;
  do{
    id = Math.random().toString(36).slice(2,9);
  } while (generatedIds.has(id));
  _id = id;
  
}