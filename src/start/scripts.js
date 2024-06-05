var audio = new Audio('../resources/sounds/popup.mp3');

function exitGame() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            audio.play();
            setTimeout(function() {
                location.href = '../home/index.html';
            }, 100);
        }
    });
}

exitGame();