import {CONSTANTS} from "./constants.js";

class Bot{
    constructor(){
        this.crash_evaluations = 10;
        this.randomness = 0.10;
    }

    botMove(grid, player){
        let next_coords;
        let dir = player.direction;
        let willTurn = false;

        // Evaluate if we need to turn to avoid a crash
        for(let i = 0; i < this.crash_evaluations; i++){
            next_coords = this.getNextCoordinates(player, dir);
        
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
                if (this.goingToCrash(grid, this.getNextCoordinates(player, dir)) == false){
                    willTurn = true;
                }
            }
        }

        if (willTurn){
            this.turn(player, dir);
        }
    }

    getNextCoordinates(player, dir){
        let next_coords = {};

        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                next_coords.x = player.x_pixel;
                next_coords.y = player.y_pixel - 1;
                break;
            case CONSTANTS.DIRECTIONS.RIGHT:
                next_coords.x = player.x_pixel + 1
                next_coords.y = player.y_pixel
                break;
            case CONSTANTS.DIRECTIONS.DOWN:
                next_coords.x = player.x_pixel
                next_coords.y = player.y_pixel + 1
                break;
            case CONSTANTS.DIRECTIONS.LEFT:
                next_coords.x = player.x_pixel - 1
                next_coords.y = player.y_pixel
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

    turn(player, dir){
        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                return player.turnUp();
            case CONSTANTS.DIRECTIONS.RIGHT:
                return player.turnRight();
            case CONSTANTS.DIRECTIONS.DOWN:
                return player.turnDown();
            case CONSTANTS.DIRECTIONS.LEFT:
                return player.turnLeft();
        }
    }
}

export {Bot};