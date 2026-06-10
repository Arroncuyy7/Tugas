// Inisialisasi Firebase (config loaded from firebase-config.js)
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var addTaskBtn = document.getElementById('addTaskBtn');
var taskForm = document.getElementById('taskForm');
var saveTaskBtn = document.getElementById('saveTaskBtn');
var taskInput = document.getElementById('taskInput');
var deadlineInput = document.getElementById('deadlineInput');
var taskList = document.getElementById('taskList');

var MAX_TASK_LENGTH = 200;

// Sign in anonymously so Firebase Security Rules can require auth
firebase.auth().signInAnonymously().catch(function (error) {
    console.error('Auth error:', error.code, error.message);
});

// Toggle form saat klik tombol "Tambah Tugas"
addTaskBtn.addEventListener('click', function () {
    taskForm.classList.toggle('hidden');
});

function isValidTask(value) {
    if (!value || value.length === 0 || value.length > MAX_TASK_LENGTH) {
        return false;
    }
    // Reject strings that look like HTML/script injection
    if (/<[^>]*>/i.test(value)) {
        return false;
    }
    return true;
}

function isValidDate(value) {
    if (!value) return false;
    // Accept only YYYY-MM-DD format
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

// Build a task list item safely (no innerHTML with user data)
function createTaskElement(taskData, childSnapshot) {
    var taskItem = document.createElement('li');
    taskItem.classList.add('task-item');

    var taskSpan = document.createElement('span');
    taskSpan.textContent = taskData.task;

    var deadlineSpan = document.createElement('span');
    deadlineSpan.classList.add('deadline');
    deadlineSpan.textContent = 'Deadline: ' + taskData.deadline;

    var removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '*';

    removeBtn.addEventListener('click', function () {
        childSnapshot.ref.remove(function (error) {
            if (error) {
                alert('Gagal menghapus tugas, coba lagi.');
                console.error('Error removing task:', error);
            } else {
                alert('Tugas berhasil dihapus!');
            }
        });
    });

    taskItem.appendChild(taskSpan);
    taskItem.appendChild(deadlineSpan);
    taskItem.appendChild(removeBtn);
    return taskItem;
}

// Menyimpan tugas ke Firebase
saveTaskBtn.addEventListener('click', function () {
    var task = taskInput.value.trim();
    var deadline = deadlineInput.value;

    if (!isValidTask(task)) {
        alert('Tugas tidak valid. Maksimal ' + MAX_TASK_LENGTH + ' karakter, tanpa tag HTML.');
        return;
    }
    if (!isValidDate(deadline)) {
        alert('Silakan masukkan tanggal deadline yang valid!');
        return;
    }

    database.ref('tasks/').push({
        task: task,
        deadline: deadline
    }, function (error) {
        if (error) {
            alert('Gagal menyimpan tugas, coba lagi.');
            console.error('Error saving task:', error);
        } else {
            alert('Tugas berhasil disimpan!');
            taskInput.value = '';
            deadlineInput.value = '';
            taskForm.classList.add('hidden');
        }
    });
});

// Ambil data tugas dari Firebase dan tampilkan
database.ref('tasks/').on('value', function (snapshot) {
    taskList.innerHTML = '';
    snapshot.forEach(function (childSnapshot) {
        var taskData = childSnapshot.val();
        if (taskData && taskData.task && taskData.deadline) {
            var taskItem = createTaskElement(taskData, childSnapshot);
            taskList.appendChild(taskItem);
        }
    });
});
