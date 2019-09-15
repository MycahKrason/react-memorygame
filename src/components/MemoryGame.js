import React, { Component } from 'react';


class MemoryGame extends Component {

  //Set game variables
  firstCardSelected = "";
  secondCardSelected = "";
  countOfSelected = 0;
  targets = [];
  foundCards = [];
  firstFoundCardId = "";
  secondFoundCardId = "";
  removeCards = true;
  

  constructor(props){
    super(props);
    this.state = {
      data: [],
      isLoaded: false,
      gameStarted: false,
      guesses: 0,
      previousGameScore: "",
      alterStartBtn: "Start Game!"
    }
  }


  //Get API data
  componentDidMount(){
     this.shuffleDeck();
  }

  shuffleDeck(){
    fetch('https://deckofcardsapi.com/api/deck/new/draw/?count=52')
      .then(res => {
          return res.json();
      }).then(json => {
        this.setState({
          isLoaded: true,
          data: json
        })
      }); 
  }

  startGame(){
    this.setState({
      gameStarted: true,
      guesses: 0
    })
  }

  exitGame(){
    this.setState({
      gameStarted: false,
      guesses: 0,
      previousGameScore: ""
    })

    //Clear the found cards
    this.foundCards = [];

    //Reset the deck
    this.shuffleDeck();  
  }

  delayRemoveOrCoverCard = () => {
    if(this.removeCards){
    
      //Delete both cards if they were correct
      for(let i = 0; i < this.targets.length; i++){
        this.targets[i].className = "hide card";         
      }

      //Clear the selected cards so you can draw 2 fresh cards
      this.targets = [];
      //restart the card selected count
      this.countOfSelected = 0;

      //If all 52 cards have been found - end the game
      if(this.foundCards.length === 52){

        this.setState({
          gameStarted: false,
          previousGameScore: "Previous Score: " + this.state.guesses,
          alterStartBtn: "Play Again!"
        })

        this.foundCards = [];

        //Reset the deck
        this.shuffleDeck(); 
      }

    }else{

      //Hide the cards again when they are incorrect
      for(let i = 0; i < this.targets.length; i++){
        this.targets[i].src = require('../coveredCard.png');
        this.targets[i].className = "card";
      }

    }

    //Clear the selected cards so you can draw 2 fresh cards
    this.targets = [];
    //restart the card selected count
    this.countOfSelected = 0;
    
  }


  cardClicked = (e) => {
 
    //Get the Card Value
    let value = e.target.id.charAt(0);

    //Compare the card Values
    if(this.countOfSelected === 0){

      //Get a reference to of the card you click and put it in an array for further use
      this.targets.push(e.target);

      //Reveal Card
      e.target.src = 'https://deckofcardsapi.com/static/img/' + e.target.id + '.png';

      this.firstCardSelected = value;
      this.firstFoundCardId = e.target.id;

      //Make sure the client doesn't pick a card that was removed
      if(this.foundCards.includes(e.target.id)){
        console.log("\nYOU ALREADY PICKED THIS");
      }else{
        //cool spin
        e.target.className = "uncover card";
        //Move to the next card selection
        this.countOfSelected ++;
      }

    }else if(this.countOfSelected === 1) {

      //Get a reference to of the card you click and put it in an array for further use
      this.targets.push(e.target);

      //Reveal Card
      e.target.src = 'https://deckofcardsapi.com/static/img/' + e.target.id + '.png';

      this.secondCardSelected = value;
      this.secondFoundCardId = e.target.id;

      //Make sure the user doesn't pick the same card twice
      if(this.foundCards.includes(e.target.id) || this.firstFoundCardId === this.secondFoundCardId){
        console.log("\nYOU ALREADY PICKED THIS");
      }else{
        //cool spin
        e.target.className = "uncover card";
        //restart the card selected count
        this.countOfSelected ++;

        //Determine if player has guessed correctly or not
        if(this.firstCardSelected === this.secondCardSelected){
          console.log("good job");

          //Create an array of foundCards - This is important to check to ensure cards in this array do not do anything
          this.foundCards.push(this.firstFoundCardId, this.secondFoundCardId);
          
          //Set a delay before removing the cards
          this.removeCards = true;
          setTimeout(this.delayRemoveOrCoverCard, 2000);

        }else if(this.firstCardSelected !== this.secondCardSelected){
          console.log("Try again");

          //Set a delay before covering the cards again
          this.removeCards = false;
          setTimeout(this.delayRemoveOrCoverCard, 2000);

        }

        console.log(this.foundCards);
        //Update the Guess count
        this.setState({
          guesses: this.state.guesses + 1
        })

      }
    }

  }

  
  createDeck = () => {

    var {data} = this.state;

    let cards = []
    //loop to create cards
    for (let i = 0; i < 52; i++) {
      cards.push(<img key={i} src={require('../coveredCard.png')} id={data['cards'][i]['code']} className="card" onClick={this.cardClicked} alt={data['cards'][i]['code']}></img>);
    }
    return cards;
  }


  render(){

    var {isLoaded, gameStarted, guesses, previousGameScore, alterStartBtn} = this.state;

    //StartGame
    if(gameStarted){

      //Make sure content is loaded
      if(!isLoaded){
        return <div>Content is Loading...</div>;
      }else{
        return (
          <div className="App">
            <h2>Guesses: {guesses}</h2>
            {this.createDeck()}
            <button className="gameBtn" onClick={this.exitGame.bind(this)}><h2>Exit</h2></button>
          </div>
        );
      }
    }else{

      return (
        <div className="App">
          <div className="instructions">
            <h1>Memory Game</h1>
            <p>Test your memory skills! The goal of this game is to match all the cards until none are left. Cards are matched by value. For example, a 10 of clubs, would match with a 10 of hearts, spades, or diamonds. Good luck!</p>
            <button className="gameBtn" onClick={this.startGame.bind(this)}><h2>Click Here to {alterStartBtn}</h2></button>
            <h3>{previousGameScore}</h3>
          </div>
        </div>
      );
    }
  }
}

export default MemoryGame;