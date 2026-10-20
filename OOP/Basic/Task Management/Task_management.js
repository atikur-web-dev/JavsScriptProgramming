class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskError";
  }
}

class Task {
  static generateIds = new Set();
  static globalCounter = 0;

  #title;
  #priority;
  #completed = false;

  constructor(title, priority) {
    if (new.target === Task) {
      throw new TaskError("Task is an abstract class");
    }
    this.initialize(title, priority);
  }

  initialize(title, priority) {
    let id;
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

  get title() { return this.#title; }
  set title(newTitle) { this.#title = this.validateTitle(newTitle); }
  validateTitle(title) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must be at least 3 characters");
    }
    return title.trim();
  }

  get priority() { return this.#priority; }
  set priority(newPriority) { this.#priority = this.validatePriority(newPriority); }
  validatePriority(priority) {
    const validPriority = ["low", "medium", "high"];
    if (typeof priority !== "string" || !validPriority.includes(priority.toLowerCase())) {
      throw new TaskError("Priority must be low, medium, or high");
    }
    return priority.toLowerCase();
  }

  async complete() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.#completed = true;
    return this;
  }

  isComplete() {
    return this.#completed ? "Completed" : "Not Completed";
  }

  static getGlobalCounter() { return Task.globalCounter; }

  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.isComplete()}]`;
  }

  static create(type, title, priority, extra) {
    if (type === "simple") return new SimpleTask(title, priority);
    if (type === "recurring") return new RecurringTask(title, priority, extra);
    if (type === "deadline") return new DeadlineTask(title, priority, extra);
    throw new TaskError(`Unknown task type: ${type}`);
  }
}

class SimpleTask extends Task {
  constructor(title, priority) { super(title, priority); }
  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.isComplete()}]`;
  }
}

// Closure version
const generateGlobalIds = new Set();
function simpleTask(title, priority) {
  let id;
  do { id = Math.random().toString(36).slice(2, 9); } while (generateGlobalIds.has(id));
  generateGlobalIds.add(id);

  let _title, _priority, _completed = false;
  if (typeof title !== "string" || title.trim().length < 3) throw new TaskError("Title must be at least 3 characters");
  const validPriorities = ["low", "medium", "high"];
  if (typeof priority !== "string" || !validPriorities.includes(priority.toLowerCase())) throw new TaskError("Invalid priority");
  _title = title.trim();
  _priority = priority.toLowerCase();

  return {
    getID() { return id; },
    getTitle() { return _title; },
    getPriority() { return _priority; },
    setTitle(newTitle) {
      if (typeof newTitle !== "string" || newTitle.trim().length < 3) throw new TaskError("Title must be at least 3 characters");
      _title = newTitle.trim();
    },
    setPriority(newPriority) {
      if (typeof newPriority !== "string" || !validPriorities.includes(newPriority.toLowerCase())) throw new TaskError("Invalid priority");
      _priority = newPriority.toLowerCase();
    },
    async complete() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      _completed = true;
      return this;
    },
    isComplete() { return _completed ? "Completed" : "Not Completed"; },
    getSummary() { return `[${id}] [${_title}] (${_priority}) - [${this.isComplete()}]`; },
  };
}

function RecurringTask(title, priority, frequency) {
  Task.prototype.initialize.call(this, title, priority);
  const validFrequency = ["daily", "weekly", "monthly"];
  if (typeof frequency !== "string" || !validFrequency.includes(frequency.trim().toLowerCase())) {
    throw new TaskError("Frequency must be daily, weekly, or monthly");
  }
  this.frequency = frequency.trim().toLowerCase();
}
RecurringTask.prototype = Object.create(Task.prototype);
RecurringTask.prototype.constructor = RecurringTask;
RecurringTask.prototype.getSummary = function () {
  return `[${this.id}] [${this.title}] (${this.priority}) - Recurring (${this.frequency}) - [${this.isComplete()}]`;
};

class DeadlineTask extends Task {
  constructor(title, priority, deadline) {
    super(title, priority);
    this.deadline = this.validateDeadline(deadline);
  }
  validateDeadline(deadline) {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) throw new TaskError("Deadline must be a valid date");
    if (date.getTime() < Date.now()) throw new TaskError("Deadline cannot be in the past");
    return date;
  }
  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - Due: ${this.deadline} - [${this.isComplete()}]`;
  }
}

class Project {
  #taskList = [];
  constructor(name) { this.name = this.validateName(name); }
  validateName(name) {
    if (typeof name != "string" || name.trim().length === 0) throw new TaskError("Project Name Cannot be Empty");
    return name.trim();
  }
  addTask(task) {
    if (!(task instanceof Task)) throw new TaskError("Invalid Input Type");
    if (this.#taskList.includes(task)) throw new TaskError("Task Already in the List");
    this.#taskList.push(task);
    return this;
  }
  removeTaskByID(id) {
    const initialLength = this.#taskList.length;
    this.#taskList = this.#taskList.filter((task) => task.id !== id);
    return this.#taskList.length < initialLength;
  }
  getAllTask() { return [...this.#taskList]; }
  getTotalTask() { return this.#taskList.length; }
  findTaskById(id) {
    const task = this.#taskList.find((task) => task.id === id);
    if (!task) throw new TaskError("Task could not found");
    return task;
  }
  getIncompleteTasks() {
    return this.#taskList.filter((task) => task.isComplete() === "Not Completed");
  }
  getTasksByPriority(priority) {
    if (typeof priority != "string") throw new TaskError("Invalid input");
    const validPriority = ["low", "medium", "high"];
    const normalized = priority.toLowerCase();
    if (!validPriority.includes(normalized)) throw new TaskError("Priority must be low, medium or high");
    return this.#taskList.filter((task) => task.priority === normalized);
  }
}

class TaskManager {
  #projects = [];
  #task = new Map();
  constructor() {
    this.getAllTasks = this.getAllTasks.bind(this);
    this.getTotalTasks = this.getTotalTasks.bind(this);
  }
  registerProject(project) {
    if (!(project instanceof Project)) throw new TaskError("Invalid Project Input");
    if (this.#projects.includes(project)) throw new TaskError("Project already registered");
    for (const task of project.getAllTask()) {
      if (this.#task.has(task.id)) throw new TaskError("Id already registered");
    }
    this.#projects.push(project);
    for (const task of project.getAllTask()) {
      this.#task.set(task.id, task);
    }
    return this;
  }
  registerTask(task, project) {
    if (!(task instanceof Task)) throw new TaskError("Invalid Task Input");
    if (this.#task.has(task.id)) throw new TaskError("Task already registered");
    if (!(project instanceof Project)) throw new TaskError("Invalid Project Input");
    if (!this.#projects.includes(project)) this.#projects.push(project);
    project.addTask(task);
    this.#task.set(task.id, task);
    return this;
  }
  unregisterTask(id) {
    const task = this.#task.get(id);
    if (!task) throw new TaskError("Task could not found");
    this.#task.delete(id);
    for (const project of this.#projects) {
      project.removeTaskByID(id);
    }
    return task;
  }
  getTotalTasks() { return this.#task.size; }
  async getAllTasks() {
    queueMicrotask(() => console.log("microtask: inside getAllTasks"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log("macrotask: after setTimeout in getAllTasks");
    return [...this.#task.values()];
  }
  findTaskById(id) {
    const task = this.#task.get(id);
    if (!task) throw new TaskError("Task Could not found");
    return task;
  }
  getAllProjects() { return [...this.#projects]; }
}


const assert = require("node:assert");

let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log("PASS:", name); }
  catch (e) { fail++; console.log("FAIL:", name, "->", e.message); }
}

(async () => {
  await t("Task abstract", () => {
    assert.throws(() => new Task("abc", "low"), TaskError);
  });

  await t("id immutable", () => {
    const x = new SimpleTask("Hello", "low");
    assert.throws(() => { x.id = "z"; }, TypeError);
    assert.throws(() => Object.defineProperty(x, "id", { value: "z" }), TypeError);
  });

  await t("title validate", () => {
    const x = new SimpleTask("Hello", "low");
    assert.throws(() => { x.title = "ab"; }, TaskError);
    x.title = "  New  ";
    assert.equal(x.title, "New");
  });

  await t("priority validate", () => {
    assert.throws(() => new SimpleTask("Hello", "urgent"), TaskError);
    assert.equal(new SimpleTask("Hello", "HIGH").priority, "high");
  });

  await t("counter increments", () => {
    const a = Task.getGlobalCounter();
    new SimpleTask("One", "low");
    new SimpleTask("Two", "low");
    assert.equal(Task.getGlobalCounter(), a + 2);
  });

  await t("complete async 100ms", async () => {
    const x = new SimpleTask("Async", "medium");
    assert.equal(x.isComplete(), "Not Completed");
    const s = Date.now();
    await x.complete();
    assert.ok(Date.now() - s >= 95);
    assert.equal(x.isComplete(), "Completed");
  });

  await t("SimpleTask summary", () => {
    const x = new SimpleTask("Simple", "low");
    assert.match(x.getSummary(), /\(low\) - \[Not Completed\]$/);
  });

  await t("closure simpleTask", async () => {
    const x = simpleTask("Closure", "high");
    x.setTitle("Updated");
    assert.equal(x.getTitle(), "Updated");
    await x.complete();
    assert.equal(x.isComplete(), "Completed");
    assert.throws(() => simpleTask("ab", "low"), TaskError);
  });

  await t("RecurringTask prototype", () => {
    const x = new RecurringTask("Standup", "low", "daily");
    assert.ok(x instanceof Task);
    assert.equal(x.frequency, "daily");
    assert.match(x.getSummary(), /Recurring \(daily\)/);
    assert.throws(() => new RecurringTask("X", "low", "yearly"), TaskError);
  });

  await t("DeadlineTask", () => {
    assert.throws(() => new DeadlineTask("X", "low", "2020-01-01"), TaskError);
    assert.throws(() => new DeadlineTask("X", "low", "bad"), TaskError);
    const d = new DeadlineTask("X", "high", Date.now() + 86400000);
    assert.match(d.getSummary(), /Due: /);
  });

  await t("Project addTask chain + dup", () => {
    const p = new Project("P1");
    const x = new SimpleTask("A", "low");
    assert.equal(p.addTask(x), p);
    assert.throws(() => p.addTask(x), TaskError);
    assert.throws(() => p.addTask({}), TaskError);
  });

  await t("Project defensive copy", () => {
    const p = new Project("P1");
    p.addTask(new SimpleTask("A", "low"));
    p.getAllTask().push("junk");
    assert.equal(p.getTotalTask(), 1);
  });

  await t("Project findTaskById throw", () => {
    assert.throws(() => new Project("P1").findTaskById("x"), TaskError);
  });

  await t("Project incomplete + byPriority", async () => {
    const p = new Project("P1");
    const a = new SimpleTask("A", "low");
    const b = new SimpleTask("B", "high");
    p.addTask(a).addTask(b);
    await a.complete();
    assert.deepEqual(p.getIncompleteTasks(), [b]);
    assert.equal(p.getTasksByPriority("HIGH").length, 1);
    assert.throws(() => p.getTasksByPriority("urgent"), TaskError);
  });

  await t("Project empty name", () => {
    assert.throws(() => new Project("  "), TaskError);
  });

  await t("TaskManager registerProject", () => {
    const tm = new TaskManager(), p = new Project("P1");
    const a = new SimpleTask("A", "low");
    p.addTask(a);
    tm.registerProject(p);
    assert.equal(tm.getTotalTasks(), 1);
    assert.equal(tm.findTaskById(a.id), a);
  });

  await t("TaskManager registerTask", () => {
    const tm = new TaskManager(), p = new Project("P1");
    tm.registerProject(p);
    const a = new SimpleTask("A", "low");
    tm.registerTask(a, p);
    assert.equal(tm.getTotalTasks(), 1);
    assert.equal(p.getTotalTask(), 1);
  });

  await t("TaskManager unregisterTask", () => {
    const tm = new TaskManager(), p = new Project("P1");
    const a = new SimpleTask("A", "low");
    tm.registerProject(p).registerTask(a, p);
    assert.equal(tm.unregisterTask(a.id), a);
    assert.equal(tm.getTotalTasks(), 0);
    assert.equal(p.getTotalTask(), 0);
    assert.throws(() => tm.unregisterTask("x"), TaskError);
  });

  await t("getAllTasks detached this", async () => {
    const tm = new TaskManager(), p = new Project("P1");
    p.addTask(new SimpleTask("A", "low"));
    tm.registerProject(p);
    const fn = tm.getAllTasks;
    assert.equal((await fn()).length, 1);
  });

  await t("getAllTasks defensive copy", async () => {
    const tm = new TaskManager(), p = new Project("P1");
    p.addTask(new SimpleTask("A", "low"));
    tm.registerProject(p);
    (await tm.getAllTasks()).push("junk");
    assert.equal(tm.getTotalTasks(), 1);
  });

  await t("microtask before macrotask", async () => {
    const log = [];
    const orig = console.log;
    console.log = (...a) => log.push(a.join(" "));
    await new TaskManager().getAllTasks();
    console.log = orig;
    const mi = log.findIndex(l => l.includes("microtask"));
    const ma = log.findIndex(l => l.includes("macrotask"));
    assert.ok(mi !== -1 && ma !== -1 && mi < ma);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
})();