let CONSTANTS = {
    HEIGHT: 600,
    WIDTH: 800,
    PIXEL: 10,
    FPS: 24,
    DIRECTIONS: {
        UP: 0, 
        RIGHT: 1,
        DOWN: 2, 
        LEFT: 3 
        }
}

CONSTANTS["HEIGHT_CELLS"] = CONSTANTS.HEIGHT / CONSTANTS.PIXEL
CONSTANTS["WIDTH_CELLS"] = CONSTANTS.WIDTH / CONSTANTS.PIXEL

export {CONSTANTS};