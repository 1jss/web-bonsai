function populateScene() {
    var angle_step = (25 / 180) * Math.PI; // Angle step in radians

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
      var lineLength = 1; // Length of each line segment
      var lineAngle = ((Math.random() * 20 - 10) / 180) * Math.PI; // Staring angle of the trunk
      var currentLineWidth = 3 * iterations - 6; // Width of the trunk
      var trunkChange = currentLineWidth / (iterations + 1); // Change in trunk width for each iteration
      context.lineCap = "round";
  
      // Set the stroke style for the trunk
      function setTrunkStroke() {
        let gradient = context.createLinearGradient(
          xPos - currentLineWidth / 2,
          yPos - currentLineWidth / 4,
          xPos + currentLineWidth / 2,
          yPos + currentLineWidth / 4
        );
        gradient.addColorStop(0, "#b28b50");
        gradient.addColorStop(1, "#664f2d");
        context.lineWidth = currentLineWidth; // Set the line width
        context.strokeStyle = gradient;
      }
  
      // Draw a leaf as a thick line
      function drawLeaf() {
        let leafGradient = context.createLinearGradient(
          xPos,
          yPos - iterations / 2,
          xPos,
          yPos + iterations / 2
        );
        leafGradient.addColorStop(0, "#97A160");
        leafGradient.addColorStop(1, "#676d41");
        context.beginPath();
        context.moveTo(xPos, yPos);
        context.lineWidth = iterations / 3;
        context.strokeStyle = leafGradient;
        xPos += iterations * Math.sin(lineAngle);
        yPos -= iterations * Math.cos(lineAngle);
        context.lineTo(xPos, yPos);
        context.stroke();
        context.closePath();
      }
  
      setTrunkStroke();
  
      var stack = []; // Stack to store previous states
      // Draw the tree
      for (var i = 0; i < tree.length; i++) {
        var char = tree.charAt(i);
        if (char == "X") {
          // Do nothing for X
        } else if (char == "F") {
          context.beginPath();
          context.moveTo(xPos, yPos);
          setTrunkStroke();
  
          // Move forward and draw a line
          xPos += lineLength * Math.sin(lineAngle);
          yPos -= lineLength * Math.cos(lineAngle);
          context.lineTo(xPos, yPos);
          context.stroke();
          context.closePath();
        } else if (char == "-") {
          // Turn left with a slight random variation
          if (Math.random() < 0.3) {
            lineAngle += angle_step;
          } else {
            lineAngle -= angle_step;
          }
        } else if (char == "+") {
          // Turn right with a slight random variation
          if (Math.random() < 0.3) {
            lineAngle -= angle_step;
          } else {
            lineAngle += angle_step;
          }
        } else if (char == "[") {
          // Save current state to the stack
          stack.push([xPos, yPos, lineAngle]);
        } else if (char == "]") {
          drawLeaf();
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
  
    // Fill the canvas with a light yellow color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw a box for the trees to grow in
    context.fillStyle = "#fbf7c2";
    context.fillRect(0, canvas.height - 380, canvas.width, 280);
  
    // Center tree
    drawTree(context, 512, 6);
  
    // Draw multiple iterations for different sizes and positions
    //   for (var z = 3; z < 7; z++) {
    //     drawTree(context, 20 * z * z, z);
    //   }
    context.fillStyle = backgroundColor;
    context.fillRect(0, canvas.height - 100, canvas.width, 100);
}

document.addEventListener("DOMContentLoaded", function () {
  populateScene();
});

document.addEventListener("click", function () {
  populateScene();
});