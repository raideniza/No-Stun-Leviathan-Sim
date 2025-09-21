window.onload = function () {

    const protMageOff = new Image();
    const protRangeOff = new Image();
    const protMeleeOff = new Image();
    const protMageOn = new Image();
    const protRangeOn = new Image();
    const protMeleeOn = new Image();
    const protMageOverhead = new Image();
    const protRangeOverhead = new Image();
    const protMeleeOverhead = new Image();
    const leviathanMage = new Image();
    const leviathanRange = new Image();
    const leviathanMelee = new Image();
    const zeroHitsplat = new Image();
    const oneHitsplat = new Image();

    protMageOff.src = "./assets/Protect_from_Magic.png";
    protRangeOff.src = "./assets/Protect_from_Missiles.png";
    protMeleeOff.src = "./assets/Protect_from_Melee.png";
    protMageOn.src = "./assets/prot_mage_on.png";
    protRangeOn.src = "./assets/prot_range_on.png";
    protMeleeOn.src = "./assets/prot_melee_on.png";
    protMageOverhead.src = "./assets/Protect_from_Magic_overhead.png";
    protRangeOverhead.src = "./assets/Protect_from_Missiles_overhead.png";
    protMeleeOverhead.src = "./assets/Protect_from_Melee_overhead.png";
    leviathanMage.src = "./assets/Leviathan_magic_attack.png";
    leviathanRange.src = "./assets/Leviathan_ranged_attack.png";
    leviathanMelee.src = "./assets/Leviathan_melee_attack.png";
    zeroHitsplat.src = "./assets/Zero_damage_hitsplat.png";
    oneHitsplat.src = "./assets/Damage_hitsplat_1.png";

    
    let backgroundCanvas = document.getElementById("backgroundCanvas");
    let backgroundContext = backgroundCanvas.getContext("2d");

    let overheadAnimationCanvas = document.getElementById("overheadAnimationCanvas");
    let overheadAnimationContext = overheadAnimationCanvas.getContext("2d");

    let leviathanAnimationCanvas = document.getElementById("leviathanAnimationCanvas");
    let leviathanAnimationContext = leviathanAnimationCanvas.getContext("2d");

    let hitsplatAnimationCanvas = document.getElementById("hitsplatAnimationCanvas");
    let hitsplatAnimationContext = hitsplatAnimationCanvas.getContext("2d");

    let tickCounterCanvas = document.getElementById("tickCounterCanvas");
    let tickCounterContext = tickCounterCanvas.getContext("2d");

    let magePrayerCanvas = document.getElementById("magePrayerCanvas");
    let magePrayerContext = magePrayerCanvas.getContext("2d");

    let rangePrayerCanvas = document.getElementById("rangePrayerCanvas");
    let rangePrayerContext = rangePrayerCanvas.getContext("2d");

    let meleePrayerCanvas = document.getElementById("meleePrayerCanvas");
    let meleePrayerContext = meleePrayerCanvas.getContext("2d");

    let chatCanvas = document.getElementById("chatCanvas");
    let chatContext = chatCanvas.getContext("2d");


    let xCoordOverhead = 383;
    let yCoordOverhead = 238;

    let xCoordLeviathanAttack = 420;
    let yCoordLeviathanAttack = 128;

    var tickCounterEnabled = true;
    var tickCounterIsWhite = true;

    var selectedPrayer = '';
    var activePrayer = '';
    var queuedLeviathanAttack = 'none';

    let currentStreak = 0;
    let previousStreak = 0;
    let highestStreak = 0;

    let hitsplatPositions = [
        { x: 384, y: 278, name: 'bottom' },
        { x: 384, y: 258, name: 'top' },
        { x: 368, y: 268, name: 'left' },
        { x: 400, y: 268, name: 'right' }
    ];

    let currentHitsplats = [];
    let currentPositionIndex = 0;


    const angleDropdown = document.getElementById("angle");
    angleDropdown.onchange = ( () => {
        updateBackground(angleDropdown.value);
        if (angleDropdown.value === "Up") {
            xCoordOverhead = 383;
            yCoordOverhead = 238;

            xCoordLeviathanAttack = 420;
            yCoordLeviathanAttack = 128;

            hitsplatPositions = [
                { x: 384, y: 278, name: 'bottom' },
                { x: 384, y: 258, name: 'top' },
                { x: 368, y: 268, name: 'left' },
                { x: 400, y: 268, name: 'right' }
            ];
        }
        else if (angleDropdown.value === "Down") {
            xCoordOverhead = 382;
            yCoordOverhead = 212;

            xCoordLeviathanAttack = 490;
            yCoordLeviathanAttack = 149;

            hitsplatPositions = [
                { x: 384, y: 263, name: 'bottom' },
                { x: 384, y: 243, name: 'top' },
                { x: 368, y: 253, name: 'left' },
                { x: 400, y: 253, name: 'right' }
            ];
        }
    });

    const tickCounterDropdown = document.getElementById("tickCounter");
    tickCounterDropdown.onchange = ( () => {
        tickCounterEnabled = !tickCounterEnabled;
        tickCounterContext.clearRect(0, 0, tickCounterCanvas.width, tickCounterCanvas.height);
    });


    var ping = document.getElementById('ping').value;
    const pingInputSlider = document.getElementById('ping');
    const pingInputSliderValue = document.getElementById('ping-value');
    pingInputSlider.oninput = ( () => {
        pingInputSliderValue.textContent = pingInputSlider.value + " ms";
        ping = pingInputSlider.value;
        
        currentStreak = 0;
        previousStreak = 0;
        highestStreak = 0;
        // updateStreakText();
    });

    const background = new Image();
    background.src = "./assets/backgroundUp.png";
    background.onload = function () {
        updateBackground(angleDropdown.value);
    }

    function updateBackground(angle) {
        path = "./assets/background" + angle + ".png";
        background.src = path;

        background.onload = function () {
            backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            backgroundContext.drawImage(background, 0, 0);
        }
    }




    gameTick();


    function gameTick() {
        setInterval(() => {

            drawPrayers();
            processAttack();
            drawChat();
            drawLeviathanAttack();

            if (tickCounterEnabled === true) {
                tickCounterIsWhite = !tickCounterIsWhite;
                let tickCounterColor = tickCounterIsWhite ? 'white' : 'black';
                drawTickCounterSquare(tickCounterColor);
            }

        }, 600);
    }


    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    function processAttack() {
        if (queuedLeviathanAttack === activePrayer) {
            currentHitsplats.push({ image: zeroHitsplat, index: currentPositionIndex});
            currentStreak = currentStreak + 1;
        }
        else {
            currentHitsplats.push({image: oneHitsplat, index: currentPositionIndex});
            if (currentStreak > highestStreak) {
                highestStreak = currentStreak;
            }
            if (currentStreak > 0) {
                previousStreak = currentStreak;
            }
            currentStreak = 0;
        }

        hitsplatAnimationContext.clearRect(0, 0, hitsplatAnimationCanvas.width, hitsplatAnimationCanvas.height);
        if (currentHitsplats.length === 3) { currentHitsplats = currentHitsplats.slice(1); }

        for (let i = 0; i < currentHitsplats.length; i++) {
            hitsplatAnimationContext.drawImage(currentHitsplats[i].image, hitsplatPositions[currentHitsplats[i].index].x, hitsplatPositions[currentHitsplats[i].index].y);
        }


        currentPositionIndex = (currentPositionIndex + 1) % hitsplatPositions.length;
    }


    function drawLeviathanAttack() {
        leviathanAnimationContext.clearRect(0, 0, leviathanAnimationCanvas.width, leviathanAnimationCanvas.height);

        let randomInt = randomIntFromInterval(1, 3);
        if (randomInt === 1) {
            queuedLeviathanAttack = 'mage';
            leviathanAnimationContext.drawImage(leviathanMage, xCoordLeviathanAttack, yCoordLeviathanAttack, 65, 65);
        }
        if (randomInt === 2) {
            queuedLeviathanAttack = 'range';
            leviathanAnimationContext.drawImage(leviathanRange, xCoordLeviathanAttack, yCoordLeviathanAttack, 65, 65);
        }
        if (randomInt === 3) {
            queuedLeviathanAttack = 'melee';
            leviathanAnimationContext.drawImage(leviathanMelee, xCoordLeviathanAttack, yCoordLeviathanAttack, 65, 65);
        }
    }


    function drawPrayers() {
        overheadAnimationContext.clearRect(0, 0, overheadAnimationCanvas.width, overheadAnimationCanvas.height);
        switch (selectedPrayer) {
            case "none":
                activePrayer = 'none';
                break;
            case "mage":
                rangePrayerContext.clearRect(0, 0, rangePrayerCanvas.width, rangePrayerCanvas.height);
                meleePrayerContext.clearRect(0, 0, meleePrayerCanvas.width, meleePrayerCanvas.height);
                overheadAnimationContext.drawImage(protMageOverhead, xCoordOverhead, yCoordOverhead);
                activePrayer = 'mage';
                break;
            case "range":
                magePrayerContext.clearRect(0, 0, magePrayerCanvas.width, magePrayerCanvas.height);
                meleePrayerContext.clearRect(0, 0, meleePrayerCanvas.width, meleePrayerCanvas.height);
                overheadAnimationContext.drawImage(protRangeOverhead, xCoordOverhead, yCoordOverhead);
                activePrayer = 'range';
                break;
            case "melee":
                magePrayerContext.clearRect(0, 0, magePrayerCanvas.width, magePrayerCanvas.height);
                rangePrayerContext.clearRect(0, 0, rangePrayerCanvas.width, rangePrayerCanvas.height);
                overheadAnimationContext.drawImage(protMeleeOverhead, xCoordOverhead, yCoordOverhead);
                activePrayer = 'melee';
                break;
        }
    }


    function drawChat() {
        chatContext.clearRect(0, 0, chatCanvas.width, chatCanvas.height);
        chatContext.font = "16px osrsChatFont";
        chatContext.fillText("Current Streak: " + currentStreak, 11, 116);
        chatContext.fillText("Previous Streak: " + previousStreak, 11, 102);
        chatContext.fillText("Highest Streak: " + highestStreak, 11, 88)
    }


    function drawTickCounterSquare(color) {
        tickCounterContext.clearRect(0, 0, 25, 25);
        tickCounterContext.fillStyle = color;
        tickCounterContext.fillRect(0, 0, 25, 25);
    }





    magePrayerCanvas.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            if (selectedPrayer !== 'mage') {
                magePrayerContext.drawImage(protMageOn, 0, 0);
                setTimeout(() => {
                    selectedPrayer = 'mage';
                }, ping);
            }
            else {
                magePrayerContext.clearRect(0, 0, magePrayerCanvas.width, magePrayerCanvas.height);
                setTimeout(() => {
                    selectedPrayer = 'none';
                }, ping);
            }
        }
    });

    rangePrayerCanvas.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            if (selectedPrayer !== 'range') {
                rangePrayerContext.drawImage(protRangeOn, 0, 0);
                setTimeout(() => {
                    selectedPrayer = 'range';
                }, ping);
            }
            else {
                rangePrayerContext.clearRect(0, 0, rangePrayerCanvas.width, rangePrayerCanvas.height);
                setTimeout(() => {
                    selectedPrayer = 'none';
                }, ping);
            }
        }
    });

    meleePrayerCanvas.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            if (selectedPrayer !== 'melee') {
                meleePrayerContext.drawImage(protMeleeOn, 0, 0);
                setTimeout(() => {
                    selectedPrayer = 'melee';
                }, ping);
            }
            else {
                meleePrayerContext.clearRect(0, 0, meleePrayerCanvas.width, meleePrayerCanvas.height);
                setTimeout(() => {
                    selectedPrayer = 'none';
                }, ping);
            }
        }
    });


    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}