class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskError";
  }
}

abstract class Task {
  static generateIds: Set<string> = new Set();
  static globalCounter: number = 0;

  #title!: string;
  #priority!: string;
  #completed: boolean = false;
  readonly id!: string;

  constructor(title: string, priority: string) {
    if (new.target === Task) {
      throw new TaskError("Task is an abstract class");
    }
    this.initialize(title, priority);
  }

  initialize(title: string, priority: string): void {
    let id: string;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Task.generateIds.has(id));
    Task.generateIds.add(id);

    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    this.title = title;
    this.priority = priority;
    Task.globalCounter++;
  }

  get title(): string {
    return this.#title;
  }
  set title(v: string) {
    this.#title = this.validateTitle(v);
  }

  get priority(): string {
    return this.#priority;
  }
  set priority(v: string) {
    this.#priority = this.validatePriority(v);
  }

  validateTitle(title: string): string {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must be at least 3 characters");
    }
    return title.trim();
  }

  validatePriority(priority: string): string {
    const valid = ["low", "medium", "high"];
    if (
      typeof priority !== "string" ||
      !valid.includes(priority.toLowerCase())
    ) {
      throw new TaskError("Priority must be low, medium, or high");
    }
    return priority.toLowerCase();
  }

  async complete(): Promise<this> {
    await new Promise<void>((r) => setTimeout(r, 100));
    this.#completed = true;
    return this;
  }

  isComplete(): "Completed" | "Not Completed" {
    return this.#completed ? "Completed" : "Not Completed";
  }

  static getGlobalCounter(): number {
    return Task.globalCounter;
  }

  abstract getSummary(): string;
}

class SimpleTask extends Task {
  getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.isComplete()}]`;
  }
}

type SimpleTaskClosure = {
  getID(): string;
  getTitle(): string;
  getPriority(): string;
  setTitle(v: string): void;
  setPriority(v: string): void;
  complete(): Promise<SimpleTaskClosure>;
  isComplete(): "Completed" | "Not Completed";
  getSummary(): string;
};

const closureIds = new Set<string>();

function simpleTask(title: string, priority: string): SimpleTaskClosure {
  let id: string;
  do {
    id = Math.random().toString(36).slice(2, 9);
  } while (closureIds.has(id));
  closureIds.add(id);

  const valid = ["low", "medium", "high"];
  if (typeof title !== "string" || title.trim().length < 3) {
    throw new TaskError("Title must be at least 3 characters");
  }
  if (typeof priority !== "string" || !valid.includes(priority.toLowerCase())) {
    throw new TaskError("Priority must be low, medium, or high");
  }

  let _title = title.trim();
  let _priority = priority.toLowerCase();
  let _completed = false;

  return {
    getID: () => id,
    getTitle: () => _title,
    getPriority: () => _priority,
    setTitle(v: string) {
      if (typeof v !== "string" || v.trim().length < 3) {
        throw new TaskError("Title must be at least 3 characters");
      }
      _title = v.trim();
    },
    setPriority(v: string) {
      if (typeof v !== "string" || !valid.includes(v.toLowerCase())) {
        throw new TaskError("Priority must be low, medium, or high");
      }
      _priority = v.toLowerCase();
    },
    async complete() {
      await new Promise<void>((r) => setTimeout(r, 100));
      _completed = true;
      return this;
    },
    isComplete: () => (_completed ? "Completed" : "Not Completed"),
    getSummary: () =>
      `[${id}] [${_title}] (${_priority}) - [${_completed ? "Completed" : "Not Completed"}]`,
  };
}

interface RecurringTask extends Task {
  frequency: string;
  getSummary(): string;
}

const RecurringTask = function (
  this: RecurringTask,
  title: string,
  priority: string,
  frequency: string,
) {
  Task.prototype.initialize.call(this, title, priority);
  const valid = ["daily", "weekly", "monthly"];
  if (
    typeof frequency !== "string" ||
    !valid.includes(frequency.trim().toLowerCase())
  ) {
    throw new TaskError("Frequency must be daily, weekly, or monthly");
  }
  this.frequency = frequency.trim().toLowerCase();
} as unknown as {
  new (title: string, priority: string, frequency: string): RecurringTask;
  prototype: RecurringTask;
};

RecurringTask.prototype = Object.create(Task.prototype);
RecurringTask.prototype.constructor = RecurringTask;
RecurringTask.prototype.getSummary = function (this: RecurringTask): string {
  return `[${this.id}] [${this.title}] (${this.priority}) - Recurring (${this.frequency}) - [${this.isComplete()}]`;
};

class DeadlineTask extends Task {
  deadline: Date;

  constructor(
    title: string,
    priority: string,
    deadline: Date | number | string,
  ) {
    super(title, priority);
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime()))
      throw new TaskError("Deadline must be a valid date");
    if (d.getTime() < Date.now())
      throw new TaskError("Deadline cannot be in the past");
    this.deadline = d;
  }

  getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - Due: ${this.deadline} - [${this.isComplete()}]`;
  }
}

class Project {
  #taskList: Task[] = [];
  name: string;

  constructor(name: string) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TaskError("Project Name Cannot be Empty");
    }
    this.name = name.trim();
  }

  addTask(task: Task): this {
    if (!(task instanceof Task)) throw new TaskError("Invalid Input Type");
    if (this.#taskList.includes(task))
      throw new TaskError("Task Already in the List");
    this.#taskList.push(task);
    return this;
  }

  removeTaskByID(id: string): boolean {
    const before = this.#taskList.length;
    this.#taskList = this.#taskList.filter((t) => t.id !== id);
    return this.#taskList.length < before;
  }

  getAllTask(): Task[] {
    return [...this.#taskList];
  }
  getTotalTask(): number {
    return this.#taskList.length;
  }

  findTaskById(id: string): Task {
    const t = this.#taskList.find((t) => t.id === id);
    if (!t) throw new TaskError("Task could not found");
    return t;
  }

  getIncompleteTasks(): Task[] {
    return this.#taskList.filter((t) => t.isComplete() === "Not Completed");
  }

  getTasksByPriority(priority: string): Task[] {
    if (typeof priority !== "string") throw new TaskError("Invalid input");
    const valid = ["low", "medium", "high"];
    const norm = priority.toLowerCase();
    if (!valid.includes(norm))
      throw new TaskError("Priority must be low, medium or high");
    return this.#taskList.filter((t) => t.priority === norm);
  }
}

class TaskManager {
  #projects: Project[] = [];
  #task: Map<string, Task> = new Map();

  constructor() {
    this.getAllTasks = this.getAllTasks.bind(this);
    this.getTotalTasks = this.getTotalTasks.bind(this);
  }

  registerProject(project: Project): this {
    if (!(project instanceof Project))
      throw new TaskError("Invalid Project Input");
    if (this.#projects.includes(project))
      throw new TaskError("Project already registered");
    for (const t of project.getAllTask()) {
      if (this.#task.has(t.id)) throw new TaskError("Id already registered");
    }
    this.#projects.push(project);
    for (const t of project.getAllTask()) this.#task.set(t.id, t);
    return this;
  }

  registerTask(task: Task, project: Project): this {
    if (!(task instanceof Task)) throw new TaskError("Invalid Task Input");
    if (this.#task.has(task.id)) throw new TaskError("Task already registered");
    if (!(project instanceof Project))
      throw new TaskError("Invalid Project Input");
    if (!this.#projects.includes(project)) this.#projects.push(project);
    project.addTask(task);
    this.#task.set(task.id, task);
    return this;
  }

  unregisterTask(id: string): Task {
    const t = this.#task.get(id);
    if (!t) throw new TaskError("Task could not found");
    this.#task.delete(id);
    for (const p of this.#projects) p.removeTaskByID(id);
    return t;
  }

  getTotalTasks(): number {
    return this.#task.size;
  }

  async getAllTasks(): Promise<Task[]> {
    queueMicrotask(() => console.log("microtask: inside getAllTasks"));
    await new Promise<void>((r) => setTimeout(r, 0));
    console.log("macrotask: after setTimeout in getAllTasks");
    return [...this.#task.values()];
  }

  findTaskById(id: string): Task {
    const t = this.#task.get(id);
    if (!t) throw new TaskError("Task Could not found");
    return t;
  }

  getAllProjects(): Project[] {
    return [...this.#projects];
  }
}
