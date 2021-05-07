import { timer, interval, fromEvent } from 'rxjs';
import { throttle } from 'rxjs/operators';

const statusSpan: HTMLSpanElement | null  = document.querySelector('#status');
const loadingSpan: HTMLSpanElement | null  = document.querySelector('#loading');
const progressDiv: HTMLDivElement | null = document.querySelector('#progress');

let currentProgress: number = 0;
const stepOnClick: number = 5;
const step: number = 1;

const $tik = interval(1500);
const $click = fromEvent(document.body, 'click');
const $debouncedClick = $click.pipe(
  throttle(() => timer(1000))
);

let clickSubscriber = $debouncedClick.subscribe(speedUp);
let tikSubscriber = $tik.subscribe(makeStep);
let restartSubscriber: any = null;

function makeStep(): void {
  if (currentProgress < 100) {
    currentProgress += step;
    updateProgressView();
  } else {
    addRestartButton();
  }
}

function speedUp(event: any): void {
  if (event.target.tagName === 'BUTTON') {
    return;
  }

  if (progressDiv && currentProgress <= 100 - stepOnClick) {
    currentProgress += stepOnClick;
    statusSpan.textContent = 'Clicked!';
  } else if (progressDiv) {
    currentProgress = 100;
    updateProgressView();
  }
}

function updateProgressView(): void {
  statusSpan.textContent = `${currentProgress}%`;
  progressDiv.style.width = `${currentProgress}%`;
}

function addRestartButton(): void {
  loadingSpan.innerHTML = `<button id="restart">Restart</button>`;
  statusSpan.textContent = 'Completed!';
  tikSubscriber.unsubscribe();

  const restartBtn = document.querySelector("#restart");
  const $restart = fromEvent(restartBtn, 'click');

  restartSubscriber = $restart.subscribe(() => {
    restartProgress();
  })
}

function restartProgress() {
  restartSubscriber.unsubscribe();
  currentProgress = 0;

  statusSpan.textContent = '0%';
  loadingSpan.innerHTML = 'Click to speed up!';

  updateProgressView();
  tikSubscriber = $tik.subscribe(makeStep);
}