// Get the canvas element and its drawing context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 300;

// Dino properties
const dinoWidth = 40;
const dinoHeight = 40;
const dinoX = 50;
let dinoY = canvas.height - dinoHeight - 30; // vertical position of the dino
let velocityY = 0;
const gravity = 1.5;
let isDucking = false; // Flag to check if dino is ducking
let isDead = false; // Flag to check if dino is dead
// Dino images for running, ducking, and dead states
const dinoRunImage1 = new Image();
dinoRunImage1.src = "images/dinorun0000.png";
const dinoRunImage2 = new Image();
dinoRunImage2.src = "images/dinorun0001.png";
const dinoDuckImage1 = new Image();
dinoDuckImage1.src = "images/dinoduck0000.png";
const dinoDuckImage2 = new Image();
dinoDuckImage2.src = "images/dinoduck0001.png";
const dinoDeadImage = new Image();
dinoDeadImage.src = "images/dinoDead0000.png";

// Ground properties
const groundWidth = canvas.width;
const groundHeight = 50;
let groundX = 0;
const groundY = canvas.height - groundHeight;
const groundImage = new Image();
groundImage.src = "images/ground.png";

// Game properties
const speed = 2;
const spawnRate = 120; // Spawn rate of cactus
let frame = 0; // Frame count to alternate between dino images
let isStarted = false;
let cacti = [];

// Bird properties
let birds = [];
const birdImage1 = new Image();
birdImage1.src = "images/berd.png";
const birdImage2 = new Image();
birdImage2.src = "images/berd2.png";

// Cactus properties (different types of cactus)
const cactusType = ["small", "big", "many"];

// Function to handle jumping
function jump() {
  if (dinoY === canvas.height - dinoHeight - 30) {
    // Only allow jump if dino is on the ground
    velocityY -= 18; // Apply upward force for jump
  }
}

// Function to handle game over state
function dead() {
  isStarted = false;
}

// Function to handle ducking
function duck() {
  isDucking = true;
}
function stopDucking() {
  isDucking = false;
}

// Function to set up controls (keyboard event listeners)
function setupControls() {
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      // When the up arrow key is pressed
      jump();
    } else if (event.key === "ArrowDown") {
      // When the down arrow key is pressed
      duck();
    } else if (event.key === " ") {
      // When space is pressed to start the game
      if (!isStarted) {
        isStarted = true;
        animate();
      }
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowDown") {
      // When the down arrow key is released
      stopDucking();
    }
  });
}

// Function to update the game state
function update() {
  velocityY += gravity; // Apply gravity to the dino
  dinoY += velocityY; // Update the dino's vertical position

  if (dinoY > canvas.height - dinoHeight - 30) {
    // If dino reaches the ground
    dinoY = canvas.height - dinoHeight - 30; // Keep dino on the ground
    velocityY = 0; // Stop downward velocity
  }

  // Move the ground leftward to simulate scrolling effect
  groundX -= speed;

  // Move cactus leftward and remove them if they go off-screen
  cacti.forEach((cactus, index) => {
    cactus.x -= speed;
    if (cactus.x + cactus.width <= 0) {
      cacti.splice(index, 1); // Remove cactus when it goes off-screen
    }
  });

  // Move birds leftward and remove them if they go off-screen
  birds.forEach((bird, index) => {
    bird.x -= speed;
    if (bird.x + bird.width <= 0) {
      birds.splice(index, 1); // Remove bird when it goes off-screen
    }
  });

  // Reset the ground position when it moves off the screen
  if (groundX <= -groundWidth) {
    groundX = 0;
  }
}

// Function to draw the ground
function drawGround() {
  // Draw the ground twice to create the illusion of a continuous moving background
  ctx.drawImage(groundImage, groundX, groundY, groundWidth, groundHeight);
  ctx.drawImage(
    groundImage,
    groundX + groundWidth,
    groundY,
    groundWidth,
    groundHeight
  );
}

// Function to draw the dino
function drawDino() {
  let dinoImage = frame % 10 < 5 ? dinoRunImage1 : dinoRunImage2; // Alternate between two running images
  let dinoDuckImage = frame % 10 < 5 ? dinoDuckImage1 : dinoDuckImage2; // Alternate between two ducking images

  if (isDucking) {
    ctx.drawImage(
      dinoDuckImage,
      dinoX,
      dinoY + 14,
      dinoWidth,
      dinoHeight / 1.5 // Make dino shorter while ducking
    );
  } else if (isDead) {
    ctx.drawImage(dinoDeadImage, dinoX, dinoY, dinoWidth, dinoHeight); // Draw the dead dino
  } else {
    ctx.drawImage(dinoImage, dinoX, dinoY, dinoWidth, dinoHeight); // Draw the running dino
  }
}

// Timer for bird spawning
let birdTimer = 0;
// Function to draw the bird
function drawBird() {
    birdTimer++; // Increase the bird timer each frame
  
    // Only spawn a bird after a certain number of frames
    if (birdTimer >= spawnRate * 2.9) {
      const birdHeight = 40;
      const birdWidth = 40;
      const birdX = canvas.width; // Position bird at the right edge of the canvas
  
      // Define two bird positions: one high and one low
      const birdYHigh = canvas.height - birdHeight - 160; // Higher position (player needs to jump)
      const birdYLow = canvas.height - birdHeight - 55; // Lower position (player needs to duck)
  
      // Check if there is a cactus on the screen
      const isCactusPresent = cacti.some(cactus => cactus.x + cactus.width > 0); // Check if any cactus is visible on the screen
  
      // Randomly choose between high and low positions
      // If there is a cactus, prioritize the low position (e.g., 70% chance for low, 30% for high)
      // If there is no cactus, choose randomly between high and low
      const birdY = isCactusPresent
        ? Math.random() < 0.7 ? birdYLow : birdYHigh // 70% chance for low, 30% for high when cactus is present
        : Math.random() < 0.5 ? birdYHigh : birdYLow; // 50% chance for high or low when no cactus is present
  
      const bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight,
        image: "", // Use the selected bird image
      };
      birds.push(bird); // Add the bird to the birds array
      birdTimer = 0; // Reset bird timer
    }
  
    // Move birds leftward and draw them
    birds.forEach((bird, index) => {
      let birdImage = frame % 10 < 5 ? birdImage1 : birdImage2; // Alternate between two bird images
      bird.x -= speed - 1; // Move bird leftward
      if (bird.x + bird.width <= 0) {
        birds.splice(index, 1); // Remove bird when it goes off-screen
      }
      ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    });
  }
// Timer for cactus spawning
let cactusTimer = 0;

// Function to draw cactus
function drawCactus() {
  cactusTimer++; // Increase the cactus timer each frame

  // Only spawn a cactus after a certain number of frames
  if (cactusTimer >= spawnRate) {
    const type = cactusType[Math.floor(Math.random() * cactusType.length)]; // Randomly choose cactus type
    const cactusHeight = type === "big" ? 40 : type === "small" ? 30 : 35; // Set cactus height based on its type
    const cactusWidth = type === "big" ? 25 : type === "small" ? 20 : 40; // Set cactus width
    const cactusX = canvas.width; // Position cactus at the right edge of the canvas
    const cactusY = canvas.height - cactusHeight - 30; // Set cactus height position
    const cactus = {
      type: type,
      x: cactusX,
      y: cactusY,
      width: cactusWidth,
      height: cactusHeight,
      image: new Image(),
    };
    // Set the cactus image based on its type
    cactus.image.src =
      type === "small"
        ? "images/cactusSmall0000.png"
        : type === "big"
        ? "images/cactusBig0000.png"
        : "images/cactusSmallMany0000.png";

    cacti.push(cactus); // Add the cactus to the cacti array
    cactusTimer = 0; // Reset cactus timer
  }

  // Move cacti leftward and draw them
  cacti.forEach((cactus, index) => {
    cactus.x -= speed;

    // Remove cactus when it goes off the screen
    if (cactus.x + cactus.width <= 0) {
      cacti.splice(index, 1);
    }

    // Draw the cactus on the canvas
    ctx.drawImage(
      cactus.image,
      cactus.x,
      cactus.y,
      cactus.width,
      cactus.height
    );
  });
}

// Function to draw the entire game scene
function draw() {
  drawGround(); // Draw the ground
  drawDino(); // Draw the dino
  drawCactus(); // Draw the cactus
  drawBird(); // Draw the bird
}

// Function to animate the game
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for the next frame
  update(); // Update the game state
  draw(); // Draw the updated game state
  frame++; // Increment frame count
  requestAnimationFrame(animate); // Call the animate function for the next frame
}

setupControls();
