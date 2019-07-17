// #### Constructors ####
// !!! render / paint block function

// !!! Consider adding boardSquares to the parameters for the block class so that it can increase in purity and move up out of the dom to it's rightful place near the top of the code.
class Block {
  constructor(homeIndex, possibleRotations) {
    this.homeIndex = homeIndex
    this.rotationIndex = 0
    this.rotations = possibleRotations
  }
  get indexesOccupied() {
    return calculateBlockIndexes(this, this.rotationIndex, this.homeIndex)
  }

  // !!! Might want to make it so that the blocks check if they can rotate before rotating, rather than going through the motions and adjusting
  rotate(boardSquares) {
    if (newPositionIfCanRotate(boardSquares, this)) {
      // !!! If the below stays as it is you can have a function that just paints the block where ever it is and use it on this and move (and correctPlacement? If that still exists)
      this.indexesOccupied.forEach(index => {
        if (index >= 0) boardSquares[index].classList.add('has-active-block', this.styleClass)
      })
    }
    projectDrop(boardSquares, this)
  }
}

// !!! swap minus widths with units so it goes X Y not Y X

class IBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-1, 0, +1, +2],
        [-boardWidth*2, -boardWidth, 0, +boardWidth],
        [-boardWidth-1, -boardWidth, -boardWidth+1, -boardWidth+2],
        [-boardWidth*2+1, -boardWidth+1, +1, +boardWidth+1]
      ]
    )
    this.styleClass = 'i-square'
    this.projectionStyleClass = 'i-projection'
  }
}

class JBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth-1, -1, 0, +1],
        [-boardWidth, -boardWidth+1, 0, +boardWidth],
        [-1, 0, +1, +boardWidth+1],
        [-boardWidth, 0, +boardWidth-1, +boardWidth]
      ]
    )
    this.styleClass = 'j-square'
    this.projectionStyleClass = 'j-projection'
  }
}

class LBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth+1, -1, 0, +1],
        [-boardWidth, 0, +boardWidth, +boardWidth+1],
        [-1, 0, +1, +boardWidth-1],
        [-boardWidth-1, -boardWidth, 0, boardWidth]
      ]
    )
    this.styleClass = 'l-square'
    this.projectionStyleClass = 'l-projection'
  }
}

class OBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth-1, -boardWidth, -1, 0]
      ]
    )
    this.styleClass = 'o-square'
    this.projectionStyleClass = 'o-projection'
  }
  rotate(boardSquares) {
    projectDrop(boardSquares, this)
  }
}

class SBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth, -boardWidth+1, -1, 0],
        [-boardWidth, 0, +1, +boardWidth+1],
        [0, +1, +boardWidth-1, +boardWidth],
        [-boardWidth-1, -1, 0, +boardWidth]
      ]
    )
    this.styleClass = 's-square'
    this.projectionStyleClass = 's-projection'
  }
}

class TBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth, -1, 0, +1],
        [-boardWidth, 0, +1, +boardWidth],
        [-1, 0, +1, +boardWidth],
        [-boardWidth, -1, 0, +boardWidth]
      ]
    )
    this.styleClass = 't-square'
    this.projectionStyleClass = 't-projection'
  }
}

class ZBlock extends Block {
  constructor(homeIndex, boardWidth=width) {
    super(
      homeIndex,
      [
        [-boardWidth-1, -boardWidth, 0, +1],
        [-boardWidth+1, 0, +1, +boardWidth],
        [-1, 0, +boardWidth, +boardWidth+1],
        [-boardWidth, -1, 0, +boardWidth-1]
      ]
    )
    this.styleClass = 'z-square'
    this.projectionStyleClass = 'z-projection'
  }
}


/// ### Global Variables
const width = 10
const height = 20
let dropInterval = null
let activeBlock = null
let shuffledBlocks = []
let score = 0
let linesCleared = 0
let level = 1
const levelsAtLines = [1, 5, 10, 15, 25, 35, 50, 70, 100]
const blockConstructors = [TBlock, IBlock, JBlock, LBlock, SBlock, ZBlock, OBlock]

// ### Global Functions

function buildBoard(boardSelector) {
  const boardSquares = []
  for (var i = 0; i < width * height; i++) {
    const square = document.createElement('div')
    square.className = 'board-square'
    //!!! square.textContent = i
    boardSelector.appendChild(square)
    boardSquares.push(square)
  }
  return boardSquares
}
//!!! Add a lockBlock version for end game
/// !!! Or even better, refactor so that one version suits every situation. I also don't like the second pram
function clearBlocks(squares, blockStyleClass){
  squares.forEach(square => {
    if (
      blockStyleClass === 'has-active-block' &&
      square.classList.contains('has-active-block')
    ) square.className = 'board-square'
    else if (
      blockStyleClass === 'has-active-block' &&
      square.classList.contains('project')
    ) {
      square.classList.remove(
        'project',
        'i-projection',
        'j-projection',
        'l-projection',
        'o-projection',
        's-projection',
        't-projection',
        'z-projection'
      )
    } else if (
      blockStyleClass === 'next-display-square'
    ) {
      square.className = 'next-display-square'
    }
  })
}

function checkIfMovingIntoWall(direction, squareIndex) {
  // !!! Change squareIndex name
  if ((squareIndex + width) % width === width - 1 && direction === 'left') {
    return true
  } else if (squareIndex % width === 0 && direction === 'right') {
    return true
  }
  return false
}

//!! If classes get moved up to the top this may need to moved
function calculateBlockIndexes(block, rotationIndex, homeIndex) {
  return block.rotations[rotationIndex].map(index => index + homeIndex)
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

function canBlockMove(boardSquares, direction, index) {
  if (
    (index >= 0 &&
    boardSquares[index].classList.contains('locked')) ||
    (checkIfMovingIntoWall(direction, index))
  ) return true
  else return false
}

// !!! This clear = true stuff, and projection block stuff is janky!
function move(boardSquares, block, direction, clear=true, calledByDropP=false) {
  const newHomeIndex = newHomeIfCanMove(boardSquares, block, direction)
  if (newHomeIndex) {
    if (clear) clearBlocks(boardSquares, 'has-active-block')
    block.homeIndex = newHomeIndex
    block.indexesOccupied.forEach(index => {
      if (index >= 0 && !calledByDropP) {
        boardSquares[index].classList.add('has-active-block', block.styleClass)
      }
    })
  }
  if (!calledByDropP) projectDrop(boardSquares, block)
}

function newHomeIfCanMove(boardSquares, block, direction) {
  // !!! Also bring the logic that stops it from going through the bottom into here maybe?
  const potentialHomeIndex = updateHome(direction, block)
  const indexesToOccupy =  calculateBlockIndexes(block, block.rotationIndex, potentialHomeIndex)
  return !indexesToOccupy.some(index => {
    return canBlockMove(boardSquares, direction, index)
  }) ? potentialHomeIndex : false
}

function rotatingIntoWall(indexesToOccupy) {
  let atLeftWall
  let atRightWall
  // ### Checking if in wall
  for (const squareIndex of indexesToOccupy) {
    if (squareIndex % width === 0) {
      atLeftWall = squareIndex
    } else if (squareIndex % width === width - 1) {
      atRightWall = squareIndex
    }
  }
  return !atLeftWall || !atRightWall
}

// !!! Update and move are doing awfully similar things. Intergrate somehow?
// !!! everything relating to the checks for movement and walls are super dodgey. Firstly they need to happen repeatedly. Secondly they won't work for anything other than walls (so not the blocks at the bottom), thirdly I've added this really dodgey  boolean to move to ignore the checkIfMovingIntoWall. I need a major restructure / rethink
//!!! Change name
function correctPlacement(block, direction, amount=1) {
  if (direction === 'right') {
    return block.homeIndex + amount
  } else if (direction === 'left') {
    return block.homeIndex - amount
  }
}
// !!! Change name
// !!! Remove need for blockConstructors to be passed once their above the dom line
function wallRotationCorrections(block, indexesToOccupy, newRotationIndex) {
  let newHomeIndex = block.homeIndex
  if (!rotatingIntoWall(indexesToOccupy)) {
    if (!(block instanceof IBlock)) {
      if (block.homeIndex % width === 0) {
        newHomeIndex = correctPlacement(block, 'right')
      } else {
        newHomeIndex = correctPlacement(block, 'left')
      }
    } else {
      if (newRotationIndex === 2 && block.homeIndex % width === 0) {
        newHomeIndex = correctPlacement(block, 'right')
      } else if (newRotationIndex === 2) {
        newHomeIndex = correctPlacement(block, 'left', 2)
      } else if (newRotationIndex === 0 && block.homeIndex % width === width - 1) {
        newHomeIndex = correctPlacement(block, 'right', 2)
      } else {
        newHomeIndex = correctPlacement(block, 'left')
      }
      indexesToOccupy = calculateBlockIndexes(block, newRotationIndex, newHomeIndex)
    }
  }
  return {newHomeIndex: newHomeIndex, indexesToOccupy: indexesToOccupy}
}

function canBlockRotate(boardSquares, indexesToOccupy) {
  // ### Checking if rotating into locked block
  for (const index of indexesToOccupy) {
    // !!! Can be replaced by a terniary?
    if (
      index >= boardSquares.length  ||
      (index >= 0 &&
      boardSquares[index].classList.contains('locked'))
    ) {
      return false
    }
  }
  return true
}

// !!! Change name
// So much refactoring needed
function newPositionIfCanRotate(boardSquares, block) {
  //!!! the below could be a getter if it comes up more than once
  const newRotationIndex = (block.rotationIndex + 1) % 4
  let indexesToOccupy = calculateBlockIndexes(block, newRotationIndex, block.homeIndex)
  let newHomeIndex = block.homeIndex
  const corrections = wallRotationCorrections(block, indexesToOccupy, newRotationIndex)
  newHomeIndex = corrections.newHomeIndex
  indexesToOccupy = corrections.indexesToOccupy
  if (!canBlockRotate(boardSquares, indexesToOccupy)) return false
  block.homeIndex = newHomeIndex
  move(boardSquares, block)
  clearBlocks(boardSquares, 'has-active-block')
  block.rotationIndex = newRotationIndex
  return true
}

/// !!! Turn conditional logic into it's own function
// !!! Change Name
function asLowAsCanGo(boardSquares, block) {
  return block
    .indexesOccupied
    .some(index => {
      const nextLineIndex = index + width
      if (nextLineIndex > boardSquares.length - 1) {
        return true
      } else if (nextLineIndex >= 0 && boardSquares[nextLineIndex].classList.contains('locked'))
        return true
    })
}

function copyBlock(block) {
  return new (blockConstructors.find(constructor => block instanceof constructor))()
}

function generateProjection(block) {
  const projectionBlock = copyBlock(block)
  projectionBlock.homeIndex = block.homeIndex
  projectionBlock.rotationIndex = block.rotationIndex
  projectionBlock.styleClass = 'board-square'
  return projectionBlock
}

function projectDrop(boardSquares, block) {
  const projectionBlock = generateProjection(block)
  for (let i = 0; i < height - 1 && !asLowAsCanGo(boardSquares, projectionBlock); i ++) {
    move(boardSquares, projectionBlock, 'down', false, true)
  }
  // make below part of clear or something like that. Can we just include this in the normal clear and get rid of this clear true / false stuff in clear?
  clearBlocks(boardSquares, 'project')
  projectionBlock.indexesOccupied.forEach(index => {
    //!!! Change project CSS class to has-projection
    if (index > 0) boardSquares[index].classList.add('project', projectionBlock.projectionStyleClass)
  })
}

function shuffleBlocks(blockConstructors) {
  const blockSequence = blockConstructors.slice(0)
  let currentIndex = blockSequence.length
  let temporaryValue
  let randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = blockSequence[currentIndex]
    blockSequence[currentIndex] = blockSequence[randomIndex]
    blockSequence[randomIndex] = temporaryValue
  }
  return blockSequence
}

// !!! Change name
function queueBlocks(queuedBlocks) {
  // !! change board pram name?
  queuedBlocks.forEach((board, i) => {
    board.forEach(square => {
      square.className = 'next-display-square'
    })
    const block = new shuffledBlocks[i](5, 4)
    block.indexesOccupied.forEach(index => {
      board[index].classList.add(block.styleClass)
    })
  })
}

function generateBlock(queuedBlocks, homeIndex) {
  if (shuffledBlocks.length <= 3) {
    shuffledBlocks = [...shuffledBlocks, ...shuffleBlocks(blockConstructors)]
  }
  const nextBlock = shuffledBlocks.shift()
  queueBlocks(queuedBlocks)
  return new nextBlock(homeIndex)
}

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

function dropLockedLines(boardSquares, removedLines) {
  removedLines.forEach((line, i) => {
    for (let j = ((line + i) * width) - 1 ; j >= 0; j--) {
      const square = boardSquares[j]
      const newSquare = boardSquares[j + width]
      newSquare.className = square.className
      square.className = 'board-square'
    }
  })
}


document.addEventListener('DOMContentLoaded', () => {
  // !!! Reorganise dom consts by order on the page
  const board = document.querySelector('#board')
  const boardSquares = buildBoard(board)
  const scoreDisplay = document.querySelector('#score-display')
  const levelDisplay = document.querySelector('#level-display')
  const linesClearedDisplay = document.querySelector('#lines-cleared-display')
  const nextLevelDisplay = document.querySelector('#next-level-display')
  const startResetButton = document.querySelector('#start-reset')
  const gameOverDisplay = document.querySelector('#game-over-display')
  const gameOverScoreDisplay = document.querySelector('#game-over-score-display')
  const gameOverLevelDisplay = document.querySelector('#game-over-level-display')
  const gameOverLinesClearedDisplay = document.querySelector('#game-over-lines-cleared-display')
  const playAgainButton = document.querySelector('#play-again')
  // !!! change name once these are being built automatically
  const queuedBlocks = [Array.from(document.querySelectorAll('.queued-block:nth-child(1) div')), Array.from(document.querySelectorAll('.queued-block:nth-child(2) div')), Array.from(document.querySelectorAll('.queued-block:nth-child(3) div'))]

  function levelUp(currentLevel) {
    clearInterval(dropInterval)
    console.log(500 - (currentLevel * 60))
    dropInterval = setInterval(dropBlock, 500 - (currentLevel * 60))
    return currentLevel + 1
  }

  function clearFullLines() {
    const linesToRemove = checkForCompleteLines(boardSquares)
    if (linesToRemove) {
      linesToRemove.forEach(line => {
        for (var i = 0; i < width; i++) {
          boardSquares[(line * width) + i].className = 'board-square'
        }
        score += 10
        scoreDisplay.textContent = score
        linesCleared ++
        linesClearedDisplay.textContent = linesCleared
        if (linesCleared === levelsAtLines[level] && level < 9) {
          level = levelUp(level)
          levelDisplay.textContent = level
        }
        nextLevelDisplay.textContent = levelsAtLines[level] - linesCleared || '∞'
      })
      dropLockedLines(boardSquares, linesToRemove)
      move(boardSquares, activeBlock)
    }
  }

  function checkForGameOver() {
    if(activeBlock.indexesOccupied.some(index => index < 0)) {
      return true
    }
    return false
  }

  function lockBlock(block) {
    block.indexesOccupied.forEach(index => {
      boardSquares[index].classList.remove('has-active-block')
      boardSquares[index].classList.add('locked', this.styleClass)
      boardSquares[index].setAttribute('data-style-class', this.styleClass)
    })
  }

  function startBlockFall(boardSquares) {
    activeBlock = generateBlock(queuedBlocks, width / 2)
    // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned. Although on third throughts. I'm not sure it's even doing anything
    if(activeBlock instanceof IBlock) {
      activeBlock.homeInext - width
      // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned
      move(boardSquares, activeBlock, 'left')
    }
    move(boardSquares, activeBlock)
  }

  function dropBlock() {
    if (asLowAsCanGo(boardSquares, activeBlock)) {
      if (checkForGameOver()) {
        gameOver()
      } else {
        lockBlock(activeBlock)
        startBlockFall(boardSquares)
        clearFullLines()
      }
    } else {
      move(boardSquares, activeBlock, 'down')
    }
  }
  function fastDropBlock() {
    score ++
    scoreDisplay.textContent = score
    dropBlock()
  }
  function endGame() {
    activeBlock = null
    shuffledBlocks = []
    clearInterval(dropInterval)
    boardSquares.forEach(square => {
      square.className = 'board-square'
    })
    clearBlocks([...queuedBlocks[0], ...queuedBlocks[1], ...queuedBlocks[2]], 'next-display-square')

  }

  function gameOver() {
    endGame()
    gameOverDisplay.style.display = ''
    gameOverScoreDisplay.textContent = score
    gameOverLevelDisplay.textContent = level
    gameOverLinesClearedDisplay.textContent = linesCleared
  }

  function startGame() {
    if(!activeBlock) {
      startBlockFall(boardSquares)
      score = 0
      scoreDisplay.textContent = 0
      dropInterval = setInterval(dropBlock, 500)
      level = 1
      levelDisplay.textContent = level
      linesCleared = 0
      linesClearedDisplay.textContent = linesCleared
      nextLevelDisplay.textContent = 5
      gameOverDisplay.style.display = 'none'
    }
  }

  function toggleStartReset() {
    if (gameOverDisplay.style.display === 'none') {
      if (startResetButton.textContent === 'Start') {
        startGame()
        startResetButton.textContent = 'Reset'
      } else {
        endGame()
        startResetButton.textContent = 'Start'
      }
    }
  }

  startResetButton.addEventListener('click', toggleStartReset)
  playAgainButton.addEventListener('click', startGame)
  document.addEventListener('keydown', (e) => {
    if(activeBlock) {
      switch(e.keyCode) {
        case 37:
          move(boardSquares, activeBlock, 'left')
          break
        case 39:
          move(boardSquares, activeBlock, 'right')
          break
        case 40:
          fastDropBlock()
          break
        case 38:
          activeBlock.rotate(boardSquares)
          break
      }
    }
  })
})
