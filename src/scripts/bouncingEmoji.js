const bouncingCanvas = document.createElement("canvas");
const context = bouncingCanvas.getContext("2d");
const faces = ["☆*: .｡. o(≧▽≦)o .｡.:*☆", "(^///^)", "(❁´◡`❁)", "O_O", "^_+"]
const text = faces[Math.round(Math.random() * (faces.length-1), 0)];

const fontType = "JetBrains Mono";
let fontSize = 20;
const style = window.getComputedStyle(document.body);
let fontColor = style.getPropertyValue("--text-color");

const emojiSpeed = 50;

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

darkModePreference.addEventListener("change", (_) => {
    fontColor = style.getPropertyValue("--text-color");
    context.fillStyle = fontColor;
})

const reduceMotionPreference = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
const onMobileScreen = screen.width <= 600;

document.addEventListener("DOMContentLoaded", () => {
    if (reduceMotionPreference) return;

    if (onMobileScreen) {
        fontSize = 10;
    }

    bouncingCanvas.tagName = "Bouncing Emoji Canvas";

    bouncingCanvas.style = `
        pointer-events:none;
        position: fixed;
        top: ${window.scrollY}px; left: 0px;
        opacity: 50%;
    `;

    bouncingCanvas.width = window.innerWidth;
    bouncingCanvas.height = window.innerHeight;

    context.fillStyle = fontColor;

    document.body.appendChild(bouncingCanvas);

    context.font = `${fontSize}px ${fontType}`;
    context.fillText(text, TextPostion.x, TextPostion.y);

    renderFrame();
}, {once: true});

window.addEventListener("resize", () => {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    context.fillStyle = fontColor;
    context.font = `${fontSize}px ${fontType}`;
}, false);

window.addEventListener("scroll", () => {
    bouncingCanvas.style.top = `${window.scrollY}px`;
})

class Vector {
    constructor(...[x, y]) {
        this.x = x;
        if (y === undefined)
            this.y = x;
        else
            this.y = y
    }

    add(value) {
        return this.callback(value,
            () => {
                return new Vector(
                    this.x + value,
                    this.y + value
                );
            },
            () => {
                return new Vector(
                    this.x + value.x,
                    this.y + value.y
                );
            })
    }

    multiply(value) {
        return this.callback(value,
            () => {
                return new Vector(
                    this.x * value,
                    this.y * value
                );
            },
            () => {
                return new Vector(
                    this.x * value.x,
                    this.y * value.y
                );
            })
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2)
    }

    normalize() {
        const mag = this.magnitude();
        if (mag == 0) return undefined;
        return new Vector(
            this.x / mag,
            this.y / mag
        );
    }

    dot(value) {
        if (typeof value === "object" && value instanceof Vector ) {
            return this.x * value.x + this.y * value.y; 
        }

        return undefined;
    }

    getNormalVector() {
        return new Vector(
            this.y,
            -this.x
        )
    }

    callback(value, numberCallback, vectorCallback) {
        if (typeof value === "number" )
            return numberCallback();
        if (typeof value === "object" && value instanceof Vector)
            return vectorCallback();
    }
}

const TextSpeed = new Vector(emojiSpeed);
let TextPostion = new Vector(
    Math.random() * window.innerWidth,
    Math.random() * window.innerHeight
);
let deltaTime, startTime = new Date();

const cardinalWallVectors = [
    [new Vector(0, window.innerHeight/2), new Vector(-1, 0), 0], // Left
    [new Vector(window.innerWidth, window.innerHeight/2), new Vector(1, 0), text.length * 10], // Right
    [new Vector(window.innerWidth, 0), new Vector(0, -1), 20], // Top
    [new Vector(window.innerWidth/2, window.innerHeight), new Vector(0, 1), 10] // Bottom
];

function renderFrame() {

    deltaTime = (startTime - new Date()) / 1000;

    let deltaPos = TextSpeed.multiply(deltaTime);

    TextPostion = TextPostion.add(deltaPos);

    context.clearRect(0, 0, bouncingCanvas.width, bouncingCanvas.height);
    context.fillText(text, TextPostion.x, TextPostion.y);

    cardinalWallVectors.forEach(vecs => {
        collideWithLine(...vecs);
    });


    startTime = new Date();
    requestAnimationFrame(renderFrame);
}

function collideWithLine(position, normalVector, threshold) {
    if (normalVector instanceof Vector && position instanceof Vector) {
        const distanceToline = new Vector(
            position.x - TextPostion.x,   position.y - TextPostion.y
        ).dot(normalVector)

        if (distanceToline < threshold) {
            let speedAlongNormal = TextSpeed.dot(normalVector);
            let speedAlongTangent = TextSpeed.dot(normalVector.getNormalVector());
            if (speedAlongNormal <= 0) {
                TextSpeed.x = -(speedAlongNormal * normalVector.x)
                            + (speedAlongTangent * normalVector.y);

                TextSpeed.y = -(speedAlongNormal * normalVector.y)
                            + (speedAlongTangent * -normalVector.x);
            }
        }
    }
}