let drawRect = function(x, y, width, height, color){
    context.beginPath();
    context.rect(x, y, width, height);
    context.fillStyle = typeof color == "object" ? "rgba(" + color.join(",") + ")" : "#" + color;
    context.fill();
};

function drawDefault(){
    let canvasWidth = document.getElementById("canvas").width;
    let canvasHeight = document.getElementById("canvas").height;
    drawRect(0, 0, canvasWidth, canvasHeight, "FFFFFF");
}




function LinearFunction(x0, y0, x1, y1){
    let k = (y1 - y0) / (x1 - x0);
    let b = y0 - k * x0;
    return x => k * x + b;
}

function drawLineBetween(x0, y0, x1, y1, deltaX, deltaY){
    let f = LinearFunction(x0, y0, x1, y1);
    let k = (y1 - y0) / (x1 - x0);
    let curColor = document.getElementsByClassName("colorbox__color__icon")[0].value.slice(1);
    if(Math.abs(k) < 1){
        if(x1 > x0){
            for(let x = x0; x < x1; x += deltaX){
                let y = f(x);
                drawRect(x, y, deltaX, deltaY, curColor);
                drawRect(x + deltaX / 2, y, deltaX, deltaY, curColor);
            }
        }
        else{
            for(let x = x0; x >= x1; x -= deltaX){
                let y = f(x);
                drawRect(x, y, deltaX, deltaY, curColor);
                drawRect(x - deltaX / 2, y, deltaX, deltaY, curColor);
            }
        }
    }
    else{
        f = LinearFunction(y0, x0, y1, x1);
        if(y1 > y0){
            for(let y = y0; y < y1; y += deltaY){
                let x = f(y);
                drawRect(x, y, deltaX, deltaY, curColor);
                drawRect(x, y + deltaY / 2, deltaX, deltaY, curColor);
            }
        }
        else{
            for(let y = y0; y >= y1; y -= deltaY){
                let x = f(y);
                drawRect(x, y, deltaX, deltaY, curColor);
                drawRect(x, y - deltaY / 2, deltaX, deltaY, curColor);
            }
        }
    }
}

function writeCoordsIn(arr){
    arr.length = 0;
    let canvasLeft = canvas.getBoundingClientRect().left;
    let canvasTop = canvas.getBoundingClientRect().top;
    let canvasWidth = canvas.offsetWidth;
    let canvasHeight = canvas.offsetHeight;
    let curColor = document.getElementsByClassName("colorbox__color__icon")[0].value.slice(1);
    canvas.onmousemove = () => {
        let percentX = (event.clientX - canvasLeft) / canvasWidth;
        let percentY = (event.clientY - canvasTop) / canvasHeight;
        let [currentX, currentY] = [+(canvas.width * percentX).toFixed(4), +(canvas.height * percentY).toFixed(4)];
        let deltaX = 6;
        let deltaY = 6;
        if(arr.length){
            if(Math.abs(currentX - arr[arr.length - 1][0]) >= deltaX || Math.abs(currentY - arr[arr.length - 1][1]) >= deltaY){
                drawLineBetween(arr[arr.length - 1][0], arr[arr.length - 1][1], currentX, currentY, deltaX, deltaY);
            }
            else{
                drawRect(currentX, currentY, deltaX, deltaY, curColor);
            }
        }
        else{
            drawRect(currentX, currentY, deltaX, deltaY, curColor);
        }
        arr.push([currentX, currentY]);
    };
}

function stopDrawing(RectArr){
    canvas.onmousemove = null;
    RectArr.length = 0;
}

function getColor(){
    let canvasLeft = canvas.getBoundingClientRect().left;
    let canvasTop = canvas.getBoundingClientRect().top;
    let canvasWidth = canvas.offsetWidth;
    let canvasHeight = canvas.offsetHeight;
    let percentX = (event.clientX - canvasLeft) / canvasWidth;
    let percentY = (event.clientY - canvasTop) / canvasHeight;
    let [currentX, currentY] = [+(canvas.width * percentX).toFixed(4), +(canvas.height * percentY).toFixed(4)];
    return getColorAt(currentX, currentY);
}

function updateColor(newColor){
    prevColor = colorInput.value;
    colorInput.value = newColor;
    document.getElementsByClassName("colorbox__color__icon")[1].style.backgroundColor = prevColor;
}

function changeColors(){
    let prev = rgbToHex(document.getElementsByClassName("colorbox__color__icon")[1].style.backgroundColor);
    [document.getElementsByClassName("colorbox__color__icon")[1].style.backgroundColor, colorInput.value] = [colorInput.value, prev];
}

function toHex(num){
    let res = num.toString(16);
    return res.length == 1 ? "0" + res : res;
}

function rgbToHex(rgbString){
    let [r, g, b] = rgbString.slice(4, -1).split(", ").map(x => +x);
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

function getColorAt(x, y){
    let pixelColor = context.getImageData(x, y, 1, 1).data.slice(0, -1);
    return "#" + toHex(pixelColor[0]) + toHex(pixelColor[1]) + toHex(pixelColor[2]);
}

function canvasIsOfSameColor(){
    let sameColor = getColorAt(0, 0);
    for(let x = 0; x < canvas.width; x += 4){
        for(let y = 0; y < canvas.height; y += 4){
            let curCol = context.getImageData(x, y, 4, 4).data.slice(0, -1);
            if("#" + toHex(curCol[0]) + toHex(curCol[1]) + toHex(curCol[2]) != sameColor){
                return false;
            }
        }
    }
    return true;
}



function fillArea(){

    function EndOfRightFill(x, startY, endY){
        for(let y = startY; y < endY; y++){
            if(getColorAt(x + 3, y) == oldColor){
                return false;
            }
        }
        return true;
    }

    function EndOfLeftFill(x, startY, endY){
        for(let y = startY; y < endY; y++){
            if(getColorAt(x - 3, y) == oldColor){
                return false;
            }
        }
        return true;
    }

    function getStartPoints(x, startY, endY){
        let points = [];
        let [lineSegmentStart, lineSegmentEnd] = [startY, endY];
        for(let y = startY; y < endY; y++){
            if(getColorAt(x, y) != oldColor && getColorAt(x, y + 2) == oldColor){
                lineSegmentStart = y + 2;
            }
            if(getColorAt(x, y) == oldColor && getColorAt(x, y + 2) != oldColor){
                lineSegmentEnd = y;
                let newY = ~~(0.5 * (lineSegmentStart + lineSegmentEnd));
                points.push([x, newY - newY % 2 ]);
            }
        }
        if(!points.length){
            let newY = ~~(0.5 * (startY + endY));
            return [[ x, newY - newY % 2 ]];
        }
        return points;
    }

    function drawVerticalLineThrough(x, y){
        let lineStart = y;
        let lineEnd = y;
        
        while(getColorAt(x, lineStart) == oldColor){
            lineStart -= 2;
            if(lineStart < 2){
                break;
            }
        }
        while(getColorAt(x, lineEnd) == oldColor){
            lineEnd += 2;
            if(lineEnd >= canvas.height - 2){
                break;
            }
        }
        drawLineBetween(x, lineStart, x, lineEnd, 2, 2);
        if(!EndOfLeftFill(x, lineStart, lineEnd)){
            let newPoints = getStartPoints(x - 2, lineStart, lineEnd);
            for(let point of newPoints){
                drawVerticalLineThrough(point[0], point[1]);
            }
        }
        x += 1;
        if(!EndOfRightFill(x, lineStart, lineEnd)){
            drawLineBetween(x - 2, lineStart, x - 2, lineEnd, 2, 2);
            let newPoints = getStartPoints(x + 2, lineStart, lineEnd);
            for(let point of newPoints){
                drawVerticalLineThrough(point[0], point[1]);
            }
        }
    }

    let canvasLeft = canvas.getBoundingClientRect().left;
    let canvasTop = canvas.getBoundingClientRect().top;
    let canvasWidth = canvas.offsetWidth;
    let canvasHeight = canvas.offsetHeight;
    let percentX = (event.clientX - canvasLeft) / canvasWidth;
    let percentY = (event.clientY - canvasTop) / canvasHeight;
    let [currentX, currentY] = [+(canvas.width * percentX).toFixed(4), +(canvas.height * percentY).toFixed(4)];
    let oldColor = getColorAt(currentX, currentY);
    
    if(canvasIsOfSameColor()){
        drawLineBetween(0, 0, 0, canvas.height, canvas.width, canvas.height);
    }
    drawVerticalLineThrough(currentX, currentY);
}



let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let dpi = window.devicePixelRatio;
let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
canvas.setAttribute("height", style_height * dpi);
canvas.setAttribute("width", style_width * dpi);

drawDefault();

let bucket = document.getElementsByClassName("toolbox__bucket")[0];
let colorPicker = document.getElementsByClassName("toolbox__color-picker")[0];
let pencil = document.getElementsByClassName("toolbox__pencil")[0];

let firstPencilCoords = [];
canvas.onmousedown = () => {
    writeCoordsIn(firstPencilCoords);
};
canvas.onmouseup = () => {
    stopDrawing(firstPencilCoords);
};
pencil.style.border = "1px rgb(0, 0, 0) dashed";
canvas.style.cursor = "crosshair";


let color = "00ff00";
let prevColor = "000000";
let colorInput = document.getElementsByClassName("colorbox__color__icon")[0];
let prevColorBtn = document.getElementsByClassName("colorbox__color__icon")[1];
let predefinedRed = document.getElementsByClassName("colorbox__color__icon")[2];
let predefinedBlue = document.getElementsByClassName("colorbox__color__icon")[3];

colorInput.value = "#" + color;
colorInput.onclick = () => {
    prevColor = color;
    color = colorInput.value;
    document.getElementsByClassName("colorbox__color__icon")[1].style.backgroundColor = color;
};

prevColorBtn.style.backgroundColor = "rgb(0, 0, 0)";
prevColorBtn.onclick = changeColors;

predefinedRed.onclick = () => {
    updateColor("#ff0000");
};

predefinedBlue.onclick = () => {
    updateColor("#0000ff");
};


function activatePencil(){
    let canvas = document.getElementById("canvas");
    let coords = [];
    if(canvas.onmousedown && canvas.onmouseup){
        canvas.onmousedown = canvas.onmouseup = null;
        pencil.style.border = "0";
        canvas.style.cursor = "default";
    }
    else{
        canvas.onmousedown = () => {
            writeCoordsIn(coords);
        };
        canvas.onmouseup = () => {
            stopDrawing(coords);
        };
        pencil.style.border = "1px rgb(0, 0, 0) dashed";
        colorPicker.style.border = bucket.style.border = "0";
        canvas.style.cursor = "crosshair";
    }
}

function activateColorPicker(){
    colorPicker.style.border = "1px rgb(0, 0, 0) dashed";
    pencil.style.border = bucket.style.border = "0";
    canvas.style.cursor = "pointer";
    canvas.onclick = () => {
        updateColor(getColor());
        canvas.onclick = null;
        colorPicker.style.border = "0";
        canvas.style.cursor = "default";
    };
}

function activateBucket(){
    bucket.style.border = "1px rgb(0, 0, 0) dashed";
    pencil.style.border = colorPicker.style.border = "0";
    canvas.style.cursor = "pointer";
    canvas.onclick = () => {
        fillArea();
        canvas.onclick = null;
        bucket.style.border = "0";
        canvas.style.cursor = "default";
    };
}

pencil.onclick = activatePencil;

colorPicker.onclick = activateColorPicker;

bucket.onclick = activateBucket;

document.body.onkeypress = () => {
    if(event.key.toLowerCase() == "p"){
        activatePencil();
    }
    if(event.key.toLowerCase() == "c"){
        activateColorPicker();
    }
    if(event.key.toLowerCase() == "b"){
        activateBucket();
    }
};