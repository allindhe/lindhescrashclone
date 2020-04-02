// IMPORTS
import {CONSTANTS} from "/scripts/constants.js";
import {makeGrid} from "/scripts/map.js";
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
let bot = new Bot();
let requestID;
let twoPlayers = false;

// Get context and scale
let c = document.getElementById("gameCanvas");
let ctx = c.getContext("2d");
ctx.canvas.width = CONSTANTS.WIDTH;
ctx.canvas.height = CONSTANTS.HEIGHT;

// Get elements
let textBox = document.getElementById("textBox");

function startAnimating(fps) {
    requestID = undefined;

    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    // animate();
    
    // request another frame
    if (!requestID){
        requestID = requestAnimationFrame(animate);
    }
}

function stopAnimating(){
    if(requestID){
        window.cancelAnimationFrame(requestID);
        requestID = undefined;
    }
}

function updatePositions(){
    // Only update alive players
    let playersAlive = players.filter((player) => player.isDead == false)

    // Update player positions
    playersAlive.forEach(player => {
        // Bot moves when active
        if (player.controlledByBot) {
            bot.botMove(grid, player);
        }

        // Update player position
        player.updatePosition();
    });

    // Check collisions
    playersAlive.forEach(player => {
        if (player.hasCrashed(grid)){
            textBox.innerText = (player.playerName + " just crashed!")
        }

        // TODO ADD CHECK WHEN PLAYER CRASHES WITH EACH OTHER
    });

    // Count players still alive
    if (playersAlive.length <= 1){
        if (playersAlive.length == 1){
            textBox.innerText = (playersAlive[0].playerName + " won!")
        } else{
            textBox.innerText = ("There can only be one winner..")
        }

        stopAnimating()
        return;
    }

    // Update grid walls for players that are still alive
    playersAlive = players.filter((player) => player.isDead == false)
    playersAlive.forEach(player => {
        grid[player.x_pixel][player.y_pixel].isWall = true;
    });
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

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        updatePositions();
        draw();
    }
}

// INIT FUNCTION
function init(){
    // Clear canvas and setup grid
    ctx.clearRect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT);
    grid = makeGrid();

    // Create players
    players = [];
    players.push(new Player("Slayer", 100, 100, "#C2010E", "#ff4d00"));
    players.push(new Player("Pruttfia", 700, 500, "#067021", "#2AE300", twoPlayers));
    players.push(new Player("Doomsday", 100, 500, "#2B1773", "#7D52D9", true));
    players.push(new Player("Söteknorr", 700, 100, "#FAD1CF", "#F5EBE2", true));

    // Add keyListeners for players
    addKeyListeners();

    // Create walls at starting positions for each player
    players.forEach(player => {
        grid[player.x_pixel][player.y_pixel].isWall = true;
    });

    // Draw starting position of each player
    players.forEach(player => {
        player.draw(ctx);
    });
}

// START A NEW GAME
function startNewGame(startWithTwoPlayers){
    twoPlayers = startWithTwoPlayers

    stopAnimating();
    textBox.innerText = "New game has begun!"
    init();
    startAnimating(CONSTANTS.FPS);
}

// KEY LISTENERS
function addKeyListeners(){
    window.addEventListener("keydown", (e)=>{
        if(players.length > 0){
            if(e.keyCode == 37){
                players[0].turnLeft()
            } else if(e.keyCode == 38){
                players[0].turnUp()
            } else if(e.keyCode == 39){
                players[0].turnRight()
            } else if(e.keyCode == 40){
                players[0].turnDown()
            } 
        }
        
        if(twoPlayers){
            if(e.keyCode == 65){
                players[1].turnLeft()
            } else if(e.keyCode == 87){
                players[1].turnUp()
            } else if(e.keyCode == 68){
                players[1].turnRight()
            } else if(e.keyCode == 83){
                players[1].turnDown()
            }
        }
    })
    window.addEventListener("keyup", (e) =>{
        if(e.keyCode == 78){
            startNewGame(false);
        } else if(e.keyCode == 77){
            startNewGame(true);
        }
    })
};
addKeyListeners();