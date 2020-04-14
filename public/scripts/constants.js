let CONSTANTS = {
    HEIGHT: 600,
    WIDTH: 800,
    PIXEL: 10,
    FPS: 40,
    DIRECTIONS: {
        UP: 0, 
        RIGHT: 1,
        DOWN: 2, 
        LEFT: 3 
        },
    
    setPixel(size){
        if (size % 2 == 1){ size += 1};
        CONSTANTS.PIXEL = size;
        CONSTANTS["HEIGHT_CELLS"] = CONSTANTS.HEIGHT / CONSTANTS.PIXEL;
        CONSTANTS["WIDTH_CELLS"] = CONSTANTS.WIDTH / CONSTANTS.PIXEL;
        CONSTANTS["PIXEL_HALF"] = CONSTANTS.PIXEL / 2;
    },

    setFPS(fps){
        CONSTANTS.FPS = fps;
    }
}

CONSTANTS.setPixel(10);

export {CONSTANTS};