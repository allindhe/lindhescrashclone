// IMPORTS
import {CONSTANTS} from "/js/constants.js";
import {makeGrid} from "/js/map.js";
import {Player} from "/js/player.js";

// GLOBALS
let grid;
let p1;
let p2;
let fpsInterval;
let then;
let now;
let startTime;
let elapsed;
let p2_input = 0;  // 0 = bot, 1 = player


// Get context and scale
let c = document.getElementById("gameCanvas");
let ctx = c.getContext("2d");
ctx.canvas.width = CONSTANTS.WIDTH;
ctx.canvas.height = CONSTANTS.HEIGHT;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    // request another frame
    let requestID = requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        
        // Bot moves when active
        if (p2_input == 0) {
            bot.botMove(grid, p2);
        }

        // Update player positions
        p1.updatePosition();
        p2.updatePosition();

        // Check collisions
        let p1_crash = p1.hasCrashed(grid);
        let p2_crash = p2.hasCrashed(grid);
        if (p1_crash || p2_crash){
            if (p1_crash && p2_crash){
                console.log("That's a draw boii")
            }else if(p1_crash){
                console.log("p1 crashed")
            }else if(p2_crash){
                console.log("p2 crashed")
            }
            cancelAnimationFrame(requestID)
            return 0
        }
        if (p1.x_pixel == p2.x_pixel && p1.y_pixel == p2.y_pixel){
            console.log("That's a draw boii")
            cancelAnimationFrame(requestID)
            return 0
        }

        // Update grid walls
        grid[p1.x_pixel][p1.y_pixel].isWall = true;
        grid[p2.x_pixel][p2.y_pixel].isWall = true;
        
        // Put your drawing code here
        p1.draw(ctx)
        p2.draw(ctx)

    }
}

function init(){
    ctx.clearRect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT);
    grid = makeGrid();
    p1 = new Player(100, 100, "#C2010E", "#C2010E");
    p2 = new Player(700, 500, "#6E9B29", "#6E9B29");
    grid[p1.x_pixel][p1.y_pixel].isWall = true;
    grid[p2.x_pixel][p2.y_pixel].isWall = true;
    p1.draw(ctx);
    p2.draw(ctx);
}

function startNewGame(){
    init();
    startAnimating(CONSTANTS.FPS);
}

// KEY LISTENERS
window.addEventListener("keydown", (e)=>{
    if(e.keyCode == 37){
        p1.turnLeft()
    } else if(e.keyCode == 38){
        p1.turnUp()
    } else if(e.keyCode == 39){
        p1.turnRight()
    } else if(e.keyCode == 40){
        p1.turnDown()
    } 
    
    if(p2_input){
        if(e.keyCode == 65){
            p2.turnLeft()
        } else if(e.keyCode == 87){
            p2.turnUp()
        } else if(e.keyCode == 68){
            p2.turnRight()
        } else if(e.keyCode == 83){
            p2.turnDown()
        }
    }
})
window.addEventListener("keyup", (e) =>{
    if(e.keyCode == 78){
        startNewGame();
    }
})

class Bot{
    constructor(){
        this.crash_evaluations = 10;
        this.randomness = 0.10;
    }

    botMove(grid, p2){
        let next_coords;
        let dir = p2.direction;
        let willTurn = false;

        // Evaluate if we need to turn to avoid a crash
        for(let i = 0; i < this.crash_evaluations; i++){
            next_coords = this.getNextCoordinates(dir);
        
            if(this.goingToCrash(grid, next_coords)){
                dir = this.randomDirection();
                willTurn = true;
            } else{
                console.log(i)
                break;
            }
        }

        // If not turning to not crash, have a chance to turn randomly
        if (willTurn == false){
            let rand_num = Math.random();
            if (rand_num < this.randomness){
                // Turn randomly if it does not result in a crash
                dir = this.randomDirection();
                if (this.goingToCrash(grid, this.getNextCoordinates(dir)) == false){
                    willTurn = true;
                }
            }
        }

        if (willTurn){
            this.turn(dir);
        }
    }

    getNextCoordinates(dir){
        let next_coords = {};

        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                next_coords.x = p2.x_pixel;
                next_coords.y = p2.y_pixel - 1;
                break;
            case CONSTANTS.DIRECTIONS.RIGHT:
                next_coords.x = p2.x_pixel + 1
                next_coords.y = p2.y_pixel
                break;
            case CONSTANTS.DIRECTIONS.DOWN:
                next_coords.x = p2.x_pixel
                next_coords.y = p2.y_pixel + 1
                break;
            case CONSTANTS.DIRECTIONS.LEFT:
                next_coords.x = p2.x_pixel - 1
                next_coords.y = p2.y_pixel
                break;
        }

        return next_coords
    }

    goingToCrash(grid, next_coords){
        if (next_coords.x < 0 || next_coords.x >= CONSTANTS.WIDTH_CELLS){
            return true;
        } else if (next_coords.y < 0 || next_coords.y >= CONSTANTS.HEIGHT_CELLS){
            return true;
        } else if (grid[next_coords.x][next_coords.y].isWall){
            return true
        }
        return false;
    }

    randomDirection(){
        let rand_num = Math.floor(Math.random() * 4);
        switch(rand_num){
            case 0:
                return CONSTANTS.DIRECTIONS.UP;
            case 1:
                return CONSTANTS.DIRECTIONS.RIGHT;
            case 2:
                return CONSTANTS.DIRECTIONS.DOWN;
            case 3:
                return CONSTANTS.DIRECTIONS.LEFT;
        }
    }

    turn(dir){
        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                return p2.turnUp();
            case CONSTANTS.DIRECTIONS.RIGHT:
                return p2.turnRight();
            case CONSTANTS.DIRECTIONS.DOWN:
                return p2.turnDown();
            case CONSTANTS.DIRECTIONS.LEFT:
                return p2.turnLeft();
        }
    }
}

init();
let bot = new Bot(grid, p2);