class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskError";
  }
}

abstract class Task {
  private static generatedIds = new Set<string>();
  private static globalCounter = 0;

  readonly id!: string;
  private _title: string;
  private _priority: string;
  private _completed = false;

  constructor(title: string, priority: string) {
    if (new.target === Task) {
      throw new TaskError("Task is abstract");
    }

    let id: string;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Task.generatedIds.has(id));
    Task.generatedIds.add(id);

    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    this._title = this.validateTitle(title);
    this._priority = this.validatePriority(priority);
    Task.globalCounter++;
  }

  get title(): string { return this._title; }
  set title(v: string) { this._title = this.validateTitle(v); }

  get priority(): string { return this._priority; }
  set priority(v: string) { this._priority = this.validatePriority(v); }

  private validateTitle(title: string): string {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must be at least 3 characters");
    }
    return title.trim();
  }

  private validatePriority(priority: string): string {
    const valid = ["low", "medium", "high"];
    if (typeof priority !== "string" || !valid.includes(priority.toLowerCase())) {
      throw new TaskError("Priority must be low, medium, or high");
    }
    return priority.toLowerCase();
  }

  async complete(): Promise<this> {
    await new Promise<void>((r) => setTimeout(r, 100));
    this._completed = true;
    return this;
  }

  isComplete(): boolean {
    return this._completed;
  }

  getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this._completed ? "Completed" : "Not Completed"}]`;
  }

  static getTotalTasks(): number {
    return Task.globalCounter;
  }

  static create(type: string, title: string, priority: string, extra?: string | Date): Task {
    if (type === "simple") return new SimpleTask(title, priority);
    if (type === "recurring") return new RecurringTask(title, priority, extra as string);
    if (type === "deadline") return new DeadlineTask(title, priority, extra as Date | string);
    throw new TaskError(`Unknown task type: ${type}`);
  }
}

class SimpleTask extends Task {
  getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.isComplete() ? "Completed" : "Not Completed"}]`;
  }
}

const createSimpleTaskClosure = (() => {
  const usedIds = new Set<string>();
  return (title: string, priority: string) => {
    let id: string;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (usedIds.has(id));
    usedIds.add(id);

    const valid = ["low", "medium", "high"];
    if (typeof title !== "string" || title.trim().length < 3) throw new TaskError("Title must be at least 3 characters");
    if (typeof priority !== "string" || !valid.includes(priority.toLowerCase())) throw new TaskError("Priority must be low, medium, or high");

    let _title = title.trim();
    let _priority = priority.toLowerCase();
    let _completed = false;

    return {
      getId: () => id,
      getTitle: () => _title,
      getPriority: () => _priority,
      setTitle(v: string) {
        if (typeof v !== "string" || v.trim().length < 3) throw new TaskError("Title must be at least 3 characters");
        _title = v.trim();
      },
      async complete() { await new Promise<void>((r) => setTimeout(r, 100)); _completed = true; return this; },
      isComplete: () => _completed,
      getSummary: () => `[${id}] [${_title}] (${_priority}) - [${_completed ? "Completed" : "Not Completed"}]`,
    };
  };
})();

class RecurringTask extends Task {
  readonly frequency: string;

  constructor(title: string, priority: string, frequency: string) {
    super(title, priority);
    const valid = ["daily", "weekly", "monthly"];
    if (typeof frequency !== "string" || !valid.includes(frequency.toLowerCase())) {
      throw new TaskError("Frequency must be daily, weekly, or monthly");
    }
    this.frequency = frequency.toLowerCase();
  }

  override getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - Recurring (${this.frequency}) - [${this.isComplete() ? "Completed" : "Not Completed"}]`;
  }
}

class DeadlineTask extends Task {
  readonly deadline: Date;

  constructor(title: string, priority: string, deadline: Date | string | number) {
    super(title, priority);
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) throw new TaskError("Deadline must be a valid date");
    if (d.getTime() < Date.now()) throw new TaskError("Deadline cannot be in the past");
    this.deadline = d;
  }

  override getSummary(): string {
    return `[${this.id}] [${this.title}] (${this.priority}) - Due: ${this.deadline.toISOString().split("T")[0]} - [${this.isComplete() ? "Completed" : "Not Completed"}]`;
  }
}

class Project {
  private taskList: Task[] = [];
  readonly name: string;

  constructor(name: string) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TaskError("Project name cannot be empty");
    }
    this.name = name.trim();
  }

  addTask(task: Task): this {
    if (!(task instanceof Task)) throw new TaskError("Invalid task instance");
    if (this.taskList.includes(task)) throw new TaskError("Task already exists in project");
    this.taskList.push(task);
    return this;
  }

  removeTaskById(id: string): boolean {
    const before = this.taskList.length;
    this.taskList = this.taskList.filter((t) => t.id !== id);
    return this.taskList.length < before;
  }

  getAllTasks(): Task[] { return [...this.taskList]; }
  getTotalTasks(): number { return this.taskList.length; }

  findTaskById(id: string): Task {
    const t = this.taskList.find((t) => t.id === id);
    if (!t) throw new TaskError("Task not found");
    return t;
  }

  getIncompleteTasks(): Task[] {
    return this.taskList.filter((t) => !t.isComplete());
  }

  getTasksByPriority(priority: string): Task[] {
    if (typeof priority !== "string") throw new TaskError("Invalid priority");
    const valid = ["low", "medium", "high"];
    const norm = priority.toLowerCase();
    if (!valid.includes(norm)) throw new TaskError("Priority must be low, medium, or high");
    return this.taskList.filter((t) => t.priority === norm);
  }
}

class TaskManager {
  private projects: Project[] = [];
  private tasks = new Map<string, Task>();

  registerProject(project: Project): this {
    if (!(project instanceof Project)) throw new TaskError("Invalid project");
    if (this.projects.includes(project)) throw new TaskError("Project already registered");
    for (const t of project.getAllTasks()) {
      if (this.tasks.has(t.id)) throw new TaskError(`Task already registered: ${t.id}`);
    }
    this.projects.push(project);
    for (const t of project.getAllTasks()) this.tasks.set(t.id, t);
    return this;
  }

  registerTask(task: Task, project: Project): this {
    if (!(task instanceof Task)) throw new TaskError("Invalid task");
    if (!(project instanceof Project)) throw new TaskError("Invalid project");
    if (this.tasks.has(task.id)) throw new TaskError(`Task already registered: ${task.id}`);
    if (!this.projects.includes(project)) this.projects.push(project);
    project.addTask(task);
    this.tasks.set(task.id, task);
    return this;
  }

  unregisterTask(id: string): Task {
    const t = this.tasks.get(id);
    if (!t) throw new TaskError("Task not found");
    this.tasks.delete(id);
    for (const p of this.projects) p.removeTaskById(id);
    return t;
  }

  getTotalTasks(): number { return this.tasks.size; }

  getAllTasks(): Task[] { return [...this.tasks.values()]; }

  findTaskById(id: string): Task {
    const t = this.tasks.get(id);
    if (!t) throw new TaskError("Task not found");
    return t;
  }

  getAllProjects(): Project[] { return [...this.projects]; }
}

