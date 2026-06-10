// Task management logic (requires firebase-config.js to be loaded first)

const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const taskList = document.getElementById('taskList');

// Toggle form saat klik tombol "Tambah Tugas"
addTaskBtn.addEventListener('click', () => {
    taskForm.classList.toggle('hidden');
});

// Menyimpan tugas ke Firebase
saveTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    const deadline = deadlineInput.value;

    if (task && deadline) {
        database.ref('tasks/').push({
            task: task,
            deadline: deadline
        }, (error) => {
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
    } else {
        alert('Silakan masukkan tugas dan tanggal deadline!');
    }
});

// Ambil data tugas dari Firebase dan tampilkan
database.ref('tasks/').on('value', (snapshot) => {
    taskList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const taskData = childSnapshot.val();
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
            <span>${taskData.task}</span>
            <span class="deadline">Deadline: ${taskData.deadline}</span>
            <button class="remove-btn">*</button>
        `;

        taskItem.querySelector('.remove-btn').addEventListener('click', () => {
            childSnapshot.ref.remove((error) => {
                if (error) {
                    alert('Gagal menghapus tugas, coba lagi.');
                    console.error('Error removing task:', error);
                } else {
                    alert('Tugas berhasil dihapus!');
                }
            });
        });

        taskList.appendChild(taskItem);
    });
});
