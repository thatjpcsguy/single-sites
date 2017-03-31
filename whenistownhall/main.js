(function () {
  function getTimeToTownHall() {
    var friday = moment('13:00', 'HH:mm').day('Friday');

    if (friday < moment()) {
      // Return next Friday if we've passed the current Friday
      return friday.add(7, 'd');
    }

    return friday;
  }

  // var timeToLive = moment('18:00', 'HH:mm');
  // var timeToLive = moment().add(15, 's');
  // var timeToLive = moment().add(24, 'h').add(5, 's');
  var timeToLive = getTimeToTownHall();
  var emphasizeBufferTime = moment(10000, 'x');
  var doubleEmphasizeBufferTime = moment(5000, 'x');
  var animationBufferTime = moment(800, 'x');
  var countdownEl = document.getElementById('countdown');
  var pageEl = document.getElementById('page');
  var backdropEl = document.getElementById('backdrop');
  var headerEl = document.getElementById('header');
  var footerEl = document.getElementById('footer');

  // Keyboard states
  var isPaused = false;

  if (!countdownEl || !backdropEl || !pageEl || !headerEl || !footerEl) {
    return;
  }

  function setEmphasizeOnCountdown() {
    countdownEl.classList.add('is-emphasized');
  }

  function hideHeader() {
    headerEl.classList.add('is-hidden');
  }

  function setDoubleEmphasizeOnCountdown() {
    countdownEl.classList.add('is-double-emphasized');
  }

  function animateCountdownEnding() {
    pageEl.classList.add('is-finished');
  }

  function setCountdownInWordsMode() {
    countdownEl.classList.add('is-words');
    headerEl.classList.add('is-countdown-in-words-mode');
  }

  function setCountdownInTimerMode() {
    countdownEl.classList.remove('is-words');
    headerEl.classList.remove('is-countdown-in-words-mode');
  }

  function cleanupAnime() {
    anime.list.forEach(function (animation) {
      animation.pause();
    });
  }

  function loopCountdownUpdate() {
    return requestAnimationFrame(function () {
      if (isPaused) {
        return loopCountdownUpdate();
      }

      var timeLeft = updateTime(countdownEl);
      if (timeLeft > moment(0, 'x')) {
        loopCountdownUpdate();
      }

      if (timeLeft.date() > 1) {
        setCountdownInWordsMode();
      } else {
        setCountdownInTimerMode();
      }

      if (timeLeft <= animationBufferTime) {
        // Start doing the outro animation when countdown reaches the
        // animation buffer time.
        animateCountdownEnding();
        cleanupAnime();
      }

      if (timeLeft <= emphasizeBufferTime) {
        setEmphasizeOnCountdown();
        hideHeader();
      }

      if (timeLeft <= doubleEmphasizeBufferTime) {
        setDoubleEmphasizeOnCountdown();
      }
    });
  }

  function calculateTimeToLive(timeLeft) {
    var currentTime = moment();
    if (currentTime > timeLeft) {
      return moment(0, 'x').utc();
    }

    return moment(timeLeft.diff(currentTime)).utc();
  }

  function generateCountdownDisplay(time) {
    if (time.date() > 1) {
      var timeObject = time.toObject();
      var formatString = `${timeObject.date - 1} ${timeObject.date === 1 ? 'day' : 'days'} \
      ${timeObject.hours} ${timeObject.hours === 1 ? 'hour' : 'hours'} \
      ${timeObject.minutes} ${timeObject.minutes === 1 ? 'minute' : 'minutes'} \
      ${timeObject.seconds} ${timeObject.seconds === 1 ? 'second' : 'seconds'}`;
      return formatString;
    }

    if (time.hour() === 0) {
      return time.format('mm:ss:SSS');
    }

    return time.format('HH:mm:ss');
  }

  function updateTime(element) {
    var timeLeft = calculateTimeToLive(timeToLive);
    var countdownText = generateCountdownDisplay(timeLeft);

    element.textContent = countdownText;
    return timeLeft;
  }

  loopCountdownUpdate();

  /**
   * Keyboard controls
   */
  function toggleCountdownPause() {
    isPaused = !isPaused;
  }

  keyboardJS.bind('ctrl + p', toggleCountdownPause);

  /**
   * Activate page footer when mouse movement is detected.
   */
  function activateFooter() {
    footerEl.classList.add('is-active');
  }

  function deactivateFooter() {
    footer.classList.remove('is-active');
  }

  var mouseInactivityTimeout;
  document.body.addEventListener('mousemove', function () {
    activateFooter();
    clearTimeout(mouseInactivityTimeout);

    mouseInactivityTimeout = setTimeout(function () {
      deactivateFooter();
    }, 5000);
  });

  /**
   * Animations!
   */
  function callAnime(shape) {
    return anime({
      targets: shape,
      opacity: [0, 0.5, 0],
      direction: 'alternate',
      easing: 'linear',
      loop: true,
      translateX: function () { return anime.random(-100, 100); },
      translateY: function () { return anime.random(-100, 100); },
      delay: function () { return anime.random(0, 50000); },
      duration: function () { return anime.random(3000, 20000); },
      complete: function () {
        var newShape = generateBackdropShape();
        backdropEl.appendChild(newShape);
        return callAnime(newShape);
      }
    });
  }

  function randomizeShapeProperties() {
    var randomNumber = anime.random(0, 1000);
    var shape;
    var size;
    var viewBox;

    if (randomNumber % 3 === 0) {
      shape = 'SideTriangle';
      viewBox = '0 0 90 90';
    } else if (randomNumber % 3 === 1) {
      shape = 'DownTriangle'
      viewBox = '0 0 90 45';
    } else {
      shape = 'Square';
      viewBox = '0 0 90 90';
    }

    if (randomNumber % 4 === 2) {
      size = 'xsmall';
    } else if (randomNumber % 4 === 3) {
      size = 'small'
    } else {
      size = null;
    }

    return {
      shape,
      size,
      viewBox
    };
  }

  function generateSvgContents(shape) {
    if (shape === 'DownTriangle') {
      return `<polygon points="0 0 90 0 45 45"></polygon>`;
    }

    if (shape === 'SideTriangle') {
      return `<polygon points="0 90 90 90 0 0"></polygon>`;
    }

    if (shape === 'Square') {
      return `<polygon points="0 0 0 90 90 90 90 0"></polygon>`;
    }
  }

  function generateBackdropShape() {
    var createdElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var shapeProperty = randomizeShapeProperties();
    createdElement.classList.add('Shape');
    createdElement.classList.add(shapeProperty.shape);
    createdElement.setAttribute('data-shape', shapeProperty.shape);
    createdElement.setAttribute('viewBox', shapeProperty.viewBox);

    if (shapeProperty.size) {
      createdElement.classList.add(`${shapeProperty.shape}--${shapeProperty.size}`);
    }

    createdElement.innerHTML = generateSvgContents(shapeProperty.shape);
    createdElement.style.top = anime.random(0, 100) + 'vh';
    createdElement.style.left = anime.random(0, 100) + 'vw';

    return createdElement;
  }

  for (var i = 0; i < 200; i++) {
    var createdElement = generateBackdropShape();
    backdropEl.appendChild(createdElement);
    callAnime(createdElement);
  }
}());
