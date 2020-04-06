import {CONSTANTS} from "./constants.js";

class Bot{
    constructor(){
        this.randomness = 0.03;
        this.smartRandom = true; // smart uses DFS instead of random turn at randomness

        this.maxDepthDFS = 500;
        
        this.lineOfSightDepth = 2;
        this.lineOfSightWidth = 1;
    }

    botMove(grid, player){
        let next_coords;
        let dir = player.direction;
        let willTurn = false;

        // Evaluate if we need to turn to avoid a crash
        next_coords = this.getNextCoordinates(player, dir);
        if(this.goingToCrash(grid, next_coords)){
            dir = this.chooseDirection_DFS(grid, player);
            willTurn = true;
        }

        // Look ahead for potential dangers
        if (willTurn == false){
            if (this.foresightDanger(grid, player)){
                dir = this.chooseDirection_DFS(grid, player);
                willTurn = true;
            }
        }

        // If not turning to not crash, have a chance to turn randomly
        if (willTurn == false){
            let rand_num = Math.random();
            if (rand_num < this.randomness){
                // Turn randomly if it does not result in a crash
                if (this.smartRandom){
                    dir = this.chooseDirection_DFS(grid, player);
                }else {
                    dir = this.randomDirection(grid, player);
                }

                next_coords = this.getNextCoordinates(player, dir);
                if(this.goingToCrash(grid, next_coords) == false){
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
        /* Returns a random direction */
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

    foresightDanger(grid, player){
        /* Returns true if potential dangers are spotted ahead */
        let start_x = player.x_pixel;
        let start_y = player.y_pixel;
        let dir_coord = this.dirToCoordinates(player.direction);
    
        let xIsDepth;
        let x = start_x + dir_coord.x;
        let y = start_y + dir_coord.y;
        
        // See if depth is left/right or up/down
        if (dir_coord.x == 0){
            xIsDepth = false;
        } else{
            xIsDepth = true;
        }
        
        // Look for dangerous situations up ahead
        for(let depth = 1; depth <= this.lineOfSightDepth; depth++){
            let depthPattern = "";
            
            if (xIsDepth){
                x = start_x + dir_coord.x * depth;
            } else{
                y = start_y + dir_coord.y * depth;
            }

            for(let width = -this.lineOfSightWidth; width <= this.lineOfSightWidth; width++){
                if (xIsDepth){
                    y = start_y + width;
                } else{
                    x = start_x + width;
                }

                // Add a 0 for no wall and 1 for wall in the pattern
                if (player.isOutsideGrid(x, y) || grid[x][y].isWall){
                    depthPattern += "1"
                } else{
                    depthPattern += "0"
                }
            }

            // Look for dangers in pattern
            // Single slot
            if (depthPattern.includes("101")) {
                return true;
            } 
            // Potentially another player
            if (depthPattern.includes("010") || depthPattern.includes("11")){
                return true;
            }
        };

        // No danger found
        return false;
    }

    coordToString(x, y){
        return x.toString() + ";" + y.toString()
    }

    shuffleArray(arr){
        let currentIdx = arr.length;
        let randomIdx;
        let tmpValue;

        while (currentIdx > 0) {
            randomIdx = Math.floor(Math.random() * currentIdx);
            currentIdx--;

            tmpValue = arr[currentIdx];
            arr[currentIdx] = arr[randomIdx];
            arr[randomIdx] = tmpValue;
        }

        return arr;
    }

    chooseDirection_DFS(grid, player){
        /* The bot tries to choose the best direction to turn by using depth first search */
        let start_x = player.x_pixel;
        let start_y = player.y_pixel;

        // Shuffle array of possible directions to turn to get a more random behaviour
        let dir_coords = this.shuffleArray(this.possibleDirections(player.direction));
        let depths = new Array(dir_coords.length).fill(0);

        // Loop over possible directions to go
        for (let direction = 0; direction < dir_coords.length; direction++) {
            let depth;
            let visited = new Set();
            visited.add(this.coordToString(start_x, start_y));            

            let x = start_x + dir_coords[direction].x;
            let y = start_y + dir_coords[direction].y;

            if (player.isOutsideGrid(x, y) || grid[x][y].isWall){
                depth = 0;
            } else{
                depth = this.depthFirstSearch(grid, visited, x, y, player);
            }

            depths[direction] = depth;

            // If we found a max recursion already there's no need to search again
            if (depth == this.maxDepthDFS){
                break;
            }
        }

        // Choose direction with the maximum depth in DFS
        let idxMaxDepth = depths.indexOf(Math.max(...depths));
        return this.coordinatesToDir(dir_coords[idxMaxDepth]);
    }

    depthFirstSearch(grid, visited, x, y, player, depth=0){
        depth++;
        visited.add(this.coordToString(x, y))

        if (depth >= this.maxDepthDFS){
            return this.maxDepthDFS
        }
        
        // Check adjacent tiles
        let adjacent_coords = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}]
        for (let idx = 0; idx < adjacent_coords.length; idx++){
            let x_new = x + adjacent_coords[idx].dx;
            let y_new = y + adjacent_coords[idx].dy;
            
            if (visited.has(this.coordToString(x_new, y_new))){
                continue;
            } else if (player.isOutsideGrid(x_new, y_new) || grid[x_new][y_new].isWall){
                continue;
            } else{
                depth = this.depthFirstSearch(grid, visited, x_new, y_new, player, depth)
            }
        }

        return depth;
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