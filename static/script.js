
const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");

const topInput = document.getElementById("topText");
const bottomInput = document.getElementById("bottomText");
const uploadInput = document.getElementById("imageUpload");
const colorInput = document.getElementById("fontColor");
const sizeInput = document.getElementById("fontSize");

let uploadedImage = null;
let currentTemplate = "exam";

const templates = {
    exam: {
        emoji: "📚",
        top: "WHEN THE EXAM STARTS",
        bottom: "AND YOUR BRAIN GOES OFFLINE",
        background: "#51385f"
    },
    coding: {
        emoji: "💻",
        top: "ME: JUST ONE SMALL CHANGE",
        bottom: "THE CODE: ERROR 404",
        background: "#183b54"
    },
    sleep: {
        emoji: "😴",
        top: "ME: FIVE MORE MINUTES",
        bottom: "MY ALARM: ABSOLUTELY NOT",
        background: "#34456e"
    },
    college: {
        emoji: "🎓",
        top: "EXPECTATION: FUN COLLEGE LIFE",
        bottom: "REALITY: DEADLINES",
        background: "#694334"
    }
};

// Draw captions on the meme
function drawCaption(text, y, fontSize) {
    if (!text.trim()) return;

    ctx.font = `800 ${fontSize}px Impact, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colorInput.value;
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = Math.max(3, fontSize / 9);
    ctx.lineJoin = "round";

    const maxWidth = canvas.width - 50;
    const words = text.toUpperCase().split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;

        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }

    if (line) lines.push(line);

    const lineHeight = fontSize * 1.15;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((item, index) => {
        const lineY = startY + index * lineHeight;
        ctx.strokeText(item, canvas.width / 2, lineY, maxWidth);
        ctx.fillText(item, canvas.width / 2, lineY, maxWidth);
    });
}

// Draw the complete meme
function renderMeme() {
    const width = canvas.width;
    const height = canvas.height;
    const fontSize = Number(sizeInput.value);

    ctx.clearRect(0, 0, width, height);

    if (uploadedImage) {
        const scale = Math.max(
            width / uploadedImage.width,
            height / uploadedImage.height
        );

        const drawWidth = uploadedImage.width * scale;
        const drawHeight = uploadedImage.height * scale;

        ctx.drawImage(
            uploadedImage,
            (width - drawWidth) / 2,
            (height - drawHeight) / 2,
            drawWidth,
            drawHeight
        );
    } else {
        const template = templates[currentTemplate];

        ctx.fillStyle = template.background;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgba(255,255,255,0.07)";

        ctx.beginPath();
        ctx.arc(100, 270, 100, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(600, 360, 130, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "190px Arial";
        ctx.fillText(template.emoji, width / 2, height / 2);

        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 5;
        ctx.strokeRect(15, 15, width - 30, height - 30);
    }

    drawCaption(topInput.value, 55, fontSize);
    drawCaption(bottomInput.value, height - 55, fontSize);
}

// Choose a preset template
function chooseTemplate(name) {
    if (!templates[name]) return;

    currentTemplate = name;
    uploadedImage = null;
    uploadInput.value = "";

    topInput.value = templates[name].top;
    bottomInput.value = templates[name].bottom;

    renderMeme();

    document.getElementById("editor").scrollIntoView({
        behavior: "smooth"
    });
}

// Upload an image
uploadInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        this.value = "";
        return;
    }

    const imageURL = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
        uploadedImage = image;
        renderMeme();
        URL.revokeObjectURL(imageURL);
    };

    image.onerror = function () {
        alert("Sorry, this image could not be opened.");
        URL.revokeObjectURL(imageURL);
    };

    image.src = imageURL;
});

// Update the preview
document.getElementById("updateButton").addEventListener("click", renderMeme);

topInput.addEventListener("input", renderMeme);
bottomInput.addEventListener("input", renderMeme);
colorInput.addEventListener("change", renderMeme);
sizeInput.addEventListener("input", renderMeme);

// Download the meme as a PNG
document.getElementById("downloadButton").addEventListener("click", function () {
    renderMeme();

    canvas.toBlob(function (blob) {
        if (!blob) {
            alert("Couldn't create the image. Please try again.");
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "memelab-meme.png";
        link.click();

        URL.revokeObjectURL(url);
    }, "image/png");
});

// Generate captions using our Python Flask backend
const generateButton = document.getElementById("generateButton");

if (generateButton) {
    generateButton.addEventListener("click", async function () {
        const scenario = document.getElementById("scenario").value.trim();

        if (!scenario) {
            alert("Bro, describe your situation first! 😂");
            return;
        }

        generateButton.disabled = true;
        generateButton.textContent = "Generating...";

        try {
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ scenario: scenario })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not generate captions.");
            }

            topInput.value = data.top;
            bottomInput.value = data.bottom;

            renderMeme();

        } catch (error) {
            console.error(error);
            alert("Couldn't connect to Python. Check that your Flask server is running.");
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = "😂 Generate Funny Captions";
        }
    });
}

// Show the starter meme
topInput.value = templates.exam.top;
bottomInput.value = templates.exam.bottom;

renderMeme();

