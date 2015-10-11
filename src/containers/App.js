import Rx from 'rx';
import createContainer from '../core/container';

import { COURT_WIDTH, COURT_HEIGHT, BALL_SIZE, PADDLE_WIDTH, PADDLE_BUFFER } from '../constants';

import * as Surface from '../components/Surface';
import * as Court from '../components/Court';
import * as Ball from '../components/Ball';
import * as Paddle from '../components/Paddle';


const init = () => ({
  ball: Ball.init((COURT_WIDTH / 2) - (BALL_SIZE / 2), (COURT_HEIGHT / 2) - (BALL_SIZE / 2)),

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
      .selectMany(modelState.set('paddleTop', 'x'))
  )
);


export default createContainer({ init, view, actions, update });
