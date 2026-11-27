"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/database";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_DANGER,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

const PRIORITY_BADGES: Record<Task["priority"], string> = {
  low: CONSOLE_BADGE_MUTED,
  medium: CONSOLE_BADGE_INFO,
  high: CONSOLE_BADGE_WARN,
  urgent: CONSOLE_BADGE_DANGER,
};

export function TasksSection() {
  const { tasks, fetchTasks, createTask, updateTaskStatus, deleteTask } = useTaskStore();
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
    colTitle: string,
    columnTasks: Task[],
    status: Task["status"],
    indicatorColor: string
  ) => (
    <div className={cn(CONSOLE_PANEL, "p-4 flex flex-col h-full")}>
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#edf0ee]/[0.08]">
        <h2 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
          <span className={cn("w-2 h-2 rounded-full", indicatorColor)} />
          {colTitle}
        </h2>
        <span className={CONSOLE_BADGE_MUTED}>{columnTasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {columnTasks.map((task) => {
          const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
          return (
            <div key={task.id} className={cn(CONSOLE_SUBCARD, "p-3.5 space-y-2.5 text-xs")}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-[#edf0ee] leading-snug">{task.title}</h3>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="text-[#727c75] hover:text-[#f28b8e] p-0.5 rounded transition-colors cursor-pointer"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {task.description && (
                <p className="text-[#a1aaa4] text-xs leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className={cn(pBadge, "capitalize")}>{task.priority}</span>

                <div className="flex items-center gap-1">
                  {status !== "todo" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(task.id, status === "completed" ? "in_progress" : "todo")
                      }
                      className="p-1.5 rounded-md bg-[#19201d] border border-[#edf0ee]/[0.08] text-[#a1aaa4] hover:text-[#edf0ee] cursor-pointer"
                      title="Move backward"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {status !== "completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(task.id, status === "todo" ? "in_progress" : "completed")
                      }
                      className="p-1.5 rounded-md bg-[#19201d] border border-[#edf0ee]/[0.08] text-[#a1aaa4] hover:text-[#edf0ee] cursor-pointer"
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
          <div className="h-32 flex items-center justify-center border border-dashed border-[#edf0ee]/[0.08] rounded-xl text-[#727c75] text-xs">
            No tasks in {colTitle.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 select-none tabular-nums">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Tasks</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Track team action items and AI escalations
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-[480px]">
        {renderColumn("To do", todoTasks, "todo", "bg-[#727c75]")}
        {renderColumn("In progress", inProgressTasks, "in_progress", "bg-sky-400")}
        {renderColumn("Completed", completedTasks, "completed", "bg-[#4cc38a]")}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 max-w-md w-full p-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <h3 className="text-[#edf0ee] font-semibold text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#a1aaa4]" strokeWidth={1.65} />
                Create task
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-[#727c75] hover:text-[#edf0ee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[#a1aaa4] mb-1">Task title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow up with VIP lead regarding contract"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div>
                <label className="block text-[#a1aaa4] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes or instructions"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={CONSOLE_BTN_PRIMARY}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
