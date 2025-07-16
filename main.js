(function() {
    var htmlCanvas = document.getElementById('canvas');
    var ctx = htmlCanvas.getContext('2d');
    var pixelStates = [];
    var isMousePressed = false;
    var lastMouseEvent = null;
    var sandColor = null;
    var isRunning = true;
    
    var gravity = 8;
    var brushSize = 10;
    var pixelSize = 1;
    var density = 0.7;

    initialize();

    function initialize() {
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('keydown', handleKeyPress, false);
        window.addEventListener('mousedown', handleMouseDown, false);
        window.addEventListener('mousemove', handleMouseMove, false);
        window.addEventListener('mouseup', handleMouseUp, false);
        
        setupControls();
        resizeCanvas();
        gameLoop();
    }

    function setupControls() {
        var gravitySlider = document.getElementById('gravity');
        var brushSizeSlider = document.getElementById('brushSize');
        var densitySlider = document.getElementById('density');
        var clearBtn = document.getElementById('clearBtn');
        var pauseBtn = document.getElementById('pauseBtn');

        gravitySlider.addEventListener('input', function() {
            gravity = parseInt(this.value);
            document.getElementById('gravityValue').textContent = gravity;
        });

        brushSizeSlider.addEventListener('input', function() {
            brushSize = parseInt(this.value);
            document.getElementById('brushSizeValue').textContent = brushSize;
        });

        densitySlider.addEventListener('input', function() {
            density = parseFloat(this.value);
            document.getElementById('densityValue').textContent = density;
        });

        clearBtn.addEventListener('click', function() {
            initializePixelStates();
        });

        pauseBtn.addEventListener('click', function() {
            isRunning = !isRunning;
            this.textContent = isRunning ? 'Pausar (P)' : 'Continuar (P)';
        });
    }

    function initializePixelStates() {
        var width = htmlCanvas.width;
        var height = htmlCanvas.height;
        
        pixelStates = [];
        for (var y = 0; y < height; y++) {
            pixelStates[y] = [];
            for (var x = 0; x < width; x++) {
                pixelStates[y][x] = null;
            }
        }
    }

    function handleMouseDown(event) {
        sandColor = generateRandomColor();
        isMousePressed = true;
        lastMouseEvent = event;
        addSand(event);
    }
    
    function handleMouseMove(event) {
        lastMouseEvent = event;
        if (isMousePressed) {
            addSand(event);
        }
    }
    
    function handleMouseUp(event) {
        isMousePressed = false;
    }

    function handleKeyPress(event) {
        if (event.key.toLowerCase() === 'r') {
            initializePixelStates();
        } else if (event.key.toLowerCase() === 'p') {
            isRunning = !isRunning;
            var pauseBtn = document.getElementById('pauseBtn');
            pauseBtn.textContent = isRunning ? 'Pausar (P)' : 'Continuar (P)';
        }
    }

    function addSand(event) {
        var rect = htmlCanvas.getBoundingClientRect();
        var centerX = Math.floor((event.clientX - rect.left) / pixelSize) * pixelSize;
        var centerY = Math.floor((event.clientY - rect.top) / pixelSize) * pixelSize;
        
        for (var dy = -brushSize; dy <= brushSize; dy += pixelSize) {
            for (var dx = -brushSize; dx <= brushSize; dx += pixelSize) {
                var x = centerX + dx;
                var y = centerY + dy;
                
                if (dx * dx + dy * dy <= brushSize * brushSize &&
                    x >= 0 && x < htmlCanvas.width && 
                    y >= 0 && y < htmlCanvas.height &&
                    Math.random() > (1 - density)) {
                    
                    for (var py = 0; py < pixelSize && y + py < htmlCanvas.height; py++) {
                        for (var px = 0; px < pixelSize && x + px < htmlCanvas.width; px++) {
                            if(pixelStates[y+py][x+px] == null) {
                                pixelStates[y + py][x + px] = sandColor;
                            }
                        }
                    }
                }
            }
        }
    }

    function updateSand() {
        if (!isRunning) return
        
        var width = htmlCanvas.width
        var height = htmlCanvas.height
        var newPixelStates = []
        
        for (var y = 0; y < height; y++) {
            newPixelStates[y] = []
            for (var x = 0; x < width; x++) {
                newPixelStates[y][x] = pixelStates[y][x]
            }
        }
     
        for (var y = height - pixelSize; y >= 0; y -= pixelSize) {
            for (var x = 0; x < width; x += pixelSize) {
                if (pixelStates[y][x] !== null) {
                    var newY = y
                    var moved = false
                    
                    for (var fall = pixelSize; fall <= gravity * pixelSize && y + fall < height; fall += pixelSize) {
                        if (pixelStates[y + fall][x] === null) {
                            newY = y + fall
                        } else {
                            break
                        }
                    }
                    
                    if (newY > y) {
                        var color = pixelStates[y][x]
                        for (var py = 0; py < pixelSize; py++) {
                            for (var px = 0; px < pixelSize; px++) {
                                if (y + py < height && x + px < width) {
                                    newPixelStates[y + py][x + px] = null
                                }
                                if (newY + py < height && x + px < width) {
                                    newPixelStates[newY + py][x + px] = color
                                }
                            }
                        }
                        moved = true
                    }
                    
                    if (!moved && y + pixelSize < height) {
                        var directions = []
                        
                        if (x - pixelSize >= 0 && pixelStates[y + pixelSize][x - pixelSize] === null) {
                            directions.push(-pixelSize)
                        }
                        if (x + pixelSize < width && pixelStates[y + pixelSize][x + pixelSize] === null) {
                            directions.push(pixelSize)
                        }
                        
                        if (directions.length > 0) {
                            var direction = directions[Math.floor(Math.random() * directions.length)]
                            var color = pixelStates[y][x]
                            
                            for (var py = 0; py < pixelSize; py++) {
                                for (var px = 0; px < pixelSize; px++) {
                                    if (y + py < height && x + px < width) {
                                        newPixelStates[y + py][x + px] = null
                                    }
                                    if (y + pixelSize + py < height && x + direction + px < width && x + direction + px >= 0) {
                                        newPixelStates[y + pixelSize + py][x + direction + px] = color
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        pixelStates = newPixelStates
     }

    function generateRandomColor() {
        var wesAndersonColors = [
            {r: 241, g: 196, b: 15},   // amarelo mostarda
            {r: 217, g: 103, b: 4},    // laranja queimado
            {r: 196, g: 69, b: 54},    // vermelho tijolo
            {r: 242, g: 233, b: 206},  // creme
            {r: 73, g: 133, b: 109},   // verde menta
            {r: 52, g: 73, b: 94},     // azul acinzentado
            {r: 149, g: 165, b: 166},  // cinza claro
            {r: 253, g: 227, b: 167},  // bege claro
            {r: 184, g: 233, b: 134},  // verde claro
            {r: 123, g: 36, b: 28},    // marrom escuro
            {r: 241, g: 148, b: 138},  // rosa salmão
            {r: 130, g: 224, b: 170}   // verde água
        ]
        return wesAndersonColors[Math.floor(Math.random() * wesAndersonColors.length)]
     }

    function drawCanvas() {
        var width = htmlCanvas.width;
        var height = htmlCanvas.height;
        
        var imageData = ctx.createImageData(width, height);
        var data = imageData.data;
        
        for (var y = 0; y < height; y += pixelSize) {
            for (var x = 0; x < width; x += pixelSize) {
                if (pixelStates[y] && pixelStates[y][x]) {
                    var color = pixelStates[y][x];
                    
                    for (var py = 0; py < pixelSize && y + py < height; py++) {
                        for (var px = 0; px < pixelSize && x + px < width; px++) {
                            var index = ((y + py) * width + (x + px)) * 4;
                            data[index] = color.r;
                            data[index + 1] = color.g;
                            data[index + 2] = color.b;
                            data[index + 3] = 255;
                        }
                    }
                } else {
                    for (var py = 0; py < pixelSize && y + py < height; py++) {
                        for (var px = 0; px < pixelSize && x + px < width; px++) {
                            var index = ((y + py) * width + (x + px)) * 4;
                            data[index] = 0;
                            data[index + 1] = 0;
                            data[index + 2] = 0;
                            data[index + 3] = 255;
                        }
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    function gameLoop() {
        updateSand();

        if (isMousePressed && lastMouseEvent) {
            addSand(lastMouseEvent);
        }

        drawCanvas();
        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        htmlCanvas.width = window.innerWidth;
        htmlCanvas.height = window.innerHeight;
        initializePixelStates();
    }
})();