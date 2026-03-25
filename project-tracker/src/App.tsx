import { useState } from "react";
import { tasks as initialTasks } from "./data/tasks";

function App() {
  const [view, setView] = useState("kanban");
  const [taskList, setTaskList] = useState(initialTasks);
  const [hoverColumn, setHoverColumn] = useState<string>("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [scrollTop, setScrollTop] = useState(0);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // DRAG DROP 
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");

    const updated = taskList.map((task) =>
      task.id === id ? { ...task, status } : task
    );

    setTaskList(updated);
    setDraggedId(null);
  };

  // FILTER 
  const filteredTasks = taskList.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  //  SORT 
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    if (sortBy === "priority") {
      const order = { high: 3, medium: 2, low: 1 };
      return sortOrder === "asc"
        ? order[a.priority as keyof typeof order] -
            order[b.priority as keyof typeof order]
        : order[b.priority as keyof typeof order] -
            order[a.priority as keyof typeof order];
    }

    if (sortBy === "dueDate") {
      return sortOrder === "asc"
        ? new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() -
            new Date(a.dueDate).getTime();
    }

    return 0;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // VIRTUAL SCROLL 
  const rowHeight = 50;
  const visibleCount = 10;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = startIndex + visibleCount;

  const visibleTasks = sortedTasks.slice(startIndex, endIndex);

  return (
    <div>
      <h1>Project Tracker</h1>

      <button onClick={() => setView("kanban")}>kanban</button>
      <button onClick={() => setView("list")}>List</button>
      <button onClick={() => setView("timeline")}>Timeline</button>

      {/* KANBAN */}
      {view === "kanban" && (
        <div style={{ display: "flex", gap: "20px" }}>
          {["todo", "in-progress", "review", "done"].map((status) => (
            <div
              key={status}
              style={{
                minWidth: "200px",
                background:
                  hoverColumn === status ? "#e0f7fa" : "transparent",
                padding: "10px",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverColumn(status);
              }}
              onDragLeave={() => setHoverColumn("")}
              onDrop={(e) => {
                handleDrop(e, status);
                setHoverColumn("");
              }}
            >
              <h3>
                {status} (
                {taskList.filter((t) => t.status === status).length})
              </h3>

              {taskList
                .filter((t) => t.status === status)
                .map((t) =>
                  draggedId === t.id ? (
                    <div
                      key={t.id}
                      style={{
                        height: "70px",
                        marginBottom: "10px",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      key={t.id}
                      style={cardStyle}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", t.id);
                        setDraggedId(t.id);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <p>{t.title}</p>
                      <small>{t.assignee}</small>
                    </div>
                  )
                )}
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {view === "list" && (
        <div style={{ marginTop: "20px" }}>
          {/* Controls */}
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ALL</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("title")}>Title</th>
                <th onClick={() => handleSort("priority")}>Priority</th>
                <th onClick={() => handleSort("dueDate")}>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={4}>
                  <div
                    style={{
                      height: "400px",
                      overflowY: "auto",
                      position: "relative",
                      border: "1px solid #ccc",
                    }}
                    onScroll={(e) =>
                      setScrollTop(e.currentTarget.scrollTop)
                    }
                  >
                    <div
                      style={{
                        height: sortedTasks.length * rowHeight,
                      }}
                    >
                      {visibleTasks.map((t, index) => {
                        const actualIndex = startIndex + index;

                        return (
                          <div
                            key={t.id}
                            style={{
                              position: "absolute",
                              top: actualIndex * rowHeight,
                              left: 0,
                              right: 0,
                              height: rowHeight,
                              display: "flex",
                              padding: "8px",
                              borderBottom: "1px solid #eee",
                              background: "#fff",
                            }}
                          >
                            <div style={{ flex: 1 }}>{t.title}</div>
                            <div style={{ flex: 1 }}>{t.priority}</div>
                            <div style={{ flex: 1 }}>{t.dueDate}</div>

                            <div style={{ flex: 1 }}>
                              <select
                                value={t.status}
                                onChange={(e) => {
                                  const updated = taskList.map(
                                    (task) =>
                                      task.id === t.id
                                        ? {
                                            ...task,
                                            status: e.target.value,
                                          }
                                        : task
                                  );
                                  setTaskList(updated);
                                }}
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">
                                  In Progress
                                </option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TIMELINE */}
      {view === "timeline" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Timeline</h3>

          {taskList.map((task) => {
            const start = new Date(task.dueDate);
            const base = new Date("2026-03-01");

            const diffDays =
              (start.getTime() - base.getTime()) /
              (1000 * 60 * 60 * 24);

            return (
              <div key={task.id} style={{ marginBottom: "10px" }}>
                <div>{task.title}</div>

                <div
                  style={{
                    position: "relative",
                    height: "20px",
                    background: "#eee",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: `${diffDays * 10}px`,
                      width: "80px",
                      height: "100%",
                      background:
                        task.status === "done"
                          ? "green"
                          : task.status === "in-progress"
                          ? "orange"
                          : "gray",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  background: "#f5f5f5",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  cursor: "grab",
};

export default App;