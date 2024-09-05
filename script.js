// Firebase configuration (dari langkah sebelumnya)
var firebaseConfig = {
    apiKey: "AIzaSyBOIx7Q50yEQNnPmdN7OlzzGRaT30k2i1I",
    authDomain: "backup-80243.firebaseapp.com",
    projectId: "backup-80243",
    storageBucket: "backup-80243.appspot.com",
    messagingSenderId: "676376137159",
    appId: "1:676376137159:web:c717cb5f14ec5647b1dde2",
    measurementId: "G-WGCLG19BN5"
};
// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi Realtime Database
const database = firebase.database();

const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const taskList = document.getElementById('taskList');

// Toggle form tampil saat klik tombol "+"
addTaskBtn.addEventListener('click', () => {
    taskForm.classList.toggle('hidden');
});

// Menyimpan tugas ke Firebase
saveTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    const deadline = deadlineInput.value;

    if (task && deadline) {
        // Simpan tugas baru ke Firebase
        database.ref('tasks/').push({
            task: task,
            deadline: deadline
        }, (error) => {
            if (error) {
                alert('Gagal menyimpan tugas, coba lagi.');
                console.error('Error saving task:', error);
            } else {
                alert('Tugas berhasil disimpan!');
                // Kosongkan input setelah menyimpan
                taskInput.value = '';
                deadlineInput.value = '';
                taskForm.classList.add('hidden'); // Sembunyikan form setelah menyimpan
            }
        });
    } else {
        alert('Silakan masukkan tugas dan tanggal deadline!');
    }
});

// Ambil data tugas dari Firebase dan tampilkan
database.ref('tasks/').on('value', (snapshot) => {
    taskList.innerHTML = ''; // Kosongkan daftar tugas sebelum menambah tugas baru
    snapshot.forEach((childSnapshot) => {
        const taskData = childSnapshot.val();
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
            <span>${taskData.task}</span>
            <span class="deadline">Deadline: ${taskData.deadline}</span>
            <button class="remove-btn">*</button>
        `;

        // Event listener untuk menghapus tugas dari Firebase
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
