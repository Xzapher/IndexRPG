class Character {
    constructor(name, health, mana, damage) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.mana = mana;
        this.maxMana = mana;
        this.damage = damage;
    }
}

class BattleManager {
    constructor() {
        this.characterStats = [];
        this.allies = [];
        this.enemies = [];
        this.selectedAlly = null;
        this.selectedEnemy = null;
        this.selectedAllyId = null;
        this.selectedEnemyId = null;
        this.lastAllyAction = null;
        this.isAlly1Alive = true;
        this.isAlly2Alive = true;
        this.isAlly3Alive = true;
        this.isEnemy1Alive = true;
        this.isEnemy2Alive = true;
        this.isEnemy3Alive = true;
    }

    async initialize() {
        const preloadImage = (url) => {
            const img = new Image();
            img.src = url;
        }
        
        const preloadAudio = (url) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
        }
        
        preloadImage('../resources/img/effects/slash.gif');
        preloadImage('../resources/img/effects/mana.gif');
        preloadImage('../resources/img/effects/heal.gif');
        preloadAudio('../resources/sounds/slash.mp3');
        preloadAudio('../resources/sounds/mana.mp3');
        preloadAudio('../resources/sounds/heal.ogg');

        await this.fetchCharacterStats();
        this.assignStatsToCharacters();
        this.setupEventListeners();
        this.randomBackgroundInGame();
    }

    async fetchCharacterStats() {
        try {
            const response = await fetch('http://localhost:5054/api/CharacterStats');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            this.characterStats = await response.json();
        } catch (error) {
            console.error('Error fetching character stats:', error);
        }
    }

    randomBackgroundInGame() {
        const randomNumber = Math.floor(Math.random() * 3) + 1;
        var audio = new Audio(`../resources/music/${randomNumber}.mp3`);
        audio.loop = true;
        document.body.style.backgroundImage = `url('../resources/backgrounds/battleBg${randomNumber}.gif')`;
        audio.play()
    }

    getRandomUniqueNumbers(count, min, max) {
        const uniqueNumbers = new Set();
        while (uniqueNumbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            uniqueNumbers.add(randomNumber);
        }
        return Array.from(uniqueNumbers);
    }

    assignStatsToCharacters() {
        const allyContainer = document.getElementById('allies');
        const enemyContainer = document.getElementById('enemies');

        // Generate unique random numbers for allies and enemies
        const uniqueNumbers = this.getRandomUniqueNumbers(6, 0, this.characterStats.length - 1);

        // Assign stats and images to allies
        uniqueNumbers.slice(0, 3).forEach((num, index) => {
            const stats = this.characterStats[num];
            const ally = new Character(stats.name, stats.health, stats.mana, stats.damage);
            ally.id = index + 1;
            this.allies.push(ally);

            const allyImg = this.createCharacterImage(ally, `ally${index + 1}`, stats);
            allyContainer.appendChild(allyImg);
        });

        uniqueNumbers.slice(3).forEach((num, index) => {
            const stats = this.characterStats[num];
            const enemy = new Character(stats.name, stats.health, stats.mana, stats.damage);
            enemy.id = index + 1;
            this.enemies.push(enemy);

            const enemyImg = this.createCharacterImage(enemy, `enemy${index + 1}`, stats);
            enemyContainer.appendChild(enemyImg);
        });

        console.log('Allies:', this.allies);
        console.log('Enemies:', this.enemies);
    }

    createCharacterImage(character, id, stats) {
        const img = document.createElement('img');
        img.src = `../resources/img/sprites/${stats.id}.gif`;
        img.id = id;
        img.setAttribute('data-stats', JSON.stringify(stats));
        img.addEventListener('click', () => {
            this.selectCharacter(character, id);
        });
        return img;
    }

    selectAlly(character, id) {
        if (this.selectedAllyId) {
            try {
                document.getElementById(this.selectedAllyId).style.filter = 'none';
            } catch {
                true;
            }
        }
        this.selectedAlly = character;
        this.selectedAllyId = id;
        document.getElementById(this.selectedAllyId).style.filter = 'drop-shadow(0 0 10px blue)';
        console.log('Selected ally:', this.selectedAlly);

        // Actualiza la información del aliado
        this.updateCharacterInfo(this.selectedAlly, 'allyInfo', 'bottom-left');
    }

    selectEnemy(character, id) {
        if (this.selectedEnemyId) {
            try {
                document.getElementById(this.selectedEnemyId).style.filter = 'none';
            } catch {
                true;
            }
        }
        this.selectedEnemy = character;
        this.selectedEnemyId = id;
        document.getElementById(this.selectedEnemyId).style.filter = 'drop-shadow(0 0 10px red)';
        console.log('Selected enemy:', this.selectedEnemy);

        // Actualiza la información del enemigo
        this.updateCharacterInfo(this.selectedEnemy, 'enemyInfo', 'bottom-right');
    }

    selectCharacter(character, id) {
        if (id.startsWith('ally')) {
            this.selectAlly(character, id);
        } else if (id.startsWith('enemy')) {
            this.selectEnemy(character, id);
        }
    }


    updateCharacterInfo(character, infoId, position) {
        let infoContainer = document.getElementById(infoId);
        if (!infoContainer) {
            infoContainer = document.createElement('div');
            infoContainer.id = infoId;
            infoContainer.style.fontSize = '2vh';
            infoContainer.style.color = 'white';
            infoContainer.style.width = '30vh';
            infoContainer.style.position = 'fixed';
            infoContainer.style.padding = '30px';
            infoContainer.style.margin = '10px';
            infoContainer.style.display = 'flex';
            infoContainer.style.gap = '10px';
            infoContainer.style.flexDirection = 'column';
            infoContainer.style.border = '4px solid yellow';
            infoContainer.style.backgroundColor = 'rgba(35, 35, 35, 1)';

            // Crear un elemento @font-face para la fuente PixelFont
            const pixelFont = new FontFace('PixelFont', 'url(../resources/fonts/SmallPixelFont/font.ttf)');

            // Cargar la fuente
            pixelFont.load().then((font) => {
                // Agregar la fuente al documento
                document.fonts.add(font);

                // Establecer el estilo de la fuente para infoContainer
                infoContainer.style.fontFamily = 'PixelFont, sans-serif';
            });

            // Establece la posición del contenedor
            if (position === 'bottom-left') {
                infoContainer.style.left = '20px';
                infoContainer.style.bottom = '20px';
            } else if (position === 'bottom-right') {
                infoContainer.style.right = '20px';
                infoContainer.style.bottom = '20px';
            }

            document.body.appendChild(infoContainer);
        }

        // Actualiza la información del personaje
        infoContainer.innerHTML = `
            <div>${character.name}</div>
            <div>HP: ${character.health}/${character.maxHealth}</div>
            <div>Mana: ${character.mana}/${character.maxMana}</div>
            <div>Damage: ${character.damage}</div>
        `;
    }

    setupEventListeners() {
        document.getElementById('attackBtn').addEventListener('click', () => this.attack());
        document.getElementById('restoreManaBtn').addEventListener('click', () => this.restoreMana());
        document.getElementById('restoreHealthBtn').addEventListener('click', () => this.restoreHealth());
    }

    attack() {
        if (!this.selectedAlly || !this.selectedEnemy || this.selectedAlly.mana < 15) return;

        const damage = this.selectedAlly.damage;
        this.selectedEnemy.health -= damage;
        this.selectedAlly.mana -= 15;

        if (this.selectedEnemy.health < 0) {
            this.selectedEnemy.health = 0;
        }

        console.log(`${this.selectedAlly.name} atacó a ${this.selectedEnemy.name} causando ${damage} puntos de daño.`);

        this.playAnimation(this.selectedEnemyId, 500, '../resources/sounds/slash.mp3', '../resources/img/effects/slash.gif');

        this.checkCharacterHealth();
        this.lastAllyAction = this.selectedAlly;
        this.endTurn();

        this.updateCharacterInfo(this.selectedAlly, 'allyInfo', 'bottom-left');
        this.updateCharacterInfo(this.selectedEnemy, 'enemyInfo', 'bottom-right');
    }


    restoreMana() {
        if (!this.selectedAlly) return;

        const restoredMana = 40;
        this.playAnimation(this.selectedAllyId, 1000, '../resources/sounds/mana.mp3', '../resources/img/effects/mana.gif');
        this.selectedAlly.mana = this.selectedAlly.mana + restoredMana;

        if (this.selectedAlly.mana > this.selectedAlly.maxMana) {
            this.selectedAlly.mana = this.selectedAlly.maxMana;
        }

        console.log(`${this.selectedAlly.name} restauró ${restoredMana} puntos de de maná.`);
        this.lastAllyAction = this.selectedAlly;
        this.endTurn();

        this.updateCharacterInfo(this.selectedAlly, 'allyInfo', 'bottom-left');
    }

    restoreHealth() {
        if (!this.selectedAlly) return;

        const restoredHealth = this.selectedAlly.maxHealth * 0.3;
        this.playAnimation(this.selectedAllyId, 1000, '../resources/sounds/heal.ogg', '../resources/img/effects/heal.gif');
        this.selectedAlly.health = Math.min(this.selectedAlly.health + restoredHealth, this.selectedAlly.maxHealth);
        console.log(`${this.selectedAlly.name} restauró ${restoredHealth} puntos de vida.`);
        this.lastAllyAction = this.selectedAlly;

        this.endTurn();

        this.updateCharacterInfo(this.selectedAlly, 'allyInfo', 'bottom-left');
    }


    checkCharacterHealth() {
        this.updateCharacterLifeStatus();
        this.handleCharacterRemoval();
    }

    updateCharacterLifeStatus() {
        this.isAlly1Alive = this.allies[0].health > 0;
        this.isAlly2Alive = this.allies[1].health > 0;
        this.isAlly3Alive = this.allies[2].health > 0;

        this.isEnemy1Alive = this.enemies[0].health > 0;
        this.isEnemy2Alive = this.enemies[1].health > 0;
        this.isEnemy3Alive = this.enemies[2].health > 0;
    }

    handleCharacterRemoval() {
        if (!this.isAlly1Alive) {
            document.getElementById('ally1').style.display = 'none';
            this.isAlly1Alive = false;
        }
        if (!this.isAlly2Alive) {
            document.getElementById('ally2').style.display = 'none';
            this.isAlly2Alive = false;
        }
        if (!this.isAlly3Alive) {
            document.getElementById('ally3').style.display = 'none';
            this.isAlly3Alive = false;
        }

        if (!this.isEnemy1Alive) {
            document.getElementById('enemy1').style.display = 'none';
            this.isEnemy1Alive = false;
        }
        if (!this.isEnemy2Alive) {
            document.getElementById('enemy2').style.display = 'none';
            this.isEnemy2Alive = false;
        }
        if (!this.isEnemy3Alive) {
            document.getElementById('enemy3').style.display = 'none';
            this.isEnemy3Alive = false;
        }

        if (!this.isAlly1Alive && !this.isAlly2Alive && !this.isAlly3Alive) {
            console.log('Enemies win!');
        } else if (!this.isEnemy1Alive && !this.isEnemy2Alive && !this.isEnemy3Alive) {
            console.log('Allies win!');
        }
    }

    endTurn() {
        const attackBtn = document.getElementById('attackBtn');
        const hpBtn = document.getElementById('restoreHealthBtn');
        const manaBtn = document.getElementById('restoreManaBtn');
        attackBtn.disabled = true;
        hpBtn.disabled = true;
        manaBtn.disabled = true;
        console.log('Fin del turno.');
        setTimeout(() => {
            this.enemyAttack();
            attackBtn.disabled = false;
            hpBtn.disabled = false;
            manaBtn.disabled = false;
        }, 1000);
    }
    

    playAnimation(target, time, urlSound, urlAnimation) {
        try {
            const anim = document.getElementById(target);
            const slashImg = document.createElement('img');
            const audio = new Audio(urlSound);
            slashImg.src = urlAnimation;
            slashImg.style.position = 'fixed';
            slashImg.style.top = `${anim.offsetTop - 100}px`;
            slashImg.style.left = `${anim.offsetLeft - 100}px`;
            slashImg.style.width = '40vh';
            slashImg.style.height = '40vh';
            slashImg.style.zIndex = '999';
            document.body.appendChild(slashImg);
            audio.play();
    
            requestAnimationFrame(() => {
                setTimeout(() => {
                    document.body.removeChild(slashImg);
                }, time);
            });
        } catch {
            throw false;
        }
    }
    

    enemyAttack() {
        const aliveEnemies = this.enemies.filter(enemy => enemy.health > 0);
        if (aliveEnemies.length === 0) return; // Si no hay enemigos vivos, no se puede atacar.
    
        const randomEnemyIndex = Math.floor(Math.random() * aliveEnemies.length);
        const selectedEnemy = aliveEnemies[randomEnemyIndex];
    
        // Obtener el ID del enemigo seleccionado
        const selectedEnemyId = `enemy${selectedEnemy.id}`;
    
        const lastAlly = this.lastAllyAction;
    
        if (selectedEnemy.mana < 15) {
            selectedEnemy.mana += 40;
            this.playAnimation(selectedEnemyId, 1000, '../resources/sounds/mana.mp3', '../resources/img/effects/mana.gif');
            console.log(`${selectedEnemy.name} regeneró 40 puntos de maná.`);
            this.updateCharacterInfo(selectedEnemy, 'enemyInfo', 'bottom-right');
        } else {
            lastAlly.health -= selectedEnemy.damage;
            selectedEnemy.mana -= 15;
    
            this.playAnimation(this.selectedAllyId, 500, '../resources/sounds/slash.mp3', '../resources/img/effects/slash.gif');
    
            console.log(`${selectedEnemy.name} atacó a ${lastAlly.name} causando ${selectedEnemy.damage} puntos de daño.`);
            this.updateCharacterInfo(selectedEnemy, 'enemyInfo', 'bottom-right');
            this.updateCharacterInfo(this.selectedAlly, 'allyInfo', 'bottom-left');
            this.checkCharacterHealth();
        }
    }
    
}

const battleManager = new BattleManager();
battleManager.initialize();

