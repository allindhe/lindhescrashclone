import {CONSTANTS} from "./constants.js";

class Player{
    constructor(x, y, playerColor, lineColor){
        this.x = x;
        this.y = y;
        this.x_pixel = this.x / CONSTANTS.PIXEL;
        this.y_pixel = this.y / CONSTANTS.PIXEL;

        this.speed = 1 * CONSTANTS.PIXEL;
        this.direction = this.startDirection();
        this.playerColor = playerColor;
        this.lineColor = lineColor;

        this.previousPosition = null;
    }

    turnLeft(){
        if(this.previousPosition && this.previousPosition.x != this.x - CONSTANTS.PIXEL){
            this.direction = CONSTANTS.DIRECTIONS.LEFT
        }
    }
    turnRight(){
        if(this.previousPosition && this.previousPosition.x != this.x + CONSTANTS.PIXEL){
            this.direction = CONSTANTS.DIRECTIONS.RIGHT
        }
    }
    turnDown(){
        if(this.previousPosition && this.previousPosition.y != this.y + CONSTANTS.PIXEL){
            this.direction = CONSTANTS.DIRECTIONS.DOWN
        }
    }
    turnUp(){
        if(this.previousPosition && this.previousPosition.y != this.y - CONSTANTS.PIXEL){
            this.direction = CONSTANTS.DIRECTIONS.UP
        }
    }

    startDirection(){
        if(this.x < CONSTANTS.WIDTH / 2){
            return CONSTANTS.DIRECTIONS.RIGHT
        } else if (this.y < CONSTANTS.HEIGHT / 2){
            return CONSTANTS.DIRECTIONS.DOWN
        }
        return CONSTANTS.DIRECTIONS.LEFT
    }

    hasCrashed(grid){
        if(this.x >= CONSTANTS.WIDTH || this.x < 0){
            return true
        }else if(this.y >= CONSTANTS.HEIGHT || this.y < 0){
            return true
        }else if (grid[this.x_pixel][this.y_pixel].isWall){
            return true
        }
        return false
    }

    updatePosition(){
        // Update previous position
        this.previousPosition = {x: this.x, y: this.y}

        // Update player position based on direction
        if(this.direction == CONSTANTS.DIRECTIONS.UP){
            this.y -= this.speed;
        } else if (this.direction == CONSTANTS.DIRECTIONS.DOWN){
            this.y += this.speed;
        } else if (this.direction == CONSTANTS.DIRECTIONS.LEFT){
            this.x -= this.speed;
        } else if (this.direction == CONSTANTS.DIRECTIONS.RIGHT){
            this.x += this.speed;
        }

        // Update pixel position (corresponds to grid position)
        this.x_pixel = this.x / CONSTANTS.PIXEL;
        this.y_pixel = this.y / CONSTANTS.PIXEL;
    }

    draw(ctx){
        // Draw player
        let tip, corner1, corner2;
        if(this.direction == CONSTANTS.DIRECTIONS.UP){
            tip = {x: this.x + CONSTANTS.PIXEL / 2, y: this.y};
            corner1 = {x: this.x, y: this.y + CONSTANTS.PIXEL}; 
            corner2 = {x: this.x + CONSTANTS.PIXEL, y: this.y + CONSTANTS.PIXEL}; 
        } else if (this.direction == CONSTANTS.DIRECTIONS.DOWN){
            tip = {x: this.x + CONSTANTS.PIXEL / 2, y: this.y + CONSTANTS.PIXEL};
            corner1 = {x: this.x, y: this.y}; 
            corner2 = {x: this.x + CONSTANTS.PIXEL, y: this.y}; 
        } else if (this.direction == CONSTANTS.DIRECTIONS.LEFT){
            tip = {x: this.x, y: this.y + CONSTANTS.PIXEL / 2};
            corner1 = {x: this.x + CONSTANTS.PIXEL, y: this.y}; 
            corner2 = {x: this.x + CONSTANTS.PIXEL, y: this.y + CONSTANTS.PIXEL}; 
        } else if (this.direction == CONSTANTS.DIRECTIONS.RIGHT){
            tip = {x: this.x + CONSTANTS.PIXEL, y: this.y + CONSTANTS.PIXEL / 2};
            corner1 = {x: this.x, y: this.y}; 
            corner2 = {x: this.x, y: this.y + CONSTANTS.PIXEL};
        }

        ctx.fillStyle = this.playerColor
        ctx.beginPath()
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(corner1.x, corner1.y);
        ctx.lineTo(corner2.x, corner2.y);
        ctx.closePath()
        ctx.fill();

        // Draw previous position
        if(this.previousPosition){
            ctx.fillStyle = this.lineColor;
            ctx.fillRect(this.previousPosition.x, this.previousPosition.y, CONSTANTS.PIXEL, CONSTANTS.PIXEL);
        }
    }
}

export {Player};