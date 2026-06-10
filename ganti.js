const moreBtn = document.getElementById('moreBtn');
if (moreBtn) {
    moreBtn.addEventListener('click', () => {
        window.location.href = 'Index.html';
    });
} else {
    console.warn('Element with ID "moreBtn" not found. Navigation button will not work.');
}
