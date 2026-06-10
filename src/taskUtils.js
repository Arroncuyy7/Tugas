/**
 * Pure utility functions for the Tugas task management app.
 * Extracted from script.js for testability.
 */

/**
 * Validate that both task name and deadline are provided.
 * @param {string} task - The task description.
 * @param {string} deadline - The deadline date string.
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTaskInput(task, deadline) {
  const trimmedTask = (task || '').trim();
  if (!trimmedTask && !deadline) {
    return { valid: false, error: 'Silakan masukkan tugas dan tanggal deadline!' };
  }
  if (!trimmedTask) {
    return { valid: false, error: 'Silakan masukkan tugas!' };
  }
  if (!deadline) {
    return { valid: false, error: 'Silakan masukkan tanggal deadline!' };
  }
  return { valid: true };
}

/**
 * Format a task object for display.
 * @param {{ task: string, deadline: string }} taskData
 * @returns {{ taskText: string, deadlineText: string }}
 */
function formatTaskForDisplay(taskData) {
  return {
    taskText: taskData.task || '',
    deadlineText: taskData.deadline ? `Deadline: ${taskData.deadline}` : 'Deadline: -'
  };
}

/**
 * Create a task data object for saving to the database.
 * @param {string} task - The task description (will be trimmed).
 * @param {string} deadline - The deadline date string.
 * @returns {{ task: string, deadline: string }}
 */
function createTaskData(task, deadline) {
  return {
    task: (task || '').trim(),
    deadline: deadline || ''
  };
}

/**
 * Build the inner HTML for a single task list item.
 * @param {{ task: string, deadline: string }} taskData
 * @returns {string}
 */
function buildTaskItemHTML(taskData) {
  const { taskText, deadlineText } = formatTaskForDisplay(taskData);
  return `
            <span>${taskText}</span>
            <span class="deadline">${deadlineText}</span>
            <button class="remove-btn">*</button>
        `;
}

/**
 * Check whether a form element has the 'hidden' CSS class.
 * @param {Element} element
 * @returns {boolean}
 */
function isHidden(element) {
  return element.classList.contains('hidden');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateTaskInput,
    formatTaskForDisplay,
    createTaskData,
    buildTaskItemHTML,
    isHidden
  };
}
