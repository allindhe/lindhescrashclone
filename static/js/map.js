import {CONSTANTS} from "./constants.js";

// Make grid
class Cell{
    constructor(){
        this.isWall = false;
    }
}

function makeGrid(){
    let grid = [];
    for(let x = 0; x < CONSTANTS.WIDTH_CELLS; x++){
        grid[x] = []
        for(let y = 0; y < CONSTANTS.HEIGHT_CELLS; y++){
            grid[x][y] = new Cell();
        }
    }
    return grid
}

export {makeGrid};