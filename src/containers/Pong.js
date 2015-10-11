import Rx from 'rx';
import createContainer from '../core/container';

import { WIDTH, HEIGHT, COURT_BUFFER, BALL_SIZE, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_BUFFER, SCORE_SIZE, BALL_START_VELOCITY } from '../constants';

import * as Surface from '../components/Surface';
import * as Court from '../components/Court';
import * as Ball from '../components/Ball';
import * as Paddle from '../components/Paddle';
import * as Layer from '../components/Layer';
import * as Score from '../components/Score';
import * as Divider from '../components/Divider';


const BALL_CENTER = [
  (WIDTH / 2) - (BALL_SIZE / 2),
  (HEIGHT / 2) - (BALL_SIZE / 2)
];


const speedUp = (val) => (
  val + (val * (Math.random() / 50))
);


const init = () => ({
  playerOneScore: Score.init(0),

  playerTwoScore: Score.init(0),

  ball: Ball.init(BALL_CENTER[0], BALL_CENTER[1], BALL_START_VELOCITY),

  paddleTop: Paddle.init('top', (WIDTH / 2) - (PADDLE_WIDTH / 2)),

  paddleBottom: Paddle.init('bottom', (WIDTH / 2) - (PADDLE_WIDTH / 2))
});


const onKeyboard = Rx.Observable.create((observer) => {
  document.addEventListener('keydown', (e) => observer.onNext({ code: e.which, pressed: true }));
  document.addEventListener('keyup', (e) => observer.onNext({ code: e.which, pressed: false }));
});


const actions = () => ({
  playerOneMoveRight: onKeyboard.filter(({ code }) => code === 39)
    .map((x) => x.pressed)
    .distinctUntilChanged(),

  playerOneMoveLeft: onKeyboard.filter(({ code }) => code === 37)
    .map((x) => x.pressed)
    .distinctUntilChanged(),

  playerTwoMoveRight: onKeyboard.filter(({ code }) => code === 68)
    .map((x) => x.pressed)
    .distinctUntilChanged(),

  playerTwoMoveLeft: onKeyboard.filter(({ code }) => code === 65)
    .map((x) => x.pressed)
    .distinctUntilChanged()
});


const view = ({ model = init() }) => (
  Surface.view({},
    Layer.view({ model: { x: (WIDTH / 2), y: (HEIGHT / 2) - (SCORE_SIZE / 2) - (HEIGHT / 4) } },
      Score.view({ model: model.playerTwoScore })),

    Layer.view({ model: { x: (WIDTH / 2), y: (HEIGHT / 2) - (SCORE_SIZE / 2) + (HEIGHT / 4) } },
      Score.view({ model: model.playerOneScore })),

    Divider.view({}),

    Court.view({}),

    Ball.view({ model: model.ball }),

    Paddle.view({ model: model.paddleTop }),

    Paddle.view({ model: model.paddleBottom }))
);


const update = ({ modelState, playerOneMoveRight, playerOneMoveLeft, playerTwoMoveRight, playerTwoMoveLeft }) => (
  Rx.Observable.merge(
    // move paddle bottom right
    Rx.Observable.combineLatest(
      modelState.observe('paddleBottom', 'x'),
      playerOneMoveRight,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.min(x + 5, WIDTH - COURT_BUFFER - PADDLE_BUFFER - PADDLE_WIDTH))
      .selectMany(modelState.set('paddleBottom', 'x')),

    // move paddle bottom left
    Rx.Observable.combineLatest(
      modelState.observe('paddleBottom', 'x'),
      playerOneMoveLeft,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.max(x - 5, COURT_BUFFER + PADDLE_BUFFER))
      .selectMany(modelState.set('paddleBottom', 'x')),

    // move paddle top right
    Rx.Observable.combineLatest(
      modelState.observe('paddleTop', 'x'),
      playerTwoMoveRight,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.min(x + 5, WIDTH - COURT_BUFFER - PADDLE_BUFFER - PADDLE_WIDTH))
      .selectMany(modelState.set('paddleTop', 'x')),

    // move paddle top left
    Rx.Observable.combineLatest(
      modelState.observe('paddleTop', 'x'),
      playerTwoMoveLeft,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.max(x - 5, COURT_BUFFER + PADDLE_BUFFER))
      .selectMany(modelState.set('paddleTop', 'x')),

    // move ball x
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('ball', 'velocity', 0),
      (x, velocity) => ({ x, velocity })
    )
      .map(({ x, velocity }) => x + velocity)
      .selectMany(modelState.set('ball', 'x')),

    // move ball y
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y'),
      modelState.observe('ball', 'velocity', 1),
      (y, velocity) => ({ y, velocity })
    )
      .map(({ y, velocity }) => y + velocity)
      .selectMany(modelState.set('ball', 'y')),

    // ball hit right wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x').map((x) => x >= WIDTH - COURT_BUFFER - BALL_SIZE),
      modelState.observe('ball', 'velocity', 0),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity }) => -velocity)
      .selectMany(modelState.set('ball', 'velocity', 0)),

    // ball hit left wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x').map((x) => x <= COURT_BUFFER),
      modelState.observe('ball', 'velocity', 0),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .map(({ velocity }) => -velocity)
      .selectMany(modelState.set('ball', 'velocity', 0)),

    // ball hit bottom wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y').map((y) => y >= HEIGHT - COURT_BUFFER - BALL_SIZE),
      modelState.observe('ball', 'velocity', 1),
      modelState.observe('playerTwoScore'),
      (hit, velocity, score) => ({ hit, velocity, score })
    )
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity, score }) => ({ velocity: -velocity, score }))
      .selectMany(({ velocity, score }) =>
        Rx.Observable.combineLatest(
          modelState.set('ball', 'velocity', 1)(velocity),
          modelState.set('ball', 'x')(BALL_CENTER[0]),
          modelState.set('ball', 'y')(BALL_CENTER[1]),
          modelState.set('playerTwoScore')(score + 1)
        )
      ),

    // ball hit top wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y').map((y) => y <= COURT_BUFFER),
      modelState.observe('ball', 'velocity', 1),
      modelState.observe('playerOneScore'),
      (hit, velocity, score) => ({ hit, velocity, score })
    )
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .selectMany(({ score }) =>
        Rx.Observable.combineLatest(
          modelState.set('ball', 'velocity')(BALL_START_VELOCITY),
          modelState.set('ball', 'x')(BALL_CENTER[0]),
          modelState.set('ball', 'y')(BALL_CENTER[1]),
          modelState.set('playerOneScore')(score + 1)
        )
      ),

    // ball hit bottom paddle
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('ball', 'y'),
      modelState.observe('ball', 'velocity', 1),
      modelState.observe('paddleBottom', 'x'),
      modelState.observe('paddleBottom', 'y'),
      (ballX, ballY, velocity, paddleX, paddleY) => ({ ballX, ballY, velocity, paddleX, paddleY })
    )
      .map(({ velocity, ballX, ballY, paddleX, paddleY }) => ({
        velocity,

        hit:
          (ballX >= paddleX) &&
          (ballX <= (paddleX + PADDLE_WIDTH)) &&
          ((ballY + BALL_SIZE) >= paddleY) &&
          ((ballY + BALL_SIZE) <= (paddleY + (PADDLE_HEIGHT / 2)))
      }))
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity }) => -velocity)
      .map(speedUp)
      .selectMany(modelState.set('ball', 'velocity', 1)),

    // ball hit top paddle
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('ball', 'y'),
      modelState.observe('ball', 'velocity', 1),
      modelState.observe('paddleTop', 'x'),
      modelState.observe('paddleTop', 'y'),
      (ballX, ballY, velocity, paddleX, paddleY) => ({ ballX, ballY, velocity, paddleX, paddleY })
    )
      .map(({ velocity, ballX, ballY, paddleX, paddleY }) => ({
        velocity,

        hit:
          (ballX >= paddleX) &&
          (ballX <= (paddleX + PADDLE_WIDTH)) &&
          (ballY <= (paddleY + PADDLE_HEIGHT)) &&
          (ballY >= (paddleY + PADDLE_HEIGHT - (PADDLE_HEIGHT / 2)))
      }))
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .map(({ velocity }) => -velocity)
      .map(speedUp)
      .selectMany(modelState.set('ball', 'velocity', 1)),

    // paddle top ai
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('paddleTop', 'x'),
      (ballX, paddleX) => ({ ballX, paddleX })
    )
      .takeUntil(playerTwoMoveRight.merge(playerTwoMoveLeft))
      .map(({ ballX, paddleX }) => (
        ((ballX + (BALL_SIZE / 2)) - (paddleX + (PADDLE_WIDTH / 2))) > 0 ?
          Math.min(paddleX + 2, WIDTH - COURT_BUFFER - PADDLE_BUFFER - PADDLE_WIDTH) :
          Math.max(paddleX - 2, COURT_BUFFER + PADDLE_BUFFER)
      ))
      .selectMany(modelState.set('paddleTop', 'x')),

    // paddle bottom ai
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('paddleBottom', 'x'),
      (ballX, paddleX) => ({ ballX, paddleX })
    )
      .takeUntil(playerOneMoveRight.merge(playerOneMoveLeft))
      .map(({ ballX, paddleX }) => (
        ((ballX + (BALL_SIZE / 2)) - (paddleX + (PADDLE_WIDTH / 2))) > 0 ?
          Math.min(paddleX + 2, WIDTH - COURT_BUFFER - PADDLE_BUFFER - PADDLE_WIDTH) :
          Math.max(paddleX - 2, COURT_BUFFER + PADDLE_BUFFER)
      ))
      .selectMany(modelState.set('paddleBottom', 'x'))
  )
);


export default createContainer({ init, view, actions, update });
