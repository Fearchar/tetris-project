const width = 10
const height = 20
let dropInterval = null
let activeBlock = null
let shuffledBlocks = []
let score = 0
let linesCleared = 0
let level = 1
const levelsAtLines = [1, 5, 10, 15, 25, 35, 50, 70, 100]

function buildBoard(boardSelector) {
  const boardSquares = []
  for (var i = 0; i < width * height; i++) {
    const square = document.createElement('div')
    square.className = 'board-square'
    square.textContent = i
    boardSelector.appendChild(square)
    boardSquares.push(square)
  }
  return boardSquares
}

function clearBlocks(squares){
  squares.forEach(square => {
    if (square.classList.contains('has-active-block')) square.className = 'board-square'
  })
}

function checkIfMovingIntoWall(direction, index) {
  // !!! Change index name
  if ((index + width) % width === width - 1 && direction === 'left') {
    return true
  } else if (index % width === 0 && direction === 'right') {
    return true
  }
  return false
}

//!! If classes get moved up to the top this may need to moved

function calculateBlockIndexes(block, rotation, homeIndex) {
  return block.rotations[rotation].map(index => index + homeIndex)
}


// !!! Change updateHome name to something to do with moving
function updateHome(direction, block) {
  let newHomeIndex = block.homeIndex
  switch(direction) {
    case 'left':
      newHomeIndex -= 1
      break
    case 'right':
      newHomeIndex += 1
      break
    case 'up':
      newHomeIndex -= width
      break
    case 'down':
      newHomeIndex += width
      break
    default:
      newHomeIndex
  }
  return newHomeIndex
}

document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('#board')
  const boardSquares = buildBoard(board)
  const scoreDisplay = document.querySelector('#score-display')
  const levelDisplay = document.querySelector('#level-display')
  const linelsClearedDisplay = document.querySelector('#lines-cleared-display')
  const nextLevelDisplay = document.querySelector('#next-level-display')
  const nextThreeDisplay = document.querySelector('#next-three-display')
  const start = document.querySelector('#start')
  const reset = document.querySelector('#reset')


  // !!! Consider adding boardSquares to the parameters for the block class so that it can increase in purity and move up out of the dom to it's rightful place near the top of the code.
  class Block {
    constructor(homeIndex, possibleRotations) {
      this.homeIndex = homeIndex
      this.rotationIndex = 0
      this.rotations = possibleRotations
    }
    get indexesOccupied() {
      return this.rotations[this.rotationIndex].map(index => index + this.homeIndex)
    }
    newHomeIfCanMove(direction) {
      // !!! Also bring the logic that stops it from going through the bottom into here maybe?
      const potentialHomeIndex = updateHome(direction, this)
      const indexesToOccupy = this.rotations[this.rotationIndex].map(index => index + potentialHomeIndex)
      return !indexesToOccupy.some(index => {
        if (
          (index >= 0 &&
          boardSquares[index].classList.contains('locked')) ||
          (checkIfMovingIntoWall(direction, index))
        ) return true
      }) ? potentialHomeIndex : false
    }
    move(direction) {
      const newHomeIndex = this.newHomeIfCanMove(direction)
      if (newHomeIndex) {
        clearBlocks(boardSquares)
        this.homeIndex = newHomeIndex
        /// !!! Consider changeing position name
        this.indexesOccupied.forEach(index => {
          if (index >= 0) {
            boardSquares[index].classList.add('has-active-block', this.styleClass)
          }
        })
      }

    }
    // !!! Update and move are doing awfully similar things. Intergrate somehow?
    // !!! everything relating to the checks for movement and walls are super dodgey. Firstly they need to happen repeatedly. Secondly they won't work for anything other than walls (so not the blocks at the bottom), thirdly I've added this really dodgey  boolean to move to ignore the checkIfMovingIntoWall. I need a major restructure / rethink
    //!!! Change name
    correctPlacement(direction, amount=1) {
      if (direction === 'right') {
        return this.homeIndex + amount
      } else if (direction === 'left') {
        return this.homeIndex - amount
      }
    }
    // !!! Change name
    // So much refactoring needed
    newPositionIfCanRotate() {
      let canRotate
      const newRotationIndex = (this.rotationIndex + 1) % 4
      let indexesToOccupy = this.rotations[newRotationIndex].map(index => index + this.homeIndex)
      let newHomeIndex = this.homeIndex
      let atLeftWall
      let atRightWall
      // ### Checking if in wall
      for (const index of indexesToOccupy) {
        if (index % width === 0) {
          atLeftWall = index
        } else if (index % width === width - 1) {
          atRightWall = index
        }
      }
      if (!atLeftWall || !atRightWall) {
        /// !!! Doing nothing, but the condtition is important. Figure out how to safely remove this
        canRotate = true
        // ### Responding if in wall
      } else if (
        !(this instanceof IBlock)
      ) {
        if (this.homeIndex % width === 0) {
          newHomeIndex = this.correctPlacement('right')
        } else {
          newHomeIndex = this.correctPlacement('left')
        }
      } else {
        if (newRotationIndex === 2 && this.homeIndex % width === 0) {
          newHomeIndex = this.correctPlacement('right')
        } else if (newRotationIndex === 2) {
          newHomeIndex = this.correctPlacement('left', 2)
        } else if (newRotationIndex === 0 && this.homeIndex % width === width - 1) {
          newHomeIndex = this.correctPlacement('right', 2)
        } else {
          newHomeIndex = this.correctPlacement('left')
        }
        indexesToOccupy = this.rotations[newRotationIndex].map(index => index + newHomeIndex)
      }
      // ### Checking if rotating into locked block
      for (const index of indexesToOccupy) {
        // !!! Can be replaced by a terniary?
        if (
          index >= boardSquares.length  ||
          (
            index >= 0 &&
            boardSquares[index].classList.contains('locked')
          )
        ) {
          return false
        }
      }
      this.homeIndex = newHomeIndex
      this.move()
      clearBlocks(boardSquares)
      this.rotationIndex = newRotationIndex
      return true
    }
    // !!! Might want to make it so that the blocks check if they can rotate before rotating, rather than going through the motions and adjusting
    rotate() {
      if (this.newPositionIfCanRotate()) {
        // !!! If the below stays as it is you can have a function that just paints the block where ever it is and use it on this and move (and correctPlacement? If that still exists)
        this.indexesOccupied.forEach(index => {
          if (index >= 0) boardSquares[index].classList.add('has-active-block', this.styleClass)
        })
      }
    }
    // projectDrop() {
    //   // !! Change placeholder name
    //   const placeHolder = this.indexesOccupied.map(occupiedIndex => {
    //     const columnOffset = ((occupiedIndex + width) % width)
    //     for (let i = 0; i <= height - 1; i ++) {
    //       const currentLine = i *  width
    //       const currentSquareIndex = currentLine + columnOffset
    //       if (boardSquares[currentSquareIndex].classList.contains('locked')) {
    //         return currentSquareIndex - width
    //       }
    //     }
    //     const lowestSquareIndex = ((height -1) * width) + columnOffset
    //     return lowestSquareIndex
    //   })
    //   const highestLine = placeHolder.reduce((line, current) => {
    //     const currentLine = Math.floor((current / width))
    //     return currentLine <= line ? currentLine : line
    //   }, height - 1)
    //   const indexOfHighest = placeHolder.reduce((highestIndex, current, i) => {
    //     return Math.floor(current / width) <= Math.floor(placeHolder[highestIndex] / width) ? i : highestIndex
    //   }, 0)
    //   const a = +(this.rotations[this.rotationIndex][indexOfHighest] / width).toFixed(0)
    //   const homeOffset = this.homeIndex % width
    //   const projectionHomeIndex = homeOffset + (width * (highestLine - a))
    //   const indexesToOccupy = this.rotations[this.rotationIndex].map(index => index + projectionHomeIndex)
    //   boardSquares.forEach(square => square.classList.remove('project'))
    //   indexesToOccupy.forEach(index => {
    //     boardSquares[index].classList.add('project')
    //   })
    // }
  }

  // !!! swap minus widths with units so it goes X Y not Y X

  class IBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-1, 0, +1, +2],
          [-width*2, -width, 0, +width],
          [-width-1, -width, -width+1, -width+2],
          [-width*2+1, -width+1, +1, +width+1]
        ]
      )
      this.styleClass = 'i-square'
    }
  }

  class JBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width-1, -1, 0, +1],
          [-width, -width+1, 0, +width],
          [-1, 0, +1, +width+1],
          [-width, 0, +width-1, +width]
        ]
      )
      this.styleClass = 'j-square'
    }
  }

  class LBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width+1, -1, 0, +1],
          [-width, 0, +width, +width+1],
          [-1, 0, +1, +width-1],
          [-width-1, -width, 0, width]
        ]
      )
      this.styleClass = 'l-square'
    }
  }

  class OBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width-1, -width, -1, 0]
        ]
      )
      this.styleClass = 'o-square'
    }
    rotate() {
      return false
    }
  }

  class SBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width, -width+1, -1, 0],
          [-width, 0, +1, +width+1],
          [0, +1, +width-1, +width],
          [-width-1, -1, 0, +width]
        ]
      )
      this.styleClass = 's-square'
    }
  }

  class TBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width, -1, 0, +1],
          [-width, 0, +1, +width],
          [-1, 0, +1, +width],
          [-width, -1, 0, +width]
        ]
      )
      this.styleClass = 't-square'
    }
  }

  class ZBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width-1, -width, 0, +1],
          [-width+1, 0, +1, +width],
          [-1, 0, +width, +width+1],
          [-width, -1, 0, +width-1]
        ]
      )
      this.styleClass = 'z-square'
    }
  }

  const blockPrototypes = [TBlock, IBlock, JBlock, LBlock, SBlock, ZBlock, OBlock]

  function shuffleBlocks() {
    const blockSequence = blockPrototypes.slice(0)
    let currentIndex = blockSequence.length
    let temporaryValue
    let randomIndex
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = blockSequence[currentIndex]
      blockSequence[currentIndex] = blockSequence[randomIndex]
      blockSequence[randomIndex] = temporaryValue
    }
    return blockSequence
  }

  function generateBlock() {
    if (shuffledBlocks.length <= 3) {
      shuffledBlocks = shuffledBlocks.concat(shuffleBlocks())
    }
    const nextBlock = shuffledBlocks.shift()
    nextThreeDisplay.textContent =
      `${shuffledBlocks[0].name},
      ${shuffledBlocks[1].name},
      ${shuffledBlocks[2].name}`
    return new nextBlock(width / 2)
  }

  function checkForCompleteLines() {
    const linesToRemove = []
    const numberOfLines = boardSquares.length / width
    for (var i = numberOfLines - 1; i >= 0; i--) {
      if(boardSquares.slice(i * width, (i * width) + width).every(square => {
        return square.classList.contains('locked')
      })) linesToRemove.push(i)
    }
    return linesToRemove[0] ? linesToRemove : false
  }

  function dropLockedLines(removedLines) {
    removedLines.forEach((line, i) => {
      for (let j = ((line + i) * width) - 1 ; j >= 0; j--) {
        const square = boardSquares[j]
        const newSquare = boardSquares[j + width]
        newSquare.className = square.className
        square.className = 'board-square'
      }
    })
  }

  function levelUp(currentLevel) {
    clearInterval(dropInterval)
    console.log(500 - (currentLevel * 60))
    dropInterval = setInterval(dropBlocks, 500 - (currentLevel * 60))
    return currentLevel + 1
  }

  function clearFullLines() {
    const linesToRemove = checkForCompleteLines()
    if (linesToRemove) {
      linesToRemove.forEach(line => {
        for (var i = 0; i < width; i++) {
          boardSquares[(line * width) + i].className = 'board-square'
        }
        score += 10
        scoreDisplay.textContent = score
        linesCleared ++
        linelsClearedDisplay.textContent = linesCleared
        if (linesCleared === levelsAtLines[level] && level < 9) {
          level = levelUp(level)
          levelDisplay.textContent = level
        }
        nextLevelDisplay.textContent = levelsAtLines[level] - linesCleared || '∞'
      })
      dropLockedLines(linesToRemove)
      activeBlock.move()
    }
  }

  function lockBlock(block) {
    if(checkForGameOver()) {
      gameOver()
    } else {
      block.indexesOccupied.forEach(index => {
        boardSquares[index].classList.remove('has-active-block')
        boardSquares[index].classList.add('locked', this.styleClass)
        boardSquares[index].setAttribute('data-style-class', this.styleClass)
      })
      // !!! The need to use active block here is possibly another argument to bring these functions out fo the blocks
      activeBlock = generateBlock(width / 2)
      // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned
      if(activeBlock instanceof IBlock) {
        activeBlock.homeInext - width
      }
      activeBlock.move()
    }
  }

  function dropBlocks() {
    if (
      activeBlock
        .indexesOccupied
        .some(index => {
          const nextLineIndex = index + width
          if (nextLineIndex > boardSquares.length - 1) {
            return true
          } else if (nextLineIndex >= 0 && boardSquares[nextLineIndex].classList.contains('locked'))
            return true
        })
    ) {
      lockBlock(activeBlock)
      clearFullLines()
    } else {
      activeBlock.move('down')
    }
  }

  function gameOver() {
    activeBlock = null
    clearInterval(dropInterval)
    boardSquares.forEach(square => {
      square.className = 'board-square'
    })
    level = 1
    levelDisplay.textContent = level
    linesCleared = 0
    linelsClearedDisplay.textContent = linesCleared
    nextLevelDisplay.textContent = 5
    score
  }

  function checkForGameOver() {
    if(activeBlock.indexesOccupied.some(index => index < 0)) {
      return true
    }
    return false
  }

  function startGame() {
    if(!activeBlock) {
      activeBlock = generateBlock(width / 2)
      // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned
      if(activeBlock instanceof IBlock) {
        activeBlock.homeInext - width
      }
      score = 0
      scoreDisplay.textContent = 0
      dropInterval = setInterval(dropBlocks, 500)
    }
  }

  function resetGame() {
    gameOver()
  }

  start.addEventListener('click', startGame)
  reset.addEventListener('click', resetGame)
  document.addEventListener('keydown', (e) => {
    if(activeBlock) {
      switch(e.keyCode) {
        case 37:
          activeBlock.move('left')
          break
        case 39:
          activeBlock.move('right')
          break
        case 40:
          // !!! Good argument to add this to the block itself? (or maybe take all the functions off the block?)
          dropBlocks()
          score ++
          scoreDisplay.textContent = score
          break
        case 38:
          activeBlock.rotate()
          break
      }
    }
  })
})
