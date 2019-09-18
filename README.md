# GA Project 1: Tetris

## Overview

Tetris is a classic arcade puzzle game created by Alexey Leonidovich Pajitnov 1984, in which the player tessellates tiled blocks to score points, clear horizontal lines and stop the game board from overflowing with blocks.

My Tetris project is the first solo project that I have completed as part of a General Assembly Software Engineering Immersive course. It was built over the course of one week, using a combination of JavaScript, HTML and CSS.

Give it a try [here](https://fearchar.github.io/tetris-project/)!

![Tetris Project (Fearchar - GA)](https://media.giphy.com/media/j2S9spaxnENrfHb08e/giphy.gif)

# The Brief

* Create a browser based version of the classic arcade game Tetris
* The game should stop if a Tetris block (tetrimino) fills the highest row of the game board
* The player should be able to rotate each block about its own axis
* If a line is completed it should be removed and the pieces above should take its place

## Technologies Used

* HTML 5
* CSS 3
* SCSS
* JavaScript (ES6)
* Git
* GitHub
* Google Fonts

## Approaches and Features

### Block Classes

I created the seven Tetris blocks using seven Block constructors written using class syntax, all inheriting properties and functions from a Block parent constructor. These constructors contain the coordinates for the pieces in their various rotations and a string which indicates to the browser what CSS class to associate with each of them, allowing them to be drawn to the grid. The block objects, once constructed, keep track of their position on the game bard and how they are rotated.

### Creating And Updating The Grid

I used an array of 200 divs generated using JavaScript to create the board, as opposed to a two dimensional array, and used logic to create the illusion of a two dimensional game board. I changed what was visible in the grid using CSS classes assigned using JavaScript. These were used to display the falling blocks, the blocks that were locked into the game board and the block projections which allowed the player to see where their blocks would fall.

### Wall Aversion And Rotation Logic

I used the indexes of the game board to determine where the left and right walls of the game board are and built logic which determined whether the player was attempting to move the active block through the walls. Stopping pieces from rotating into the walls and previously dropped blocks locked into the game board, and maintaining game behaviour seen in the original game, was more difficult. I built functions which first checked whether a piece was rotating into a wall and, if possible, moved a piece away from the wall to allow it to rotate. If a combined maneuver of rotation and sideways movement can not be achieved, the block is not allowed to rotate.

### Locking And Clearing Blocks

Once a block reaches the bottom of the screen, or falls onto an already locked block, the block object is discarded to be replaced by the next block to fall. The game then paints the game board with squares with the same CSS styling and a CSS class which indicates that it has been locked to the game board, before checking to see whether any horizontal lines have been completed. If they have, a function is called which drops each line above down by own, offseting to compensate for additional lines if more than has been completed in a single move.

### Block Projection

A ‘projection’ of each active block is created to let the player see where their pieces will go if it’s allowed to fall to the bottom of the game board / the locked blocks beneath it. This created by making a copy of the active block, including it’s rotation and position and moving it down as far as it can go. When it can go no further, a low opacity version of the block is painted to the game board using an accompanying projection CSS class.

### Random Block Generation

The order blocks drop in is randomised using a combination of JavaScripts Math.random() method and the Fisher-Yates shuffling algorithm, to deliver an equal but random distribution of Tetris blocks.

### Next Blocks Display

The player can see the next three blocks that will be generated on the game board, using a display at the top right of the game.

### Scoring And Levels

The player scores points when they hold down the down arrow key, speeding up a block’s decent, and when they clear horizontal lines. As they continue to clear lines they increase the difficulty level of the game, speeding up the normal decent of the pieces. This is then displayed by manipulating the DOM using JavaScript.

### The Game Over Screen

I have created a game over screen for the game which spans the length and breadth of the screen, covering the game board with partially transparent div and shows the player their score, the number of lines they have successfully cleared and the level they had reached when the game ended. This was achieved by giving the game-over-display div a style of ‘none’ when the page is loaded and then changing this style when the game ends, and resetting if the player chooses to play the game again.

## Code I'm Proud Of

### The CheckForCompleteLines function

```javascript
function checkForCompleteLines(boardSquares) {
  const linesToRemove = []
  const numberOfLines = boardSquares.length / width
  for (var i = numberOfLines - 1; i >= 0; i--) {
    if(boardSquares.slice(i * width, (i * width) + width).every(square => {
      return square.classList.contains('locked')
    })) linesToRemove.push(i)
  }
  return linesToRemove[0] ? linesToRemove : false
}
```

This function iterates from the end of the game board array, making slices of each line and checking if every square in that line contains a locked square. It then returns an array containing the a number representing which lines need to be removed. I like this piece of code because it’s clear and succinct.

### The projectDrop Method

```javascript
  projectDrop(boardSquares) {
    const projectionBlock = this.generateProjection()
    for (let i = 0; i < height - 1 && !projectionBlock.asLowAsCanGo(boardSquares); i++) {
      projectionBlock.move(boardSquares, projectionBlock, 'down', false, true)
    }
    clearBlocks(boardSquares, 'has-projection')
    projectionBlock.indexesOccupied.forEach(index => {
      if (index >= 0) boardSquares[index].classList.add('has-projection', projectionBlock.projectionStyleClass)
    })
  }
```

The Block classes projectDrop method is used to create and manage the transparent projections which show the player where their block will fall. It creates a projection and moves it downwards until it comes in contact with a locked block or the bottom of the screen, at which point it displays the projection to the player. While this isn’t the most crucial piece of the projects code, I’m proud of the elegance of the solution. I struggled while adding this feature and I’m happy with it’s simplicity.

## Challenges Overcome

While not necessarily the hardest to solve, the challenge I’m most proud of tackling the problem of how to make the block projections drop. I came up with an overly complicated function which tried to determine what the highest locked block beneath the projection was, which failed in specific edge cases. I was happy to replace this with the much simpler solution I have now.

## Bugs

So far I’ve only been able to find one bug and only in one instance. If you rotate the blue “I” block in the right situation, it will rotate into the locked playing field.

## Things to add in future

* Responsive layout for mobile and desktop, along with on screen buttons to allow for play on those devices
* A landing page which describes the rules of Tetris
* Animation for line clearing
* Music and audio for line clearing, levelling up and game over
