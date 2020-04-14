import {CONSTANTS} from "./constants.js";

// Make grid
class Cell{
    constructor(){
        this.isWall = false;
    }
}

let map = {
    makeGrid(){
        let grid = [];
        for(let x = 0; x < CONSTANTS.WIDTH_CELLS; x++){
            grid[x] = []
            for(let y = 0; y < CONSTANTS.HEIGHT_CELLS; y++){
                grid[x][y] = new Cell();
            }
        }
        return grid
    },

    setMapSize(mapSize){
        switch (mapSize){
            case "0":
                CONSTANTS.setPixel(14);
                break;
            case "1":
                CONSTANTS.setPixel(8);
                break;
            case "2":
                CONSTANTS.setPixel(4);
                break;
        }
    },

    setGameSpeed(gameSpeed){
        switch (gameSpeed){
            case "0":
                CONSTANTS.setFPS(20);
                break;
            case "1":
                CONSTANTS.setFPS(30);
                break;
            case "2":
                CONSTANTS.setFPS(60);
                break;
        }
    }
} 

export {map};