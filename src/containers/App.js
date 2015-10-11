import Rx from 'rx';
import createContainer from '../core/container';

import { COURT_WIDTH, COURT_HEIGHT, COURT_BUFFER, BALL_SIZE, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_BUFFER } from '../constants';

import * as Surface from '../components/Surface';
import * as Court from '../components/Court';
import * as Ball from '../components/Ball';
import * as Paddle from '../components/Paddle';


const BALL_CENTER = [
  (COURT_WIDTH / 2) - (BALL_SIZE / 2),
  (COURT_HEIGHT / 2) - (BALL_SIZE / 2)
];


const init = () => ({
  ball: Ball.init(BALL_CENTER[0], BALL_CENTER[1], [ 2, 2 ]),

  paddleTop: Paddle.init('top', (COURT_WIDTH / 2) - (PADDLE_WIDTH / 2)),

  paddleBottom: Paddle.init('bottom', (COURT_WIDTH / 2) - (PADDLE_WIDTH / 2))
});


const onKeyboard = Rx.Observable.create((observer) => {
  document.addEventListener('keydown', (e) => observer.onNext({ code: e.which, pressed: true }));
  document.addEventListener('keyup', (e) => observer.onNext({ code: e.which, pressed: false }));
});

const onTick = Rx.Observable.create((observer) => {
  let af;

  const tick = () => {
    af = requestAnimationFrame(() => {
      if (af !== null) {
        observer.onNext(tick());
      }
    });
  };

  tick();

  return () => {
    cancelAnimationFrame(af);
    af = null;
  };
});


const actions = () => ({
  playerOneMoveRight: onKeyboard.filter(({ code }) => code === 39)
    .map((x) => x.pressed)
    .distinctUntilChanged()
    .startWith(false),

  playerOneMoveLeft: onKeyboard.filter(({ code }) => code === 37)
    .map((x) => x.pressed)
    .distinctUntilChanged()
    .startWith(false),

  playerTwoMoveRight: onKeyboard.filter(({ code }) => code === 68)
    .map((x) => x.pressed)
    .distinctUntilChanged()
    .startWith(false),

  playerTwoMoveLeft: onKeyboard.filter(({ code }) => code === 65)
    .map((x) => x.pressed)
    .distinctUntilChanged()
    .startWith(false),

  tick: onTick.timestamp()
});


const view = ({ model = init() }) => (
  Surface.view({},
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
      .map(({ x }) => Math.min(x + 5, COURT_WIDTH - PADDLE_WIDTH - PADDLE_BUFFER))
      .selectMany(modelState.set('paddleBottom', 'x')),

    // move paddle bottom left
    Rx.Observable.combineLatest(
      modelState.observe('paddleBottom', 'x'),
      playerOneMoveLeft,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.max(x - 5, 0))
      .selectMany(modelState.set('paddleBottom', 'x')),

    // move paddle top right
    Rx.Observable.combineLatest(
      modelState.observe('paddleTop', 'x'),
      playerTwoMoveRight,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.min(x + 5, COURT_WIDTH - PADDLE_WIDTH - PADDLE_BUFFER))
      .selectMany(modelState.set('paddleTop', 'x')),

    // move paddle top left
    Rx.Observable.combineLatest(
      modelState.observe('paddleTop', 'x'),
      playerTwoMoveLeft,
      (x, move) => ({ x, move })
    )
      .filter(({ move }) => !!move)
      .map(({ x }) => Math.max(x - 5, 0))
      .selectMany(modelState.set('paddleTop', 'x')),

    // move ball x
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x'),
      modelState.observe('ball', 'velocity', 0),
      (x, velocity) => ({ x, velocity })
    )
      // .filter(({ velocity }) => !!velocity)
      .map(({ x, velocity }) => x + velocity)
      .selectMany(modelState.set('ball', 'x')),

    // move ball y
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y'),
      modelState.observe('ball', 'velocity', 1),
      (y, velocity) => ({ y, velocity })
    )
      // .filter(({ velocity }) => !!velocity)
      .map(({ y, velocity }) => y + velocity)
      .selectMany(modelState.set('ball', 'y')),

    // ball hit right wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x').map((x) => x >= COURT_WIDTH - BALL_SIZE),
      modelState.observe('ball', 'velocity', 0),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity }) => -velocity)
      .selectMany(modelState.set('ball', 'velocity', 0)),

    // ball hit left wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'x').map((x) => x <= 0),
      modelState.observe('ball', 'velocity', 0),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .map(({ velocity }) => -velocity)
      .selectMany(modelState.set('ball', 'velocity', 0)),

    // ball hit bottom wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y').map((y) => y >= COURT_HEIGHT - BALL_SIZE),
      modelState.observe('ball', 'velocity', 1),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity }) => -velocity)
      .selectMany((velocity) =>
        Rx.Observable.combineLatest(
          modelState.set('ball', 'velocity', 1)(velocity),
          modelState.set('ball', 'x')(BALL_CENTER[0]),
          modelState.set('ball', 'y')(BALL_CENTER[1])
        )
      ),

    // ball hit top wall
    Rx.Observable.combineLatest(
      modelState.observe('ball', 'y').map((y) => y <= 0),
      modelState.observe('ball', 'velocity', 1),
      (hit, velocity) => ({ hit, velocity })
    )
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .map(({ velocity }) => -velocity)
      .selectMany((velocity) =>
        Rx.Observable.combineLatest(
          modelState.set('ball', 'velocity', 1)(velocity),
          modelState.set('ball', 'x')(BALL_CENTER[0]),
          modelState.set('ball', 'y')(BALL_CENTER[1])
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
          ((ballY + BALL_SIZE) >= (paddleY - COURT_BUFFER)) &&
          ((ballY + BALL_SIZE) <= (paddleY - COURT_BUFFER + (PADDLE_HEIGHT / 2)))
      }))
      .filter(({ hit, velocity }) => !!hit && velocity > 0)
      .map(({ velocity }) => -velocity)
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
          (ballY <= (paddleY - COURT_BUFFER + PADDLE_HEIGHT)) &&
          (ballY >= (paddleY - COURT_BUFFER + PADDLE_HEIGHT - (PADDLE_HEIGHT / 2)))
      }))
      .filter(({ hit, velocity }) => !!hit && velocity < 0)
      .map(({ velocity }) => -velocity)
      .selectMany(modelState.set('ball', 'velocity', 1))
  )
);


export default createContainer({ init, view, actions, update });
