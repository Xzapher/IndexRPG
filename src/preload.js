function exitGame() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            window.open('', '_self');
            window.close();
        }
    });
}

exitGame();