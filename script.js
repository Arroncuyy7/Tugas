// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBOIx7Q50yEQNnPmdN7OlzzGRaT30k2i1I",
    authDomain: "backup-80243.firebaseapp.com",
    projectId: "backup-80243",
    storageBucket: "backup-80243.appspot.com",
    messagingSenderId: "676376137159",
    appId: "1:676376137159:web:c717cb5f14ec5647b1dde2",
    measurementId: "G-WGCLG19BN5"
};

// Inisialisasi Firebase with error handling
let database;
try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
} catch (error) {
    console.error('Firebase initialization failed:', error);
    alert('Aplikasi gagal terhubung ke server. Silakan muat ulang halaman.');
}

const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const taskList = document.getElementById('taskList');

// Guard against missing DOM elements
if (!addTaskBtn || !taskForm || !saveTaskBtn || !taskInput || !deadlineInput || !taskList) {
    console.error('Required DOM elements not found. Ensure the HTML contains elements with IDs: addTaskBtn, taskForm, saveTaskBtn, taskInput, deadlineInput, taskList.');
}

// Toggle form tampil saat klik tombol "+"
if (addTaskBtn && taskForm) {
    addTaskBtn.addEventListener('click', () => {
        taskForm.classList.toggle('hidden');
    });
}

// Menyimpan tugas ke Firebase
if (saveTaskBtn && taskInput && deadlineInput && taskForm && database) {
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
}

// Ambil data tugas dari Firebase dan tampilkan
if (database && taskList) {
    database.ref('tasks/').on('value', (snapshot) => {
        taskList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const taskData = childSnapshot.val();
            if (!taskData || !taskData.task || !taskData.deadline) {
                console.warn('Skipping malformed task entry:', childSnapshot.key, taskData);
                return;
            }
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
    }, (error) => {
        console.error('Error listening to tasks:', error);
        alert('Gagal memuat daftar tugas. Periksa koneksi internet Anda.');
    });
}
