class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskError";
  }
}

class Task {
  static taskCounter = 0;
  static #generateIds = new Set();

  #title;
  #priority;
  completed = false;

  constructor(title, priority) {
    if (new.target === Task) {
      throw new TaskError(
        "Task is an Abstract class and cannot be instantiated directly",
      );
    }
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Task.#generateIds.has(id));
    Task.#generateIds.add(id);

    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    this.title = title;
    this.priority = priority;
    Task.taskCounter++;
  }

  get title() {
    return this.#title;
  }
  set title(newTitle) {
    this.#title = this.validateTitle(newTitle);
  }

  get priority() {
    return this.#priority;
  }
  set priority(newPriority) {
    this.#priority = this.validatePriority(newPriority);
  }

  validateTitle(title) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must contain at least 3 characters");
    }
    return title.trim();
  }

  validatePriority(priority) {
    const validPriorities = ["low", "medium", "high"];
    if (
      typeof priority !== "string" ||
      !validPriorities.includes(priority.toLowerCase())
    ) {
      throw new TaskError("Task must be low, medium or high");
    }
    return priority.toLowerCase();
  }

  getId() {
    return this.id;
  }

  async complete() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.completed = true;
    return this;
  }

  completeStatus() {
    return this.completed ? "Complete" : "Not completed";
  }

  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.completeStatus()}]`;
  }
  static getTotalTasks() {
    return Task.taskCounter;
  }
  static create(type, title, priority, extra) {
    if (type === "simple") return new SimpleTask(title, priority);
    if (type === "recurring") return new RecurringTask(title, priority, extra);
    if (type === "deadline") return new DeadlineTask(title, priority, extra);
    throw new TaskError(`Unknown Task Type : ${type}`);
  }
}
