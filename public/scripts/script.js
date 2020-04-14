// IMPORTS
import {CONSTANTS} from "/scripts/constants.js";
import {map} from "/scripts/map.js";
import {Player} from "/scripts/player.js";
import {Bot} from "/scripts/bot.js";

// GLOBALS
let grid;
let players = [];
let fpsInterval;
let then;
let now;
let startTime;
let elapsed;

let updatedPositionCounter = 0
let animationCounter = 1;

let requestID;
let twoPlayers = false;

let mapSize = 1;
let gameSpeed = 1;
let difficultyPruttfia = 1;
let difficultyDoomsday = 1;
let difficultySoteknorr = 1;

// Get context and scale
let c = document.getElementById("gameCanvas");
let ctx = c.getContext("2d");
ctx.canvas.width = CONSTANTS.WIDTH;
ctx.canvas.height = CONSTANTS.HEIGHT;

// Get html elements
let chatBox = document.getElementById("chat-box-text");
let leaderboard = document.getElementsByClassName("leaderboard")[0];
let firstPlaceName = document.getElementById("first-place-name");
let firstPlaceScore = document.getElementById("first-place-score");
let secondPlaceName = document.getElementById("second-place-name");
let secondPlaceScore = document.getElementById("second-place-score");
let thirdPlaceName = document.getElementById("third-place-name");
let thirdPlaceScore = document.getElementById("third-place-score");

function startAnimating(fps) {
    requestID = undefined;

    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    
    // request another frame
    if (!requestID){
        requestID = requestAnimationFrame(animate);
    }
}

function stopAnimating(){    
    if(requestID){
        window.cancelAnimationFrame(requestID);
        requestID = undefined;
        exit();
    }
}

function updatePositions(){
    // Only update alive players
    let playersAlive = players.filter((player) => player.isDead == false)

    // Update player positions
    playersAlive.forEach(player => {
        // Bot moves when active
        if (player.controlledByBot != null) {
            if (twoPlayers && player.id == 1) {
                // Don't move player 2 if it's a 2-player game
            } else{
                player.controlledByBot.botMove(grid, player);
            }
        }

        // Update player position
        player.updatePosition();
    });

    // Check collisions
    playersAlive.forEach(player => {
        if (player.hasCrashed(grid)){
            writeText((player.playerName + " just crashed!"))
        }

        // Check collisions with other players
        playersAlive.forEach(player2 =>{
            if (player.playerCrashedWithPlayer(player2)){
                writeText((player.playerName + " and " + player2.playerName + " sadly killed each other."))
            }
        })
    });

    // Count players still alive
    playersAlive = players.filter((player) => player.isDead == false)
    if (playersAlive.length <= 1){
        if (playersAlive.length == 1){
            writeText((playersAlive[0].playerName + " won!"))
            playersAlive[0].numberOfWins += 1;
        } else{
            writeText(("There can only be one winner.."))
        }

        // Draw last frame and stop the animation
        draw()
        stopAnimating()
        return;
    }

    // Update grid walls for players that are still alive
    playersAlive = players.filter((player) => player.isDead == false)
    playersAlive.forEach(player => {
        grid[player.x_pixel][player.y_pixel].isWall = true;
    });

    // If no human players are left, increase game speed
    if (players[0].isDead && (!twoPlayers || players[1].isDead)){
        fpsInterval = 2;
    }
}

function draw(){
    players.forEach(player => {
        player.draw(ctx);
    });
}

function animate() {
    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // request another frame
    if (requestID){
        requestID = window.requestAnimationFrame(animate);
    }

    // Buffer position update for better performance
    if (updatedPositionCounter < animationCounter) {
        updatePositions();
        updatedPositionCounter++;
    }

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        draw();

        animationCounter++
    }
}

function updateLeaderBoard(){
    let tmpArr = players.slice().sort((a, b) => b.numberOfWins - a.numberOfWins);

    firstPlaceName.innerText = tmpArr[0].playerName;
    firstPlaceScore.innerText = tmpArr[0].numberOfWins;
    secondPlaceName.innerText = tmpArr[1].playerName;
    secondPlaceScore.innerText = tmpArr[1].numberOfWins;
    thirdPlaceName.innerText = tmpArr[2].playerName;
    thirdPlaceScore.innerText = tmpArr[2].numberOfWins;
}

// INIT FUNCTION
function init(){
    // Set map size and game speed
    map.setMapSize(mapSize);
    map.setGameSpeed(gameSpeed);

    // Clear canvas and setup grid
    ctx.clearRect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT);
    grid = map.makeGrid();

    // Create players / reset player positions
    if (players.length == 0){
        players.push(new Player(0, "Slayer", 100, 100, "#C2010E", "#ff4d00"));
        players.push(new Player(1, "Pruttfia", 700, 500, "#067021", "#2AE300", new Bot()));
        players.push(new Player(2, "Doomsday", 100, 500, "#2B1773", "#7D52D9", new Bot()));
        players.push(new Player(3, "Söteknorr", 700, 100, "#FAD1CF", "#F5EBE2", new Bot()));
    } else {
        players[0].init(100, 100);
        players[1].init(700, 500);
        players[2].init(100, 500);
        players[3].init(700, 100);
    }

    // Set bot difficulties
    players[1].controlledByBot.setDifficulty(difficultyPruttfia);
    players[2].controlledByBot.setDifficulty(difficultyDoomsday);
    players[3].controlledByBot.setDifficulty(difficultySoteknorr);

    // Create walls at starting positions for each player
    players.forEach(player => {
        grid[player.x_pixel][player.y_pixel].isWall = true;
    });

    // Draw starting position of each player
    players.forEach(player => {
        player.draw(ctx);
    });
}

// EXIT FUNCTION
function exit(){
    updateLeaderBoard();
}

// START A NEW GAME
function startNewGame(){
    stopAnimating();
    writeText("\nNew game has begun!")
    init();
    startAnimating(CONSTANTS.FPS);
}

function writeText(str){
    let currentText = chatBox.innerText;
    chatBox.innerText = currentText + "\n" + str;
}

// KEY LISTENERS
function addKeyListeners(){
    window.addEventListener("keydown", (e)=>{
        if(e.keyCode == 37){
            players[0].turnLeft();
            e.preventDefault();
        } else if(e.keyCode == 38){
            players[0].turnUp();
            e.preventDefault();
        } else if(e.keyCode == 39){
            players[0].turnRight();
            e.preventDefault();
        } else if(e.keyCode == 40){
            players[0].turnDown();
            e.preventDefault();
        }        
        
        if(e.keyCode == 65){  // a
            if (twoPlayers){
                players[1].turnLeft()
            }
        } else if(e.keyCode == 87){  // w
            if (twoPlayers){
                players[1].turnUp()
            }
        } else if(e.keyCode == 68){  // d
            if (twoPlayers){
                players[1].turnRight()
            }
        } else if(e.keyCode == 83){  // s
            if (twoPlayers){
                players[1].turnDown()
            }
        }
    })
    window.addEventListener("keyup", (e) =>{
        if(e.keyCode == 78){  // n
            twoPlayers = false;
            startNewGame();
        } else if(e.keyCode == 77){  // m
            twoPlayers = true;
            startNewGame();
        }
    })

    // Toggle settings
    $(".toggle-settings").on("click", function(){
        $("#settings").toggleClass("settings-hidden");
    });

    // Map size and game speed
    $(".map-size-group > label").on("click", function(){
        mapSize = $(this).find('input').val();
    });
    $(".game-speed-group > label").on("click", function(){
        gameSpeed = $(this).find('input').val();
    });

    // Bot difficulty
    $(".difficulty-pruttfia-group > label").on("click", function(){
        difficultyPruttfia = $(this).find('input').val();
    });
    $(".difficulty-doomsday-group > label").on("click", function(){
        difficultyDoomsday = $(this).find('input').val();
    });
    $(".difficulty-soteknorr-group > label").on("click", function(){
        difficultySoteknorr = $(this).find('input').val();
    });
};

addKeyListeners();