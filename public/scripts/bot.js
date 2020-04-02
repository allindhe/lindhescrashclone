import {CONSTANTS} from "./constants.js";

class Bot{
    constructor(){
        this.crash_evaluations = 1;
        this.randomness = 0.10;
        
        this.lineOfSightDepth = 40;
        this.lineOfSightWidth = 5;
    }

    botMove(grid, player){
        let next_coords;
        let dir = player.direction;
        let willTurn = false;

        // Evaluate if we need to turn to avoid a crash
        for(let i = 0; i < this.crash_evaluations; i++){
            next_coords = this.getNextCoordinates(player, dir);
            
            if(this.goingToCrash(grid, next_coords)){
                dir = this.chooseDirection(grid, player);
                willTurn = true;
            } else{
                break;
            }
        }

        // If not turning to not crash, have a chance to turn randomly
        if (willTurn == false){
            let rand_num = Math.random();
            if (rand_num < this.randomness){
                // Turn randomly if it does not result in a crash
                dir = this.chooseDirection(grid, player);
                willTurn = true;

                // if (this.goingToCrash(grid, this.getNextCoordinates(player, dir)) == false){
                //     willTurn = true;
                // }
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
                next_coords.x_pixel = player.x_pixel;
                next_coords.y_pixel = player.y_pixel - 1;
                break;
            case CONSTANTS.DIRECTIONS.RIGHT:
                next_coords.x_pixel = player.x_pixel + 1
                next_coords.y_pixel = player.y_pixel
                break;
            case CONSTANTS.DIRECTIONS.DOWN:
                next_coords.x_pixel = player.x_pixel
                next_coords.y_pixel = player.y_pixel + 1
                break;
            case CONSTANTS.DIRECTIONS.LEFT:
                next_coords.x_pixel = player.x_pixel - 1
                next_coords.y_pixel = player.y_pixel
                break;
        }

        return next_coords
    }

    goingToCrash(grid, next_coords){
        if (next_coords.x_pixel < 0 || next_coords.x_pixel >= CONSTANTS.WIDTH_CELLS){
            return true;
        } else if (next_coords.y_pixel < 0 || next_coords.y_pixel >= CONSTANTS.HEIGHT_CELLS){
            return true;
        } else if (grid[next_coords.x_pixel][next_coords.y_pixel].isWall){
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

    chooseDirection(grid, player){
        /* The bot tries to choose the best direction to turn */
        let start_x = player.x_pixel;
        let start_y = player.y_pixel;
        let dir_coords = this.possibleDirections(player.direction);

        let weights = Array(dir_coords.length)

        for (let direction = 0; direction < dir_coords.length; direction++) {
            let weight = 0;
            let xIsDepth;
            let x = start_x + dir_coords[direction].x;
            let y = start_y + dir_coords[direction].y;
            
            // If first cell in turning direction is a wall it has a very height weight
            if (this.isOutsideGrid(x, y) || grid[x][y].isWall){
                weights[direction] = 1000000;
                continue;
            }
            
            // See if depth is left/right or up/down
            if (dir_coords[direction].x == 0){
                xIsDepth = false;
            } else{
                xIsDepth = true;
            }
            
            // Calculate weight based on how many walls there are within the line of sight in each direction
            for(let depth = 1; depth <= this.lineOfSightDepth; depth++){
                if (xIsDepth){
                    x = start_x + dir_coords[direction].x * depth;
                } else{
                    y = start_y + dir_coords[direction].y * depth;
                }

                for(let width = 0; width <= this.lineOfSightWidth; width++){
                    for(let width_side = -1; width_side <= 1; width_side += 2){
                        if (xIsDepth){
                            y = start_y + width * width_side;
                        } else{
                            x = start_x + width * width_side;
                        }

                        // Add weight if there is an obstacle there based on how far away it is
                        if (this.isOutsideGrid(x, y)){
                            weight += ((this.lineOfSightDepth - depth)*2 + (this.lineOfSightWidth - width)*2);
                        } else if (grid[x][y].isWall){
                            weight += ((this.lineOfSightDepth - depth)*2 + (this.lineOfSightWidth - width)*2);
                        }
                    }
                }
            }

            // Set weight to the current direction
            weights[direction] = weight;
        };

        let idxMinWeight = weights.indexOf(Math.min(...weights));
        return this.coordinatesToDir(dir_coords[idxMinWeight]);
    }

    isOutsideGrid(x_pixel, y_pixel){
        /* Returns true if x, y given are outside of the grid */
        if (x_pixel < 0 || x_pixel >= CONSTANTS.WIDTH_CELLS || y_pixel < 0 || y_pixel >= CONSTANTS.HEIGHT_CELLS){
            return true
        }
        return false
    }

    possibleDirections(dir){
        /* Returns array of dir_coords with possible directions to move */
        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                return [{x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}]
            case CONSTANTS.DIRECTIONS.RIGHT:
                return [{x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}]
            case CONSTANTS.DIRECTIONS.DOWN:
                return [{x: 0, y: 1}, {x: 1, y: 0}, {x:-1, y: 0}]
            case CONSTANTS.DIRECTIONS.LEFT:
                return [{x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}]
        }
    }

    dirToCoordinates(dir){
        /* Convert direction to coordinate direction with format (x: 1, y: 0) for right and (x: 0, y: -1) for up */
        switch(dir){
            case CONSTANTS.DIRECTIONS.UP:
                return {x: 0, y: -1};
            case CONSTANTS.DIRECTIONS.RIGHT:
                return {x: 1, y: 0};
            case CONSTANTS.DIRECTIONS.DOWN:
                return {x: 0, y: 1};
            case CONSTANTS.DIRECTIONS.LEFT:
                return {x: -1, y: 0};
        }
    }

    coordinatesToDir(coords){
        /* Convert coordinates to direction with format */
        switch(JSON.stringify(coords)){
            case JSON.stringify({x: 0, y: -1}):
                return CONSTANTS.DIRECTIONS.UP;
            case JSON.stringify({x: 1, y: 0}):
                return CONSTANTS.DIRECTIONS.RIGHT;
            case JSON.stringify({x: 0, y: 1}):
                return CONSTANTS.DIRECTIONS.DOWN;
            case JSON.stringify({x: -1, y: 0}):
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