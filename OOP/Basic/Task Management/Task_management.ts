class TaskError extends Error {
    constructor(message : string) {
        super(message);
        this.name = "TaskError"
    }
}

class Task {
    static generateIds: Set<string> = new Set<string>();
    static globalCounter: number = 0;
}