import {CONSTANTS} from "./constants.js";

class Player{
    constructor(playerName, x, y, primaryColor, secondaryColor, controlledByBot=false){
        this.playerName = playerName;
        this.isDead = false;
        
        this.x = x;
        this.y = y;
        this.x_pixel = this.x / CONSTANTS.PIXEL;
        this.y_pixel = this.y / CONSTANTS.PIXEL;
        this.previousPosition = null;

        this.speed = 1 * CONSTANTS.PIXEL;
        this.direction = this.startDirection();
        this.requestedDirection = this.direction
        this.previousDirection = this.direction;

        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;

        this.controlledByBot = controlledByBot;
    }

    turnLeft(){
        if(this.previousPosition && this.previousPosition.x != this.x - CONSTANTS.PIXEL){
            this.requestedDirection = CONSTANTS.DIRECTIONS.LEFT;
        }
    }
    turnRight(){
        if(this.previousPosition && this.previousPosition.x != this.x + CONSTANTS.PIXEL){
            this.requestedDirection = CONSTANTS.DIRECTIONS.RIGHT
        }
    }
    turnDown(){
        if(this.previousPosition && this.previousPosition.y != this.y + CONSTANTS.PIXEL){
            this.requestedDirection = CONSTANTS.DIRECTIONS.DOWN
        }
    }
    turnUp(){
        if(this.previousPosition && this.previousPosition.y != this.y - CONSTANTS.PIXEL){
            this.requestedDirection = CONSTANTS.DIRECTIONS.UP
        }
    }

    startDirection(){
        if(this.x < CONSTANTS.WIDTH / 2 && this.y < CONSTANTS.HEIGHT / 2){
            return CONSTANTS.DIRECTIONS.RIGHT
        } else if (this.y < CONSTANTS.HEIGHT / 2){
            return CONSTANTS.DIRECTIONS.DOWN
        } else if (this.x < CONSTANTS.WIDTH / 2 && this.y > CONSTANTS.HEIGHT / 2){
            return CONSTANTS.DIRECTIONS.UP
        }
        return CONSTANTS.DIRECTIONS.LEFT
    }

    hasCrashed(grid){
        /* Checks if vehicle has crashed with walls or bounary (not head on collisions) */
        if(this.x >= CONSTANTS.WIDTH || this.x < 0){
            this.isDead = true
            return true
        }else if(this.y >= CONSTANTS.HEIGHT || this.y < 0){
            this.isDead = true
            return true
        }else if (grid[this.x_pixel][this.y_pixel].isWall){
            this.isDead = true
            return true
        }
        return false
    }

    playerCrashedWithPlayer(player2){
        /* Checks player collisions */
        if (this.playerName == player2.playerName){
            return false
        } else{
            if(this.x_pixel == player2.x_pixel && this.y_pixel == player2.y_pixel){
                this.isDead = true;
                player2.isDead = true;
                return true;
            }
        }
    }

    updatePosition(){
        // Update previous position
        this.previousPosition = {x: this.x, y: this.y};
        this.previousDirection = this.direction;

        // Update direction based on last request
        if (this.direction != this.requestedDirection){
            this.direction = this.requestedDirection;
        }

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
        this.drawPlayer(ctx);
        this.drawLine(ctx);
        this.drawCorners(ctx);
    }

    drawLine(ctx){
        let color1;
        let color2;

        // Draw previous position
        if(this.previousPosition){

            // Draw main lines
            if(this.previousDirection == 0 || this.previousDirection == 2){
                if(this.previousDirection == 0){
                    color1 = this.primaryColor;
                    color2 = this.secondaryColor;
                } else{
                    color1 = this.secondaryColor;
                    color2 = this.primaryColor;
                }
                
                ctx.fillStyle = color1;
                ctx.fillRect(this.previousPosition.x, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL);
                
                ctx.fillStyle = color2;
                ctx.fillRect(this.previousPosition.x+CONSTANTS.PIXEL_HALF, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL);
            } else{
                if(this.previousDirection == 1){
                    color1 = this.primaryColor;
                    color2 = this.secondaryColor;
                } else{
                    color1 = this.secondaryColor;
                    color2 = this.primaryColor;
                }

                ctx.fillStyle = color1;
                ctx.fillRect(this.previousPosition.x, this.previousPosition.y, CONSTANTS.PIXEL, CONSTANTS.PIXEL_HALF);
                
                ctx.fillStyle = color2;
                ctx.fillRect(this.previousPosition.x, this.previousPosition.y+CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL, CONSTANTS.PIXEL_HALF);
            }
        }
    }

    drawCorners(ctx){
        /* Fill in the little corners when turning */
        if (this.previousDirection != this.direction){
            // If turning left use secondary color, else primary color
            if (this.isTurningLeft()){
                ctx.fillStyle = this.secondaryColor;

                switch(this.direction){
                    case CONSTANTS.DIRECTIONS.UP:
                        ctx.fillRect(this.previousPosition.x+CONSTANTS.PIXEL_HALF, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.RIGHT:
                        ctx.fillRect(this.previousPosition.x+CONSTANTS.PIXEL_HALF, this.previousPosition.y+CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.DOWN:
                        ctx.fillRect(this.previousPosition.x, this.previousPosition.y+CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.LEFT:
                        ctx.fillRect(this.previousPosition.x, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                }
            } else{
                ctx.fillStyle = this.primaryColor;

                switch(this.direction){
                    case CONSTANTS.DIRECTIONS.UP:
                        ctx.fillRect(this.previousPosition.x, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.RIGHT:
                        ctx.fillRect(this.previousPosition.x+CONSTANTS.PIXEL_HALF, this.previousPosition.y, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.DOWN:
                        ctx.fillRect(this.previousPosition.x+CONSTANTS.PIXEL_HALF, this.previousPosition.y+CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                    case CONSTANTS.DIRECTIONS.LEFT:
                        ctx.fillRect(this.previousPosition.x, this.previousPosition.y+CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF, CONSTANTS.PIXEL_HALF);
                        break;
                }
            }
        }
    }

    isTurningLeft(){
        if ((this.direction == 3 && this.previousDirection == 0) || 
        (this.direction == 2 && this.previousDirection == 3) ||
        (this.direction == 1 && this.previousDirection == 2) ||
        (this.direction == 0 && this.previousDirection == 1)){
                return true
            }
            return false
    }

    drawPlayer(ctx){
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

        ctx.fillStyle = this.primaryColor
        ctx.beginPath()
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(corner1.x, corner1.y);
        ctx.lineTo(corner2.x, corner2.y);
        ctx.closePath()
        ctx.fill();
    }

    isOutsideGrid(x_pixel, y_pixel){
        /* Returns true if x, y given are outside of the grid */
        if (x_pixel < 0 || x_pixel >= CONSTANTS.WIDTH_CELLS || y_pixel < 0 || y_pixel >= CONSTANTS.HEIGHT_CELLS){
            return true
        }
        return false
    }
}

export {Player};