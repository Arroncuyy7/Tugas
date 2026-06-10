const {
  validateTaskInput,
  formatTaskForDisplay,
  createTaskData,
  buildTaskItemHTML,
  isHidden
} = require('../src/taskUtils');

describe('taskUtils', () => {
  // ─── validateTaskInput ───────────────────────────────────────────

  describe('validateTaskInput', () => {
    test('returns valid for a proper task and deadline', () => {
      const result = validateTaskInput('Do homework', '2026-06-15');
      expect(result).toEqual({ valid: true });
    });

    test('trims whitespace from task before validating', () => {
      expect(validateTaskInput('  Read book  ', '2026-07-01')).toEqual({ valid: true });
    });

    test('returns error when both task and deadline are empty', () => {
      const result = validateTaskInput('', '');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/tugas dan tanggal deadline/i);
    });

    test('returns error when task is missing but deadline is provided', () => {
      const result = validateTaskInput('', '2026-06-15');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/tugas/i);
    });

    test('returns error when deadline is missing but task is provided', () => {
      const result = validateTaskInput('Do homework', '');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/deadline/i);
    });

    test('returns error when task is only whitespace', () => {
      const result = validateTaskInput('   ', '2026-06-15');
      expect(result.valid).toBe(false);
    });

    test('handles null inputs gracefully', () => {
      expect(validateTaskInput(null, null).valid).toBe(false);
      expect(validateTaskInput(null, '2026-06-15').valid).toBe(false);
      expect(validateTaskInput('Task', null).valid).toBe(false);
    });

    test('handles undefined inputs gracefully', () => {
      expect(validateTaskInput(undefined, undefined).valid).toBe(false);
      expect(validateTaskInput(undefined, '2026-06-15').valid).toBe(false);
    });
  });

  // ─── formatTaskForDisplay ────────────────────────────────────────

  describe('formatTaskForDisplay', () => {
    test('formats a task with a deadline', () => {
      const result = formatTaskForDisplay({ task: 'Math', deadline: '2026-06-15' });
      expect(result).toEqual({
        taskText: 'Math',
        deadlineText: 'Deadline: 2026-06-15'
      });
    });

    test('returns placeholder when deadline is empty', () => {
      const result = formatTaskForDisplay({ task: 'Math', deadline: '' });
      expect(result.deadlineText).toBe('Deadline: -');
    });

    test('handles missing task gracefully', () => {
      const result = formatTaskForDisplay({ deadline: '2026-06-15' });
      expect(result.taskText).toBe('');
    });

    test('handles completely empty object', () => {
      const result = formatTaskForDisplay({});
      expect(result.taskText).toBe('');
      expect(result.deadlineText).toBe('Deadline: -');
    });
  });

  // ─── createTaskData ──────────────────────────────────────────────

  describe('createTaskData', () => {
    test('creates a task data object with trimmed task', () => {
      const result = createTaskData('  Do homework  ', '2026-06-15');
      expect(result).toEqual({ task: 'Do homework', deadline: '2026-06-15' });
    });

    test('handles null task', () => {
      const result = createTaskData(null, '2026-06-15');
      expect(result).toEqual({ task: '', deadline: '2026-06-15' });
    });

    test('handles null deadline', () => {
      const result = createTaskData('Task', null);
      expect(result).toEqual({ task: 'Task', deadline: '' });
    });
  });

  // ─── buildTaskItemHTML ───────────────────────────────────────────

  describe('buildTaskItemHTML', () => {
    test('includes task text and deadline in HTML', () => {
      const html = buildTaskItemHTML({ task: 'Study', deadline: '2026-06-15' });
      expect(html).toContain('<span>Study</span>');
      expect(html).toContain('Deadline: 2026-06-15');
      expect(html).toContain('remove-btn');
    });

    test('shows placeholder for missing deadline', () => {
      const html = buildTaskItemHTML({ task: 'Study', deadline: '' });
      expect(html).toContain('Deadline: -');
    });
  });

  // ─── isHidden ────────────────────────────────────────────────────

  describe('isHidden', () => {
    test('returns true when element has "hidden" class', () => {
      const el = document.createElement('div');
      el.classList.add('hidden');
      expect(isHidden(el)).toBe(true);
    });

    test('returns false when element does not have "hidden" class', () => {
      const el = document.createElement('div');
      expect(isHidden(el)).toBe(false);
    });

    test('returns false after removing "hidden" class', () => {
      const el = document.createElement('div');
      el.classList.add('hidden');
      el.classList.remove('hidden');
      expect(isHidden(el)).toBe(false);
    });
  });
});
