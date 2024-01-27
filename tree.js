// Pseudo random number generator using Mulberry32 algorithm
function pseudoRand(seed) {
  var t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Convert a letter string to a unique integer
function stringToInteger(str) {
  var result = 0;
  for (var i = 0; i < str.length; i++) {
    result = result * 31 + str.charCodeAt(i);
  }
  return result;
}

// Get tree seed from the URL
function getSeed() {
  var param = new URLSearchParams(window.location.search).get("seed");
  if (isNaN(Number(param))) return stringToInteger(param);
  return param ? parseInt(param) : new Date().getTime();
}

// Get season from the URL
function getSeason() {
  var param = new URLSearchParams(window.location.search).get("season");
  return param ?? "summer";
}

// Random angle between midpoint-range/2 and midpoint+range/2
function randomAngle(seed, midpoint, range) {
  var midpointR = (midpoint * Math.PI) / 180; // midpoint in radians
  var rangeR = (range * Math.PI) / 180; // range in radians
  return pseudoRand(seed) * rangeR - rangeR / 2 + midpointR;
}

let globalSeed = getSeed();
console.log("Seed: " + globalSeed);
let season = getSeason();

// Main rendering function
function populateScene() {
  // Recursive function to generate L-system string
  function generateIteration(treeString, currentIteration, targetIteration) {
    var newTreeString = "";
    for (var i = 0; i < treeString.length; i++) {
      var char = treeString.charAt(i);
      if (char == "X") {
        newTreeString += "dF-[[X]+X]+F[+FX]-Xi";
      } else if (char == "F") {
        newTreeString += "FF";
      } else {
        newTreeString += char;
      }
    }
    if (currentIteration < targetIteration) {
      newTreeString = generateIteration(
        newTreeString,
        currentIteration + 1,
        targetIteration
      );
    }
    return newTreeString;
  }

  // Function to draw the generated L-system string
  function drawTree(context, xPos, iterations) {
    var tree = generateIteration("X", 0, iterations); // Generate the L-system string
    var yPos = 400; // Start at the bottom of the canvas
    var lineLength = 2; // Length of each line segment
    var lineAngle = randomAngle(globalSeed++, 0, 20); // Staring angle of the trunk
    // Width of the trunk at the bottom of the tree
    var currentLineWidth = 3 * iterations - 6;
    // Change in trunk width for each iteration. The trunk will decrease in width interations+1 times
    var trunkChange = currentLineWidth / (iterations + 1);
    context.lineCap = "round";

    function summerTrunkGradient(lineWidth) {
      let gradient = context.createLinearGradient(
        xPos - Math.ceil(lineWidth / 2),
        yPos - Math.ceil(lineWidth / 4),
        xPos + Math.ceil(lineWidth / 2),
        yPos + Math.ceil(lineWidth / 4)
      );
      gradient.addColorStop(0, "#b28b50");
      gradient.addColorStop(1, "#664f2d");
      return gradient;
    }

    function springTrunkGradient(lineWidth) {
      let gradient = context.createLinearGradient(
        xPos - Math.ceil(lineWidth / 2),
        yPos - Math.ceil(lineWidth / 4),
        xPos + Math.ceil(lineWidth / 2),
        yPos + Math.ceil(lineWidth / 4)
      );
      gradient.addColorStop(0, "#d8b682");
      gradient.addColorStop(1, "#997543");
      return gradient;
    }

    function fallTrunkGradient(lineWidth) {
      let gradient = context.createLinearGradient(
        xPos - Math.ceil(lineWidth / 2),
        yPos - Math.ceil(lineWidth / 4),
        xPos + Math.ceil(lineWidth / 2),
        yPos + Math.ceil(lineWidth / 4)
      );
      gradient.addColorStop(0, "#b28b50");
      gradient.addColorStop(1, "#664f2d");
      return gradient;
    }

    function winterTrunkGradient(lineWidth) {
      let gradient = context.createLinearGradient(
        xPos + Math.ceil(lineWidth / 4),
        yPos - Math.ceil(lineWidth / 2),
        xPos - Math.ceil(lineWidth / 4),
        yPos + Math.ceil(lineWidth / 2)
      );
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(0.3, "#fff");
      gradient.addColorStop(0.4, "#594c39");
      gradient.addColorStop(1, "#3f3628");
      return gradient;
    }

    // Draw a trunk segment
    function drawTrunk() {
      let lineWidth = Math.max(1, Math.ceil(currentLineWidth)); // Set the line width

      context.lineWidth = lineWidth; // Set the line width
      if (season === "summer") {
        context.strokeStyle = summerTrunkGradient(lineWidth);
      } else if (season === "spring") {
        context.strokeStyle = springTrunkGradient(lineWidth);
      } else if (season === "fall") {
        context.strokeStyle = fallTrunkGradient(lineWidth);
      } else if (season === "winter") {
        context.strokeStyle = winterTrunkGradient(lineWidth);
      } else {
        context.strokeStyle = summerTrunkGradient(lineWidth);
      }
      context.beginPath();
      context.moveTo(xPos, yPos);
      xPos += lineLength * Math.sin(lineAngle);
      yPos -= lineLength * Math.cos(lineAngle);
      context.lineTo(xPos, yPos);
      context.stroke();
      context.closePath();
    }

    function summerLeafGradient(lineLength) {
      let gradient = context.createLinearGradient(
        xPos,
        yPos,
        xPos + lineLength * Math.sin(lineAngle),
        yPos - lineLength * Math.cos(lineAngle)
      );
      gradient.addColorStop(0, "#676d41");
      gradient.addColorStop(1, "#97a140");
      return gradient;
    }

    function springLeafGradient(lineLength) {
      let gradient = context.createLinearGradient(
        xPos,
        yPos,
        xPos + lineLength * Math.sin(lineAngle),
        yPos - lineLength * Math.cos(lineAngle)
      );
      gradient.addColorStop(0, "#b0cb56");
      gradient.addColorStop(1, "#d6dda6");
      return gradient;
    }

    function fallLeafGradient(lineLength) {
      let gradient = context.createLinearGradient(
        xPos,
        yPos,
        xPos + lineLength * Math.sin(lineAngle),
        yPos - lineLength * Math.cos(lineAngle)
      );
      gradient.addColorStop(0, "#f44b1f");
      gradient.addColorStop(1, "#f8b733");
      return gradient;
    }

    // Draw a leaf as a thick line
    function drawLeaf() {
      var lineLength = 0;
      if (season === "summer") {
        lineLength = iterations + 1;
      } else if (season === "spring") {
        lineLength = iterations - 1;
      } else if (season === "fall") {
        lineLength = iterations + 1;
      }

      context.beginPath();
      context.moveTo(xPos, yPos);
      context.lineWidth = lineLength / 3;
      if (season === "summer") {
        context.strokeStyle = summerLeafGradient(lineLength);
      } else if (season === "spring") {
        context.strokeStyle = springLeafGradient(lineLength);
      } else if (season === "fall") {
        context.strokeStyle = fallLeafGradient(lineLength);
      }
      xPos += lineLength * Math.sin(lineAngle);
      yPos -= lineLength * Math.cos(lineAngle);
      context.lineTo(xPos, yPos);
      context.stroke();
      context.closePath();
    }

    var stack = []; // Stack to store previous states
    // Draw the tree
    for (var i = 0; i < tree.length; i++) {
      var char = tree.charAt(i);
      if (char == "X") {
        // Skip X
      } else if (char == "F") {
        drawTrunk();
      } else if (char == "-") {
        // Turn left with a slight random variation
        if (pseudoRand(globalSeed++) < 0.3) {
          lineAngle += randomAngle(globalSeed++, 20, 10);
        } else {
          lineAngle -= randomAngle(globalSeed++, 20, 10);
        }
      } else if (char == "+") {
        // Turn right with a slight random variation
        if (pseudoRand(globalSeed++) < 0.3) {
          lineAngle -= randomAngle(globalSeed++, 20, 10);
        } else {
          lineAngle += randomAngle(globalSeed++, 20, 10);
        }
      } else if (char == "[") {
        // Save current state to the stack
        stack.push([xPos, yPos, lineAngle]);
      } else if (char == "]") {
        if (season !== "winter") drawLeaf();
        // Restore previous state from the stack
        var coords = stack.pop();
        xPos = coords[0];
        yPos = coords[1];
        lineAngle = coords[2];
      } else if (char == "i") {
        currentLineWidth += trunkChange; // Increase the line width
      } else if (char == "d") {
        currentLineWidth -= trunkChange; // Decrease the line width
      }
    }
  }

  // Get the canvas and context
  var canvas = document.querySelector("canvas");
  var context = canvas.getContext("2d");
  var backgroundColor = "#333";

  // Fill the canvas with a background color
  function prapareCanvas() {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a box for the trees to grow in
    if (season === "summer") {
      context.fillStyle = "#fbf7c2";
    } else if (season === "spring") {
      context.fillStyle = "#eeffe5";
    } else if (season === "fall") {
      context.fillStyle = "#f9e495";
    } else if (season === "winter") {
      context.fillStyle = "#445";
    }
    context.fillRect(0, canvas.height - 380, canvas.width, 280);
  }

  // Cover the trunk with a rectangle
  function coverTrunk() {
    context.fillStyle = backgroundColor;
    context.fillRect(0, canvas.height - 100, canvas.width, 100);
  }

  // Center tree
  prapareCanvas();
  drawTree(context, 512, 5);
  coverTrunk();
}

document.addEventListener("DOMContentLoaded", function () {
  populateScene();
});

document.addEventListener("click", function () {
  console.log("Seed: " + globalSeed);
  populateScene();
});
