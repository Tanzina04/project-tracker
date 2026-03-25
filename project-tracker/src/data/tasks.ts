export const tasks = Array.from({ length: 500 }, (_, i) => ({
    id: String(i),
    title: `Task ${i}`,
    status: ["todo", "in-progress", "review", "done"][i % 4],
priority: ["high", "medium", "low"][i % 3],
assignee: ["A", "B", "C", "D", "E", "F"][i % 6],
dueDate: `2026-03-${(i % 28) + 1}`
}));
