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

// Menyimpan tugas
saveTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    const deadline = deadlineInput.value;

    if (task && deadline) {
        // Buat elemen tugas baru
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        
        // Format tanggal deadline
        const deadlineDate = new Date(deadline);
        const deadlineFormatted = deadlineDate.toLocaleDateString();

        // Teks tugas dan deadline
        taskItem.innerHTML = `
            <span>${task}</span>
            <span class="deadline">Deadline: ${deadlineFormatted}</span>
            <button class="remove-btn">*</button>
        `;

        // Tambahkan event listener untuk tombol hapus "*"
        taskItem.querySelector('.remove-btn').addEventListener('click', () => {
            taskItem.remove();
        });

        taskList.appendChild(taskItem);

        // Kosongkan input setelah disimpan
        taskInput.value = '';
        deadlineInput.value = '';
        taskForm.classList.add('hidden'); // Sembunyikan form setelah menyimpan

        // Pengecekan deadline
        checkDeadline(deadlineDate, taskItem, task);
    } else {
        alert('Silakan masukkan tugas dan tanggal deadline!');
    }
});

// Fungsi untuk mengecek deadline dan memberi notifikasi
function checkDeadline(deadlineDate, taskItem, task) {
    const currentDate = new Date();
    const timeDiff = deadlineDate - currentDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Konversi ms ke hari

    if (daysDiff <= 3 && daysDiff > 0) {
        alert(`Tugas "${task}" memiliki deadline mendekati (${daysDiff} hari lagi)!`);
    } else if (daysDiff <= 0) {
        // Jika deadline lewat, hapus tugas dari daftar
        taskItem.remove();
        alert(`Tugas "${task}" telah lewat deadline dan dihapus.`);
    }

    // Lakukan pengecekan setiap detik untuk memastikan tugas yang melewati deadline terhapus
    setInterval(() => {
        const now = new Date();
        if (deadlineDate < now) {
            taskItem.remove();
            alert(`Tugas "${task}" telah melewati deadline dan telah dihapus.`);
        }
    }, 1000 * 60 * 60); // Cek setiap jam
}
