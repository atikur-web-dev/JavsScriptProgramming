class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskError";
  }
}

class Task {
  static taskCounter = 0;
  static #generatedIds = new Set();

  #title;

  completed = false;
  priority;

  constructor(title, priority) {
    if (new.target === Task) {
      throw new TaskError("Task is an abstract class and cannot be instantiated directly");
    }
    let id;
    do {
      id = Math.random().toString(36).slice(2, 9);
    } while (Task.#generatedIds.has(id));
    Task.#generatedIds.add(id);

    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false
    });

    this.title = title;
    this.priority = this.validatePriority(priority);
    Task.taskCounter++;
  }

  get title() {
    return this.#title;
  }

  set title(newTitle) {
    this.#title = this.validateTitle(newTitle);
  }

  validateTitle(title) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new TaskError("Title must contain at least 3 characters");
    }
    return title.trim();
  }

  validatePriority(priority) {
    const validPriorities = ["low", "medium", "high"];
    if (typeof priority !== "string" || !validPriorities.includes(priority.toLowerCase())) {
      throw new TaskError("Priority must be low, medium, or high");
    }
    return priority.toLowerCase();
  }

  getId() {
    return this.id;
  }

  getPriority() {
    return this.priority;
  }

  async complete() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.completed = true;
    return this;
  }

  completeStatus() {
    return this.completed ? "Completed!" : "Not completed";
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
    throw new TaskError(`Unknown task type: ${type}`);
  }
}

class SimpleTask extends Task {
  constructor(title, priority) {
    super(title, priority);
  }

  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - [${this.completeStatus()}]`;
  }
}


function createSimpleTask(title, priority) {
  let _id;
  let _title;
  let _priority;
  let _completed = false;
  const generatedIds = new Set();
  let id;
  do {
    id = Math.random().toString(36).slice(2, 9);
  } while (generatedIds.has(id));
  _id = id;

  const validPriorities = ["low", "medium", "high"];
  if (typeof priority !== "string" || !validPriorities.includes(priority.toLowerCase())) {
    throw new TaskError("Priority must be low, medium, or high");
  }

  if (typeof title !== "string" || title.trim().length < 3) {
    throw new TaskError("Title must contain at least 3 characters");
  }

  _title = title.trim();
  _priority = priority.toLowerCase();

  return {
    getId() {
      return _id;
    },
    getTitle() {
      return _title;
    },
    getPriority() {
      return _priority;
    },
    setTitle(newTitle) {
      if (typeof newTitle !== "string" || newTitle.trim().length < 3) {
        throw new TaskError("Title must contain at least 3 characters");
      }
      _title = newTitle.trim();
    },
    async complete() {
      await new Promise(resolve => setTimeout(resolve, 100));
      _completed = true;
      return this;
    },
    isCompleted() {
      return _completed;
    },
    completeStatus() {
      return _completed ? "Completed!" : "Not completed";
    },
    getSummary() {
      return `[${_id}] [${_title}] (${_priority}) - [${_completed ? "Completed!" : "Not completed"}]`;
    }
  };
}

function RecurringTask(title, priority, frequency) {

  Task.call(this, title, priority);

  const validFrequencies = ["daily", "weekly", "monthly"];
  if (typeof frequency !== "string" || !validFrequencies.includes(frequency.toLowerCase())) {
    throw new TaskError("Frequency must be daily, weekly, or monthly");
  }

  this.frequency = frequency.toLowerCase();
}


RecurringTask.prototype = Object.create(Task.prototype);
RecurringTask.prototype.constructor = RecurringTask;


RecurringTask.prototype.getSummary = function () {
  return `[${this.id}] [${this.title}] (${this.priority}) - Recurring (${this.frequency}) - [${this.completeStatus()}]`;
};


class DeadlineTask extends Task {
  constructor(title, priority, deadline) {
    super(title, priority);
    this.deadline = this.validateDate(deadline);
  }

  validateDate(deadline) {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
      throw new TaskError("The provided deadline is not a valid date");
    }
    if (date.getTime() < Date.now()) {
      throw new TaskError("The deadline has already expired");
    }
    return date;
  }

  getSummary() {
    return `[${this.id}] [${this.title}] (${this.priority}) - Due: ${this.deadline} - [${this.completeStatus()}]`;
  }
}
class Project {
  #taskList = [];

  constructor(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TaskError("Project name must be a non-empty string");
    }
    this.name = name.trim();
  }

  addTask(task) {
    if (!(task instanceof Task)) {
      throw new TaskError("Invalid task: Expected a Task instance");
    }
    if (this.#taskList.includes(task)) {
      throw new TaskError("Task already exists in this project");
    }
    this.#taskList.push(task);
    return this;
  }

  removeTaskById(id) {
    const initialLength = this.#taskList.length;
    this.#taskList = this.#taskList.filter(task => task.id !== id);
    return this.#taskList.length < initialLength;
  }

  getAllTasks() {
    return [...this.#taskList];
  }

  getTotalTasks() {
    return this.#taskList.length;
  }

  findTaskById(id) {
    const task = this.#taskList.find(task => task.id === id);
    if (!task) {
      throw new TaskError(`Task not found: ${id}`);
    }
    return task;
  }

  getIncompleteTasks() {
    return this.#taskList.filter(task => !task.completed);
  }

  getTasksByPriority(priority) {
    if (typeof priority !== "string") {
      throw new TaskError("Priority must be a string");
    }
    const normalizedPriority = priority.toLowerCase();
    if (!["low", "medium", "high"].includes(normalizedPriority)) {
      throw new TaskError("Priority must be low, medium, or high");
    }
    return this.#taskList.filter(task => task.priority === normalizedPriority);
  }
}

class TaskManager {
  #projects = [];
  #tasks = new Map();

  constructor() {
    this.getAllTasks = this.getAllTasks.bind(this);
    this.getTotalTasks = this.getTotalTasks.bind(this);
  }

  registerProject(project) {
    if (!(project instanceof Project)) {
      throw new TaskError("Invalid project: Expected a Project instance");
    }
    if (this.#projects.includes(project)) {
      throw new TaskError("Project is already registered");
    }
    for (const task of project.getAllTasks()) {
      if (this.#tasks.has(task.id)) {
        throw new TaskError(`Task is already registered: ${task.id}`);
      }
    }
    this.#projects.push(project);
    for (const task of project.getAllTasks()) {
      this.#tasks.set(task.id, task);
    }
    return this;
  }

  registerTask(task, project) {
    if (!(task instanceof Task)) {
      throw new TaskError("Invalid task: Expected a Task instance");
    }
    if (!(project instanceof Project)) {
      throw new TaskError("A valid Project instance is required");
    }
    if (!this.#projects.includes(project)) {
      throw new TaskError("Project must be registered before adding tasks");
    }
    if (this.#tasks.has(task.id)) {
      throw new TaskError(`Task is already registered: ${task.id}`);
    }
    project.addTask(task);
    this.#tasks.set(task.id, task);
    return this;
  }

  unregisterTask(id) {
    const task = this.#tasks.get(id);
    if (!task) {
      throw new TaskError(`Task not found: ${id}`);
    }
    this.#tasks.delete(id);
    for (const project of this.#projects) {
      project.removeTaskById(id);
    }
    return task;
  }

  getTotalTasks() {
    return this.#tasks.size;
  }

  getAllTasks() {
    return [...this.#tasks.values()];
  }

  findTaskById(id) {
    const task = this.#tasks.get(id);
    if (!task) {
      throw new TaskError(`Task not found: ${id}`);
    }
    return task;
  }

  getAllProjects() {
    return [...this.#projects];
  }
}

async function main() {
  console.log("─── Test 1: Create tasks via factory ───");
  const simple = Task.create("simple", "Buy groceries", "high");
  const recurring = Task.create("recurring", "Pay rent", "medium", "monthly");
  const deadline = Task.create("deadline", "Submit report", "high", new Date("2025-12-31"));

  console.log(simple.getSummary());
  console.log(recurring.getSummary());
  console.log(deadline.getSummary());

  console.log("\n─── Test 2: Async complete ───");
  await simple.complete();
  console.log(simple.getSummary());

  console.log("\n─── Test 3: Project ───");
  const project = new Project("Home");
  project.addTask(simple).addTask(recurring).addTask(deadline);

  console.log(project.getAllTasks().length);     
  console.log(project.getIncompleteTasks().length);
  console.log(project.getTasksByPriority("high").length); 

  console.log("\n─── Test 4: TaskManager ───");
  const manager = new TaskManager();
  manager.registerProject(project);
  console.log(manager.getTotalTasks());   

  // Detach safety test
  const detachedGetAll = manager.getAllTasks;
  console.log(detachedGetAll().length);   

  console.log("\n─── Test 5: Closure SimpleTask ───");
  const closureTask = createSimpleTask("Read book", "low");
  console.log(closureTask.getSummary());
  await closureTask.complete();
  console.log(closureTask.getSummary());

  console.log("\n─── Test 6: Prototype RecurringTask ───");
  const protoTask = new RecurringTask("Gym", "high", "daily");
  console.log(protoTask.getSummary());
  console.log(protoTask instanceof Task);      
  console.log(protoTask instanceof RecurringTask); 

  console.log("\n─── Test 7: Global counter ───");
  console.log(Task.getTotalTasks());  

  console.log("\n─── Test 8: Error cases ───");
  try { Task.create("invalid", "Test", "high"); }
  catch (e) { console.log(e.name, e.message); }

  try { project.findTaskById("nonexistent"); }
  catch (e) { console.log(e.name, e.message); }

  try { Task.create("simple", "ab", "high"); }
  catch (e) { console.log(e.name, e.message); }
}

main();