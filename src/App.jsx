import './App.css';
import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import io from 'socket.io-client';
const socket = io('ws://localhost:5000');

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [squares, setSquares] = useState(null)
  const [winner, setWinner] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [turn, setTurn] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
  console.log('trying to make a connection');
    socket.on('connect', () => {
      console.log(`connecting`);
      setIsConnected(true);
      
    });

    socket.on('gameOver', (data) =>{
      console.log(`GAME OVER!!`);
      setWinner(true);
    	setSquares(data.squares);
      setTurn(data.turn);
      setHighlightedSquares(data.winningSquares);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('sending initial data', (data) =>{
      console.log(`recieved squares : ${data.squares}`);
      setSquares(data.squares);
    })
    socket.on('error', (msg) => {
      setErrorMsg(msg.message);
    });

    socket.on('recieved', (data) => {
      setSquares(data.squares);
      setTurn(data.turn);
      setErrorMsg('');
    });
    // return (()=>{Container
    //   socket.disconnect();
    // })

  }, []);

  
  const handleMove = (pos) => {
  	console.log(`squares that was clicked: ${pos}`);
  	socket.emit('move', {'pos':pos});
  }
  const restart = () =>{
    socket.emit('restart', (data)=>{
      setSquares(data.squares);
      setWinner(false);
      setTurn(data.turn);
      setHighlightedSquares([]);
    })  
  }
 
  return (
  <div className="App">
  	  {errorMsg !== '' && <h1 className='error'>{errorMsg}</h1>}
      <Game squares={squares} winner={winner} 
      handleMove={(pos)=>handleMove(pos)} 
      highlightedSquares={highlightedSquares}
      restart={restart}
      turn={turn}
      />  
  </div>
  );
}

export default App;

class Game extends React.Component {
  
  handleClick(i) {
    /*const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();*/
    this.props.handleMove(i);
  }
  
  render() {
  console.log(`rendering board: ${this.props.squares}`)
    
    let status;
    status = 'Next player: ' + (this.props.turn === 0? 'X' : 'O');
    

    return (
    <>
    <h1>{this.props.winner ? 'Game Over!' : ''}</h1>
	<div>
      <Button variant='outline-dark'>New Game</Button>
      </div>
  <div>
    <Button variant='outline-dark' onClick={this.props.restart}>Restart</Button>
	</div>
	<div className="game">
	<div className="game-board">
	  <Board
	    squares={this.props.squares ? this.props.squares: Array(9).fill(null)}
	    onClick={(i) => this.handleClick(i)}
      highlightedSquares={this.props.highlightedSquares}
	  />
	</div>
	<div className="game-info">
	  <div>{status}</div>
	  {/*<ol>{moves}</ol>*/}
	</div>
	</div>
    </>
    );
  }
}


class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlighted={ this.props.highlightedSquares.some(x => x === i)}
      />
    );
  }
    
  renderRow(squares){
    return (
      <div className='board-row'>
        {squares}
      </div>
    )
  }
  renderBoard(numberOfSquares = 9, numberOfCols = 3 ){
    let rows = []
    for(let row = 0; row < numberOfSquares/ numberOfCols; row++){
      let squares = [];
      for(let col = 0; col < numberOfCols; col++){
        squares.push(this.renderSquare(row*numberOfCols + col))
      }
      rows.push(this.renderRow(squares));
    }
    return rows;
  }
  render() {
    return (
      <div>
        {this.renderBoard(9, 3)}
      </div>
    );
  }
}

function Square(props) {
  return (
    <button className={`square ${props.highlighted ? 'highlight' : ''}`} onClick={props.onClick}>
      {props.value === -1 ? null : props.value}
    </button>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
