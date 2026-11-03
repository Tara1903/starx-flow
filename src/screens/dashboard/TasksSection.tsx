"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Plus, Trash2, ArrowRight, ArrowLeft, 
  Clock, AlertCircle, X, Loader2, MoreHorizontal 
} from "lucide-react";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/database";

const PRIORITY_BADGES: Record<Task["priority"], { bg: string; text: string }> = {
  low: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400" },
  medium: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  high: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  urgent: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
};

export function TasksSection() {
  const { tasks, isLoading, fetchTasks, createTask, updateTaskStatus, deleteTask } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const renderColumn = (
    title: string,
    columnTasks: Task[],
    status: Task["status"],
    indicatorColor: string
  ) => (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></span>
          {title}
        </h3>
        <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md">
          {columnTasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {columnTasks.map((task) => {
          const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
          return (
            <div
              key={task.id}
              className="p-3.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl space-y-2.5 transition-all text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white leading-snug">{task.title}</h4>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-zinc-500 hover:text-red-400 p-0.5 rounded"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {task.description && (
                <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${pBadge.bg} ${pBadge.text}`}>
                  {task.priority}
                </span>

                {/* Status Transitions */}
                <div className="flex items-center gap-1">
                  {status !== "todo" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, status === "completed" ? "in_progress" : "todo")}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      title="Move backward"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {status !== "completed" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, status === "todo" ? "in_progress" : "completed")}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      title="Move forward"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {columnTasks.length === 0 && (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-zinc-600 text-xs">
            No tasks in {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Task Management & Operations
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Track business to-dos, AI escalations, and staff operational action items.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {renderColumn("To Do", todoTasks, "todo", "bg-zinc-500")}
        {renderColumn("In Progress", inProgressTasks, "in_progress", "bg-blue-500")}
        {renderColumn("Completed", completedTasks, "completed", "bg-emerald-500")}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101214] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Create New Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow up with VIP lead regarding contract"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add specific instructions or notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#181a1d] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
