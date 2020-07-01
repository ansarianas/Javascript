//Keeping track of the game
var score, roundScore, active, gamePlaying, lastDice;

//Initialize the game
function init() {
  score = [0, 0];
  active = 0;
  roundScore = 0;
  gamePlaying = true;

  //1-Global score
  $('#score-0').text(0);
  $('#score-1').text(0);

  //2-Current score
  $('#current-0').text(0);
  $('#current-1').text(0);

  //3-Hide dice for the first time when the app loads
  displayDice('none');

  //4-Change the text from winner to player
  $('#name-0').text('Player 1');
  $('#name-1').text('Player 2');

  //5-Make player 0 as active if he is not
  if (!$('.player-0-panel').hasClass('active')) $('.player-0-panel').addClass('active');

  //6-Remove winner class from both player panel
  $('.player-0-panel').removeClass('winner');
  $('.player-1-panel').removeClass('winner');

  //7-Enable the button
  var btnArgs = [false, 'pointer'];
  disableEnableBtn(btnArgs);
}

init();

//Roll btn
$('.btn-roll').on('click', function () {
  if (gamePlaying) {
    //1-Generate random number
    var dicenumber0 = Math.ceil(Math.random() * 6);
    var dicenumber1 = Math.ceil(Math.random() * 6);

    //2-Make the dice visible
    displayDice('block');

    //3-Change the dice number accordingly to the number i.e rolled
    $('#dice-1').attr('src', `img/dice-${dicenumber0}.png`);
    $('#dice-2').attr('src', `img/dice-${dicenumber1}.png`);

    //4-Switch player
    if (dicenumber0 === 6 && lastDice === 6) {
      score[active] = 0;
      $(`#score-${active}`).text(score[active]);
      nextPlayer();
    } else if (dicenumber0 !== 1 && dicenumber1 !== 1) {
      roundScore += dicenumber0 + dicenumber1;
      $(`#current-${active}`).text(roundScore);
    } else {
      nextPlayer();
    }
  }
  lastDice = dicenumber0;
});

//Hold btn
$('.btn-hold').on('click', function () {
  var input = $('.final-score').val();
  var winningScore;
  //1-If user wish to set the score if not than 100 will be the winning score
  input ? winningScore = input : winningScore = 100;

  //1-If game is active then update / sync current with global and change the player
  if (gamePlaying) {
    score[active] += roundScore;
    $(`#score-${active}`).text(score[active]);
  }

  //2-Check the winner if winning score matched
  if (score[active] >= winningScore) {
    winner();
    gamePlaying = false;
  } else {
    nextPlayer();
  }
});

//New game btn
$('.btn-new').on('click', init);

function nextPlayer() {
  displayDice('none');
  roundScore = 0;
  active === 0 ? (active = 1) : (active = 0);
  $(`#current-${active}`).text(roundScore);
  $('.player-0-panel').toggleClass('active');
  $('.player-1-panel').toggleClass('active');
}

function winner() {
  displayDice('none');
  $(`#name-${active}`).text('WINNER!');
  $(`.player-${active}-panel`).removeClass('active');
  $(`.player-${active}-panel`).addClass('winner');
  var btnArgs = [true, 'not-allowed'];
  disableEnableBtn(btnArgs);
}

function disableEnableBtn(arr) {
  $('.btn-roll').attr('disabled', arr[0]);
  $('.btn-hold').attr('disabled', arr[0]);
  $('.btn-roll').css('cursor', arr[1]);
  $('.btn-hold').css('cursor', arr[1]);
}

function displayDice(value) {
  $('#dice-1').css('display', value);
  $('#dice-2').css('display', value);
}