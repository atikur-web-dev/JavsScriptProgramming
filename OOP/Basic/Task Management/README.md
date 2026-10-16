# Task Management System

A JavaScript-based Task Management System designed to practice core JavaScript concepts, including classes, inheritance, prototypes, closures, asynchronous programming, encapsulation, and object property descriptors.

## Requirements

### 1. Task — Abstract Base Class

Create an abstract base class named `Task` with the following properties and methods:

**Properties**
- `id`: A unique, auto-generated, immutable identifier for each task.
- `title`: A readable property that can only be updated through a setter with validation. The title must contain at least 3 characters.
- `priority`: Must be one of `"low"`, `"medium"`, or `"high"`.
- `completed`: A Boolean value that defaults to `false`.

**Methods**
- `complete()`: An asynchronous method that marks the task as completed after a 100ms delay.
- `getSummary()`: Returns the task information in the following format:

  ```text
  [id] [title] ([priority]) - [completed?]
  ```

**Additional Rules**
- A global task counter must increment whenever a task is created.
- The `id` property must be non-writable and non-configurable using `Object.defineProperty`.
- The `title` property must use a getter and setter, with validation performed before updating its value.
- All validation errors must be thrown using the custom `TaskError` class.
- Since `Task` is an abstract base class, direct instantiation should be prevented.

### 2. Task Subclasses

Implement three types of tasks.

#### 2.1 SimpleTask

A task containing only the basic task information inherited from `Task`.

**Requirements**
- Implement a class-based version using `#private` fields.
- Implement a second version using a factory function and closures.
- Override `getSummary()` to return:

  ```text
  [id] [title] ([priority]) - [completed?]
  ```

#### 2.2 RecurringTask

A task that repeats at a specified frequency.

**Properties**
- `frequency`: Must be one of `"daily"`, `"weekly"`, or `"monthly"`.

**Requirements**
- Extend the base `Task` functionality.
- Implement the subclass using a constructor function and `prototype`, without using the `class` syntax.
- Use `ParentClass.call(this, ...)` in place of `super()`.
- Set up prototype inheritance correctly.
- Override `getSummary()` to return:

  ```text
  [id] [title] ([priority]) - Recurring ([frequency]) - [completed?]
  ```

#### 2.3 DeadlineTask

A task that must be completed before a specified deadline.

**Properties**
- `deadline`: A valid JavaScript `Date` object.

**Requirements**
- Extend the base `Task` class.
- Validate the deadline value.
- Override `getSummary()` to return:

  ```text
  [id] [title] ([priority]) - Due: [deadline] - [completed?]
  ```

### 3. Project — Collection Class

Create a `Project` class to organize and manage a collection of tasks.

**Properties**
- `name`: The name of the project.
- `tasks`: A collection of tasks associated with the project.

**Methods**

| Method | Description |
|---|---|
| `addTask(task)` | Validates that the argument is a valid `Task` instance, adds it to the project, and returns the project instance to support method chaining. |
| `getAllTasks()` | Returns a defensive copy of the project's task collection. |
| `findTaskById(id)` | Finds a task by its ID. Throws an error if no matching task exists. |
| `getIncompleteTasks()` | Returns only tasks that have not been completed. |
| `getTasksByPriority(priority)` | Returns tasks matching the specified priority. |

**Additional Rules**
- The internal task collection should not be directly exposed or modified by external code.
- Returned collections should be defensive copies.

### 4. TaskManager — Single Source of Truth

Create a `TaskManager` class that maintains the global collection of tasks across all projects.

**Methods**

| Method | Description |
|---|---|
| `registerTask(task)` | Registers a task with the manager and synchronizes it with the appropriate project. |
| `unregisterTask(id)` | Removes a task by ID and synchronizes the change with the associated project. |
| `getTotalTasks()` | Returns the global task count. |
| `getAllTasks()` | Asynchronously retrieves all registered tasks and returns a defensive copy. |

**Additional Rules**
- The manager must maintain a consistent collection of tasks across projects.
- Duplicate registrations should be handled appropriately.
- The `getAllTasks()` method must preserve its `this` context when detached from the instance.
- Use an arrow function or `bind()` to preserve the correct `this` reference.
- Include an asynchronous operation that demonstrates the execution order of microtasks and macrotasks.

### 5. TaskError — Custom Error Class

Create a custom error class named `TaskError` that extends JavaScript's built-in `Error` class.

**Requirements**
- Extend `Error`.
- Set `this.name` to `"TaskError"`.
- Support descriptive error messages.
- Use `TaskError` for all validation errors throughout the system.

Example error cases:
- Invalid task title.
- Invalid priority.
- Invalid recurring frequency.
- Invalid deadline.
- Invalid task instance.
- Task not found.

## Special Requirements — Phase 1 JavaScript Concepts

The implementation must demonstrate the following concepts.

### 1. `this` Behavior
- Preserve the correct `this` context when `TaskManager.getAllTasks()` is detached from its instance.
- Use an arrow function or `bind()`.

### 2. Asynchronous Programming
- Implement `Task.complete()` as an `async` method.
- Simulate processing with a 100ms delay.
- Mark the task as completed only after the delay.
- Ensure the correct `this` context is maintained.

### 3. Closures
Implement `SimpleTask` in two ways:
- Class-based implementation using `#private` fields.
- Factory-function implementation using closures.

### 4. Prototype-Based Inheritance
- Implement `RecurringTask` without the `class` syntax.
- Use a constructor function and `prototype`.
- Use `ParentClass.call(this, ...)` instead of `super()`.
- Configure prototype inheritance correctly.

### 5. Event Loop Ordering
- Include asynchronous behavior in `TaskManager.getAllTasks()`.
- Demonstrate the execution order of synchronous code, microtasks, and macrotasks.
- Ensure the method returns the expected task collection without breaking the asynchronous flow.

### 6. Getters and Setters
- Implement a getter for reading `Task.title`.
- Implement a setter for updating the title.
- Validate the new title before changing the stored value.
- Reject invalid updates using `TaskError`.

### 7. `Object.defineProperty()`
Use `Object.defineProperty()` to define the `Task.id` property with these restrictions:

| Descriptor | Value |
|---|---|
| `writable` | `false` |
| `configurable` | `false` |

The task ID must remain immutable after creation.

## Expected Outcome

The completed implementation should demonstrate practical knowledge of:

- Classes and object-oriented programming.
- Abstract classes and inheritance.
- Encapsulation with `#private` fields.
- Closures and factory functions.
- Constructor functions and prototype-based inheritance.
- Getters, setters, and property descriptors.
- Custom error handling.
- Asynchronous functions and promises.
- JavaScript's event loop, microtasks, and macrotasks.
- Defensive copying and collection management.
- Method chaining.
- Data consistency across multiple objects.

## Completion Checklist

- [ ] Implement the `TaskError` custom error class.
- [ ] Implement the abstract `Task` base class.
- [ ] Add a unique ID generator and global task counter.
- [ ] Make `Task.id` immutable using `Object.defineProperty()`.
- [ ] Implement title validation with a getter and setter.
- [ ] Implement asynchronous `Task.complete()` with a 100ms delay.
- [ ] Implement class-based `SimpleTask` using `#private` fields.
- [ ] Implement closure-based `SimpleTask` using a factory function.
- [ ] Implement prototype-based `RecurringTask` without the `class` syntax.
- [ ] Implement `DeadlineTask` with deadline validation.
- [ ] Implement the `Project` collection class.
- [ ] Implement the `TaskManager` as the single source of truth.
- [ ] Preserve `this` when `getAllTasks()` is detached.
- [ ] Demonstrate microtask and macrotask execution order.
- [ ] Ensure defensive copies are returned where required.
- [ ] Test validation errors and edge cases.
- [ ] Verify synchronization between projects and the task manager.

---

**Goal:** Build a complete task management system that applies fundamental and intermediate JavaScript concepts through practical implementation rather than isolated examples.