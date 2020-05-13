let diceRoll = 100;
let balance = 100;
let scores = [50];
let total = 0;
let average = scores[0];
let multipler = 0;
let bet = 0;
let gameState = false;
let balHistory = [];
let roundCount = 0;
let gameOverChart;
let tableText;

//DOM declarations
const slider = document.getElementById("bet-slider");
const betMultiplier = document.getElementById("bet-multiplier");
const betReturn = document.getElementById("bet-return");
const stopButton = document.getElementById("Stop");
const rollBar = document.getElementById("rollBar");
const currentRoll = document.getElementById("currentRoll");
const balChange = document.getElementById("bal-change");
const gameScreen = document.getElementById("game-screen");
const gameInfo = document.getElementById("gameInfo");
const outcomeText = document.getElementById("outcomeText");
const game = document.getElementById("game");
const potCard = document.getElementById("potCard");
const multiplierCard = document.getElementById("multiplierCard");
const gameOverScreen = document.getElementById("gameOverScreen");
const ctx = document.getElementById("balHistoryChart").getContext('2d');
const winningsTable = document.getElementById("winningsTable");
const gameStats = document.getElementById("gameStats");

removeElement(gameScreen);

function rollDice(){
    //First roll
    if (gameState === false){
        roundCount++;
        document.getElementById("Roll").innerHTML = `<i class="fas fa-dice-d20"></i> Roll`;
        balance = balance - slider.value;
        balChange.innerHTML = `-$${slider.value}`;
        balChange.className = "bal-minus flash-text";
        updateBalance();
        bet = slider.value;
        removeElement(slider);
        gameState = true;
        outcomeText.innerHTML = "";
        outcomeText.className = "";
        reinstate(potCard);
        reinstate(multiplierCard);
        reinstate(gameInfo);
    }
    //Subsequent rolls
    else {
        document.getElementById("Roll").innerHTML = `<i class="fas fa-dice-d20"></i> Roll Again`
        diceRoll = Math.ceil(Math.random() * diceRoll);
        multiplier = Math.round((average / diceRoll) * 10) / 10;
        betMultiplier.innerHTML = multiplier;
        betReturn.innerHTML = "$" + Math.floor(bet * multiplier);
        reinstate(stopButton);

        balChange.className = "";

        if (diceRoll === 1){
            gameOver();
        }

    }
    updateRollBar();
}

//Rolled a 1
function gameOver(){
    addData(gameOverChart, roundCount, balance);
    addTableData(winningsTable, roundCount, `-$${slider.value}`);
    document.getElementById("Roll").innerHTML = `<i class="fas fa-sliders-h"></i> Confirm Bet`;
    gameState = false;
    outcomeText.innerHTML = "DEATH ROLL - YOU LOST";
    outcomeText.className = "alert alert-danger";
    removeElement(gameInfo);
    startGame();
}

//Took the money
function stop(){
    total = 0;
    let winnings = (Math.floor(bet * multiplier));
    if (winnings > bet) {
        scores.push(diceRoll);
        if (scores.length > 5) {
            scores.shift();
        }
    }
    console.log(scores);
    balance += winnings;
    addTableData(winningsTable, roundCount, `+$${winnings - slider.value}`);
    addData(gameOverChart, roundCount, balance);
    calcAverage();
    outcomeText.innerHTML = `YOU WON $${winnings}`;
    outcomeText.className = "alert alert-success";
    balChange.className = "bal-plus flash-text";
    balChange.innerHTML = `+$${winnings}`;
    document.getElementById("Roll").innerHTML = `<i class="fas fa-sliders-h"></i> Confirm Bet`;
    gameState = false;
    startGame();
}

function calcAverage(){
    for(var i = 0; i < scores.length; i++) {
        total += scores[i];
    }
    average = Math.floor(total / scores.length);
}

function initialiseGame(){
    diceRoll = 100;
    balance = 100;
    scores = [50];
    total = 0;
    average = scores[0];
    multipler = 0;
    bet = 0;
    gameState = false;
    balHistory = [];
    roundCount = 0;
    gameOverChart;
    tableText;
    outcomeText.innerHTML = "";
    outcomeText.className = "";
    reinstate(gameStats);
    initialiseCharts();
    reinstate(gameScreen);
    removeElement(preGameScreen);
    reinstate(game);
    removeElement(gameInfo);
    removeElement(gameOverScreen);
    startGame();
}

//Reset game parameters
function startGame(){
    betMultiplier.innerHTML = 0;
    betReturn.innerHTML = 0;
    diceRoll = 100;
    slider.max = balance;
    if (balance < slider.max) {
        slider.value = slider.max;
    }
    if (balance <5) {
        loseGame();
    }
    removeElement(gameInfo);
    removeElement(stopButton);
    updateSlider();
    updateBalance();
    updateWinBar();
    updateRollBar();
    removeElement(potCard);
    removeElement(multiplierCard);
    reinstate(slider);
}

//Updates bank balance
function updateBalance(){
    document.getElementById("Balance").innerHTML = `$${balance}`;
}

//Updates 'break even bar'
function updateWinBar(){
    document.getElementById("winBar").style.width = `${average}%`;
    document.getElementById("Average").innerHTML = `${average}`;
}

//Updates the bet slider
function updateSlider(){
    document.getElementById("bet-value").innerHTML = "$" + slider.value;
}

function loseGame(){
    console.log(balHistory);
    removeElement(gameInfo);
    removeElement(gameScreen);
    reinstate(gameOverScreen);
}

function removeElement(nameOfClass){
    nameOfClass.classList.add("removed");
}

function reinstate(nameOfClass){
    nameOfClass.classList.remove("removed");
}

//Updates the current roll progress bar
function updateRollBar(){
    currentRoll.innerHTML = diceRoll;
    rollBar.style.width = `${diceRoll}%`;
    switch (true) {
        case (diceRoll < average):
            rollBar.className="progress-bar progress-bar-striped progress-bar-animated bg-success";
            break;
        case (diceRoll === average):
            rollBar.className="progress-bar progress-bar-striped progress-bar-animated bg-warning";
            break;
        case (diceRoll === 1):
            rollBar.className="progress-bar progress-bar-striped progress-bar-animated bg-warning";
            break;
        default:
            rollBar.className="progress-bar progress-bar-striped progress-bar-animated bg-primary";
            break;
    }
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function addTableData(table, label, data){
    table.innerHTML += `<tr><td>${label}</td><td>${data}</td></tr>`;
}

function initialiseCharts(){
    //Initialise performance chart
    gameOverChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'Balance History',
                borderColor: '#DF691A'
            }]
        },

        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { 
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "white",
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    addData(gameOverChart, 0, 100);
}


$(window).scroll( function(){

	//get scroll position
	var topWindow = $(window).scrollTop();
	var topWindow = topWindow * 1.5;
	
	var windowHeight = $(window).height();
	var position = topWindow / windowHeight;
	position = 1 - (position * 3);
  
	//define arrow opacity as based on how far up the page the user has scrolled
	$('.bounce-down').css('opacity', position);
  
});

$(function() {
    $('a[href*="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 1000, 'swing');
    });
});

