const board = [];
const blockTemplate = {
  square: [[0, 0], [0, 1], [1, 0], [1, 1]],
  stick: [[0, 0], [1, 0], [2, 0], [3, 0]],
  lz: [[0, 0], [1, 0], [1, 1], [2, 1]],
  rz: [[0, 1], [1, 1], [1, 0], [2, 0]],
  t: [[0, 1], [1, 1], [2, 1], [1, 0]],
  ll: [[0, 0], [1, 0], [2, 0], [0, 1]],
  rl: [[0, 0], [1, 0], [2, 0], [2, 1]],
  stickR: [[2, -3], [2, -2], [2, -1], [2, 0]],
  lzR: [[0, 1], [0, 2], [1, 1], [1, 0]],
  rzR: [[0, 0], [0, 1], [1, 1], [1, 2]],
  tR: [[1, 2], [1, 1], [1, 0], [0, 1]],
  tB: [[0, 1], [1, 1], [2, 1], [1, 2]],
  tL: [[1, 2], [1, 1], [1, 0], [2, 1]],
  llR: [[0, 0], [0, 1], [0, 2], [1, 2]],
  llB: [[0, 1], [1, 1], [2, 1], [2, 0]],
  llL: [[0, 0], [1, 0], [1, 1], [1, 2]],
  rlR: [[0, -1], [0, 0], [0, 1], [1, -1]],
  rlB: [[0, 0], [0, 1], [1, 1], [2, 1]],
  rlL: [[1, 1], [2, 1], [2, 0], [2, -1]]
}

let myBoard;
let newPiece = [];
const startGame = () => {
  myGameArea.start();


  for (let i = 0; i < 22; i++) {
    const boardBlock = [i % 11, 19 - Math.floor(i / 11)];
    board.push(boardBlock);
  }
  
  board.splice(Math.floor(Math.random()*10) + 11, 1);
  board.splice(Math.floor(Math.random()*10), 1);


  myBoard = new GameBoard(0, 0, 0, 0, board, 3);
  myBoard.nextShape();
}

let myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener('keydown', function (e) {
      myGameArea.key = e.key;
    });
    window.addEventListener('keyup', function (e) {
      myGameArea.key = false;
      // myGameArea.sensitiveKey = e.key;
    })
    
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

function GameBoard(xBlocks, yBlocks, blockSize, boardPos, board, shape) {

  this.board = [...board];
  this.pieceNum = shape;
  this.shape = [];

  this.nextShape = () => {
    const shapeNum = Math.round(Math.random() * 6);
    this.pieceNum = shapeNum;
    this.shape = [];
    this.newShape();
  }

  this.newShape = () => {
    const keys = Object.keys(blockTemplate);
    for (block of blockTemplate[keys[this.pieceNum]]) {
      this.shape.push([...block]);
    }
    for (block of this.shape) {
      block[0] += 4;
    }
  }

  this.checkEnd = () => {
    for (block of this.board) {
      if(block[1] === 0){
        alert("gameEnd");
        this.restart();
      }  
    }
  }

  this.restart = () => {
    this.board  = [];
    for (let i = 0; i < 22; i++) {
      const boardBlock = [i % 11, 19 - Math.floor(i / 11)];
      this.board.push(boardBlock);
    }
    this.board.splice(Math.floor(Math.random()*10) + 11, 1);
    this.board.splice(Math.floor(Math.random()*10), 1);
    this.nextShape();

  }

  this.update = function() {
    const ctx = myGameArea.context;
    ctx.fillStyle = "dodgerblue";
    ctx.fillRect(79, 79, 330, 600);

    
    /**
     * 
     * Draw Board
     */

    ctx.fillStyle = "grey";
    for (block of this.board) {
      ctx.fillRect( 80 + (block[0] * 30), 80 + (block[1] * 30) , 28, 28);
    }


    /***
     * Draw new Piece* */
    ctx.fillStyle = "white";
    for (block of this.shape) {
      ctx.fillRect( 80 + (block[0] * 30), 80 + (block[1] * 30) , 28, 28);
    }
  };

  this.removeLine = () => {
    let lineCheck = [], removeLine = 0;
    for (let block of this.board) {
      lineCheck[block[1]] ??= 0;
      lineCheck[block[1]] ++;
    }

    for (let i = 19; i >= 0; i--) {
      if (lineCheck[i] === 11) {
        // console.log(i);
        for ( let j = 0; j < this.board.length; j++) {
          if (this.board[j][1] === i + removeLine) { 
            this.board.splice(j, 1);
            j--;
          }
        }
        removeLine ++;
        for (let j = 0; j < this.board.length; j++) {
          if (this.board[j][1] < i + removeLine) this.board[j][1] += 1;
        }
      }
    }
    // console.log(lineCheck);
  }

  this.checkLanding = () => {
    for (block of this.shape) {
      for(underBlock of this.board){
        if (underBlock[0] !== block[0]) {
          continue;
        }
        if (block[1] + 1 === underBlock[1]) {
          this.land();
          return true;
        }
      }
      if (block[1] + 1 === 20) {
        this.land();
        return true;
      }
    }
    return false;
  }

  this.land = () => {
    this.board = [...this.board, ...this.shape];
    // console.log(this.board);
    this.shape = [];
    this.removeLine();
    this.checkEnd();
    this.nextShape();
  }
  
  this.newPos = function() {
    this.checkLanding();

    for (block of this.shape) {
      block[1] += 1;
    }
  }

  this.moveLeft = function () {
    let canMove = true;
    for (block of this.shape) {
      if (block[0] == 0) {
        canMove = false;
        break;
      }
      for (underBlock of this.board) {
        if(underBlock[1] !== block[1]) continue;
        else if (block[0] - 1 === underBlock[0]) canMove = false;
      }
    }
    if (canMove) {
      for (block of this.shape) {
        block[0] -= 1;
      }  
    }
  }

  this.moveRight = function () {
    let canMove = true;
    for (block of this.shape) {
      if (block[0] == 10) {
        canMove = false;
        break;
      }
      for (underBlock of this.board) {
        if(underBlock[1] !== block[1]) continue;
        else if (block[0] + 1 === underBlock[0]) canMove = false;
      }
    }
    if (canMove) {
      for (block of this.shape) {
        block[0] += 1;
      }  
    }
  }

  this.rotate = () => {
    let tempX = 0, tempY = 0;
    let keys = Object.keys(blockTemplate);
    tempX = this.shape[0][0] - blockTemplate[keys[this.pieceNum]][0][0];
    tempY = this.shape[0][1] - blockTemplate[keys[this.pieceNum]][0][1];
    console.log(tempX, tempY);
    switch (this.pieceNum) {
      case 1:
        if (tempY > 0){
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + blockTemplate.stickR[i][0];
            this.shape[i][1] = tempY + blockTemplate.stickR[i][1]; 
          }
          this.pieceNum = 7;
        }
        break;
      case 2:

        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + blockTemplate.lzR[i][0];
          this.shape[i][1] = tempY + blockTemplate.lzR[i][1];
        }
        this.pieceNum = 8;
        break;
      case 3:

        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + blockTemplate.rzR[i][0];
          this.shape[i][1] = tempY + blockTemplate.rzR[i][1];
        }
        this.pieceNum = 9;
        break;
      case 4:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.tR[i][0];
          this.shape[i][1] = tempY + blockTemplate.tR[i][1];
        }
        this.pieceNum = 10;
        break;
      case 5:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.llR[i][0];
          this.shape[i][1] = tempY + blockTemplate.llR[i][1];
        }
        this.pieceNum = 13;
        break;
      case 6:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.rlR[i][0];
          this.shape[i][1] = tempY + blockTemplate.rlR[i][1];
        }
        this.pieceNum = 16;
        break;
      case 7:
        if(tempX >= 0 && tempX < 8){
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + blockTemplate.stick[i][0];
            this.shape[i][1] = tempY + blockTemplate.stick[i][1];
          }
          this.pieceNum = 1;
        }
        break;
      case 8:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.lz[i][0];
            this.shape[i][1] = tempY + blockTemplate.lz[i][1];
          }
          this.pieceNum = 2;
        }
        break;
      case 9:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.rz[i][0];
            this.shape[i][1] = tempY + blockTemplate.rz[i][1];
          }
          this.pieceNum = 3;
        }
        break;
      case 10:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.tB[i][0];
            this.shape[i][1] = tempY + blockTemplate.tB[i][1];
          }
          this.pieceNum = 11;
        }
        break;
      case 11:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.tL[i][0];
          this.shape[i][1] = tempY + blockTemplate.tL[i][1];
        }
        this.pieceNum = 12;
        break;
      case 12:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.t[i][0];
            this.shape[i][1] = tempY + blockTemplate.t[i][1];
          }
          this.pieceNum = 4;
        }
        break;
      case 13:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.llB[i][0];
            this.shape[i][1] = tempY + blockTemplate.llB[i][1];
          }
          this.pieceNum = 14;
        }
        break;
      case 14:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.llL[i][0];
          this.shape[i][1] = tempY + blockTemplate.llL[i][1];
        }
        this.pieceNum = 15;
        break;
      case 15:
        if(tempX >= 0  && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.ll[i][0];
            this.shape[i][1] = tempY + blockTemplate.ll[i][1];
          }
          this.pieceNum = 5;
        }
        break;
      case 16:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.rlB[i][0];
            this.shape[i][1] = tempY + blockTemplate.rlB[i][1];
          }
          this.pieceNum = 17;
        }
        break;
      case 17:
        for (let i = 0; i < this.shape.length; i++) {

          this.shape[i][0] = tempX + blockTemplate.rlL[i][0];
          this.shape[i][1] = tempY + blockTemplate.rlL[i][1];
        }
        this.pieceNum = 18;
        break;
      case 18:
        if(tempX >= 0 && tempX < 9){
          for (let i = 0; i < this.shape.length; i++) {

            this.shape[i][0] = tempX + blockTemplate.rl[i][0];
            this.shape[i][1] = tempY + blockTemplate.rl[i][1];
          }
          this.pieceNum = 6;
        }
        break;
      default:
        break;
        
    }
  }

  this.drop = () => {
    while (!this.checkLanding()) {
      for (block of this.shape) {
        block[1] += 1;
      }
    }
  }
}

const everyInterval = (n) => {
  if (myGameArea.frameNo % n == 0 ) {
    return true;
  }
  return false;
}

const updateGameArea = () => {
  myGameArea.frameNo += 1;
  myGameArea.clear();
  inputProcess();

  if (everyInterval(30)) {
    // console.log(myBoard.shape); 
    myBoard.newPos();
  }
  myBoard.update();
}

const inputProcess = () => {
  if (myGameArea.key && myGameArea.key === 'a') {
    myBoard.moveLeft();
    myBoard.checkLanding();
    myGameArea.key = false;
  }
  if (myGameArea.key && myGameArea.key === 'd') {
    myBoard.moveRight();
    myBoard.checkLanding();
    myGameArea.key = false;
  }
  if (myGameArea.key && myGameArea.key === 's') {
    myBoard.rotate();
    myGameArea.key = false;
  }
  if (myGameArea.key && myGameArea.key === 'Shift') {
    myBoard.drop();
    myGameArea.key = false;
  }


  // if (myGameArea.sensitiveKey && myGameArea.sensitiveKey === 's') {
  //   myBoard.rotate();
  //   myGameArea.sensitiveKey = false;
  // }
  // if (myGameArea.sensitiveKey && myGameArea.sensitiveKey === 'Shift') {
  //   myBoard.drop();
  //   myGameArea.sensitiveKey = false;
  // }
}

