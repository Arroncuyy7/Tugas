/**
 * Tests for script.js — Firebase-backed task CRUD.
 *
 * script.js executes immediately on load, so we must:
 *  1. Set up the DOM elements it expects.
 *  2. Provide a global `firebase` mock.
 *  3. Use jest.isolateModules for a fresh require each time.
 */

// ─── helpers ───────────────────────────────────────────────────────

function buildDOM() {
  document.body.innerHTML = `
    <div class="container">
      <h1>Daftar Tugas</h1>
      <button id="addTaskBtn">Tambah Tugas</button>
      <div id="taskForm" class="hidden">
        <input type="text" id="taskInput" placeholder="Masukkan tugas" />
        <input type="date" id="deadlineInput" />
        <button id="saveTaskBtn">Simpan Tugas</button>
      </div>
      <ul id="taskList"></ul>
    </div>
  `;
}

/**
 * Create a mock Firebase that records calls and lets us trigger
 * callbacks from tests.
 */
function createFirebaseMock() {
  const onCallbacks = {};
  const pushMock = jest.fn();
  const removeMock = jest.fn();

  const refMock = jest.fn(() => ({
    push: pushMock,
    on: jest.fn((event, cb) => {
      onCallbacks[event] = cb;
    }),
    remove: removeMock
  }));

  const databaseMock = jest.fn(() => ({ ref: refMock }));

  const firebaseMock = {
    initializeApp: jest.fn(),
    database: databaseMock,
    // expose internals for assertions
    _refMock: refMock,
    _pushMock: pushMock,
    _removeMock: removeMock,
    _onCallbacks: onCallbacks
  };

  return firebaseMock;
}

// ─── setup / teardown ──────────────────────────────────────────────

let firebaseMock;

beforeEach(() => {
  buildDOM();
  firebaseMock = createFirebaseMock();
  global.firebase = firebaseMock;
  // suppress alert() popups
  global.alert = jest.fn();
});

afterEach(() => {
  document.body.innerHTML = '';
  delete global.firebase;
  delete global.alert;
  jest.resetModules();
});

function loadScript() {
  jest.isolateModules(() => {
    require('../script');
  });
}

// ─── tests ─────────────────────────────────────────────────────────

describe('script.js — Firebase initialisation', () => {
  test('calls firebase.initializeApp with the config object', () => {
    loadScript();
    expect(firebaseMock.initializeApp).toHaveBeenCalledTimes(1);
    const config = firebaseMock.initializeApp.mock.calls[0][0];
    expect(config).toHaveProperty('apiKey');
    expect(config).toHaveProperty('projectId', 'backup-80243');
  });

  test('calls firebase.database() to get a database reference', () => {
    loadScript();
    expect(firebaseMock.database).toHaveBeenCalled();
  });

  test('subscribes to the tasks/ reference with "value" event', () => {
    loadScript();
    expect(firebaseMock._onCallbacks).toHaveProperty('value');
  });
});

describe('script.js — toggle task form', () => {
  test('removes "hidden" class on first click of addTaskBtn', () => {
    loadScript();
    const form = document.getElementById('taskForm');
    const btn = document.getElementById('addTaskBtn');

    expect(form.classList.contains('hidden')).toBe(true);
    btn.click();
    expect(form.classList.contains('hidden')).toBe(false);
  });

  test('adds "hidden" class back on second click (toggle)', () => {
    loadScript();
    const form = document.getElementById('taskForm');
    const btn = document.getElementById('addTaskBtn');

    btn.click(); // show
    btn.click(); // hide
    expect(form.classList.contains('hidden')).toBe(true);
  });
});

describe('script.js — save task', () => {
  test('pushes task data to Firebase when inputs are valid', () => {
    loadScript();
    document.getElementById('taskInput').value = 'Belajar Matematika';
    document.getElementById('deadlineInput').value = '2026-06-20';

    document.getElementById('saveTaskBtn').click();

    expect(firebaseMock._pushMock).toHaveBeenCalledWith(
      { task: 'Belajar Matematika', deadline: '2026-06-20' },
      expect.any(Function)
    );
  });

  test('alerts when task input is empty', () => {
    loadScript();
    document.getElementById('taskInput').value = '';
    document.getElementById('deadlineInput').value = '2026-06-20';

    document.getElementById('saveTaskBtn').click();

    expect(global.alert).toHaveBeenCalledWith(
      'Silakan masukkan tugas dan tanggal deadline!'
    );
    expect(firebaseMock._pushMock).not.toHaveBeenCalled();
  });

  test('alerts when deadline input is empty', () => {
    loadScript();
    document.getElementById('taskInput').value = 'Some task';
    document.getElementById('deadlineInput').value = '';

    document.getElementById('saveTaskBtn').click();

    expect(global.alert).toHaveBeenCalledWith(
      'Silakan masukkan tugas dan tanggal deadline!'
    );
    expect(firebaseMock._pushMock).not.toHaveBeenCalled();
  });

  test('alerts when both inputs are empty', () => {
    loadScript();
    document.getElementById('saveTaskBtn').click();

    expect(global.alert).toHaveBeenCalledWith(
      'Silakan masukkan tugas dan tanggal deadline!'
    );
  });

  test('clears inputs and hides form on successful save', () => {
    loadScript();
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const form = document.getElementById('taskForm');

    taskInput.value = 'Test task';
    deadlineInput.value = '2026-07-01';
    form.classList.remove('hidden'); // form is visible

    document.getElementById('saveTaskBtn').click();

    // Simulate Firebase success callback (second arg of push)
    const pushCallback = firebaseMock._pushMock.mock.calls[0][1];
    pushCallback(null); // null = no error

    expect(taskInput.value).toBe('');
    expect(deadlineInput.value).toBe('');
    expect(form.classList.contains('hidden')).toBe(true);
    expect(global.alert).toHaveBeenCalledWith('Tugas berhasil disimpan!');
  });

  test('alerts on Firebase save error', () => {
    loadScript();
    document.getElementById('taskInput').value = 'Errored task';
    document.getElementById('deadlineInput').value = '2026-07-01';

    document.getElementById('saveTaskBtn').click();

    const pushCallback = firebaseMock._pushMock.mock.calls[0][1];
    pushCallback(new Error('network error'));

    expect(global.alert).toHaveBeenCalledWith('Gagal menyimpan tugas, coba lagi.');
  });
});

describe('script.js — render tasks from Firebase snapshot', () => {
  test('renders task items from a snapshot', () => {
    loadScript();
    const taskList = document.getElementById('taskList');

    // Build a fake snapshot mimicking Firebase DataSnapshot
    const children = [
      {
        val: () => ({ task: 'Task A', deadline: '2026-06-10' }),
        ref: { remove: jest.fn() }
      },
      {
        val: () => ({ task: 'Task B', deadline: '2026-06-20' }),
        ref: { remove: jest.fn() }
      }
    ];
    const snapshot = {
      forEach: (cb) => children.forEach(cb)
    };

    // Trigger the on('value') callback
    firebaseMock._onCallbacks.value(snapshot);

    const items = taskList.querySelectorAll('.task-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Task A');
    expect(items[0].textContent).toContain('2026-06-10');
    expect(items[1].textContent).toContain('Task B');
  });

  test('clears existing items before rendering new ones', () => {
    loadScript();
    const taskList = document.getElementById('taskList');

    const makeSnapshot = (tasks) => ({
      forEach: (cb) =>
        tasks.map((t) => ({
          val: () => t,
          ref: { remove: jest.fn() }
        })).forEach(cb)
    });

    // First render
    firebaseMock._onCallbacks.value(
      makeSnapshot([{ task: 'Old', deadline: '2026-01-01' }])
    );
    expect(taskList.querySelectorAll('.task-item')).toHaveLength(1);

    // Second render replaces the old items
    firebaseMock._onCallbacks.value(
      makeSnapshot([
        { task: 'New A', deadline: '2026-02-01' },
        { task: 'New B', deadline: '2026-03-01' }
      ])
    );
    expect(taskList.querySelectorAll('.task-item')).toHaveLength(2);
    expect(taskList.textContent).not.toContain('Old');
  });

  test('renders an empty list when snapshot has no children', () => {
    loadScript();
    const taskList = document.getElementById('taskList');

    firebaseMock._onCallbacks.value({ forEach: () => {} });
    expect(taskList.querySelectorAll('.task-item')).toHaveLength(0);
  });
});

describe('script.js — remove task', () => {
  test('calls ref.remove when the remove button is clicked', () => {
    loadScript();
    const removeMockFn = jest.fn();
    const child = {
      val: () => ({ task: 'To remove', deadline: '2026-06-30' }),
      ref: { remove: removeMockFn }
    };
    const snapshot = { forEach: (cb) => [child].forEach(cb) };

    firebaseMock._onCallbacks.value(snapshot);

    const removeBtn = document.querySelector('.remove-btn');
    removeBtn.click();

    expect(removeMockFn).toHaveBeenCalledWith(expect.any(Function));
  });

  test('alerts success on successful removal', () => {
    loadScript();
    const removeMockFn = jest.fn();
    const child = {
      val: () => ({ task: 'To remove', deadline: '2026-06-30' }),
      ref: { remove: removeMockFn }
    };
    firebaseMock._onCallbacks.value({ forEach: (cb) => [child].forEach(cb) });

    document.querySelector('.remove-btn').click();

    const removeCallback = removeMockFn.mock.calls[0][0];
    removeCallback(null);

    expect(global.alert).toHaveBeenCalledWith('Tugas berhasil dihapus!');
  });

  test('alerts failure on removal error', () => {
    loadScript();
    const removeMockFn = jest.fn();
    const child = {
      val: () => ({ task: 'To remove', deadline: '2026-06-30' }),
      ref: { remove: removeMockFn }
    };
    firebaseMock._onCallbacks.value({ forEach: (cb) => [child].forEach(cb) });

    document.querySelector('.remove-btn').click();

    const removeCallback = removeMockFn.mock.calls[0][0];
    removeCallback(new Error('permission denied'));

    expect(global.alert).toHaveBeenCalledWith('Gagal menghapus tugas, coba lagi.');
  });
});
