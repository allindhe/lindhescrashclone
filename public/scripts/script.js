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
let console = document.getElementById("chat-box-text");
let avg = document.getElementById("avg");
let map_usage = [];


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
    // measureBotEffectiveness();
    
    if(requestID){
        window.cancelAnimationFrame(requestID);
        requestID = undefined;
    }
}

function measureBotEffectiveness(){
    if (grid && requestID){
        let tot = 0;
        grid.forEach(arr => {
            tot += arr.filter(cell => cell.isWall).length
        })
        map_usage.push(tot / (CONSTANTS.HEIGHT_CELLS * CONSTANTS.WIDTH_CELLS))
        let arrAvg = map_usage.reduce((a,b) => a + b, 0) / map_usage.length
        avg.innerText = Math.round(arrAvg * 100)
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
        } else{
            writeText(("There can only be one winner.."))
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
    players.push(new Player("Slayer", 100, 100, "#C2010E", "#ff4d00", true));
    players.push(new Player("Pruttfia", 700, 500, "#067021", "#2AE300", twoPlayers));
    players.push(new Player("Doomsday", 100, 500, "#2B1773", "#7D52D9", true));
    players.push(new Player("Söteknorr", 700, 100, "#FAD1CF", "#F5EBE2", true));

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
    writeText("\nNew game has begun!")
    init();
    startAnimating(CONSTANTS.FPS);
}

function writeText(str){
    let currentText = console.innerText;
    console.innerText = currentText + "\n" + str;
}

// KEY LISTENERS
function addKeyListeners(){
    window.addEventListener("keydown", (e)=>{
        if(e.keyCode == 37){
            if(players.length > 0){
                players[0].turnLeft()
            }
        } else if(e.keyCode == 38){
            if(players.length > 0){
                players[0].turnUp()
            }
        } else if(e.keyCode == 39){
            if(players.length > 0){
                players[0].turnRight()
            }
        } else if(e.keyCode == 40){
            if(players.length > 0){
                players[0].turnDown()
            }
        }        
        
        if(e.keyCode == 65){
            if(twoPlayers){
                players[1].turnLeft()
            }
        } else if(e.keyCode == 87){
            if(twoPlayers){
                players[1].turnUp()
            }
        } else if(e.keyCode == 68){
            if(twoPlayers){
                players[1].turnRight()
            }
        } else if(e.keyCode == 83){
            if(twoPlayers){
                players[1].turnDown()
            }
        }
    })
    window.addEventListener("keyup", (e) =>{
        if(e.keyCode == 78){
            startNewGame(true);
        } else if(e.keyCode == 77){
            startNewGame(false);
        }
    })
};

addKeyListeners();