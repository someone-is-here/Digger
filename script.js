const timer = 500;
let timerStart;
let level = undefined;
let lives = undefined;
let timerId = undefined;
let timer2 = undefined;
width = 10;
height = 10;

diamondArray = [];
trapsArray = []; 
playerPos = 0;
visited = [];
badGuys = [];

let key = true;
let gameOver = false;
let isOut = undefined;
let isModalOpen = false;

const windowInnerWidth = (+window.innerWidth);
const windowInnerHeight = (+window.innerHeight) - parseInt(window.getComputedStyle(document.getElementById("header")).height);

function GenField() {
  document.getElementById("header").style.paddingLeft = ((windowInnerWidth) / 6) + "px";
  if(windowInnerWidth >= windowInnerHeight){
    document.getElementById("fieldContainer").style.height = (+windowInnerHeight) + "px";
    document.getElementById("fieldContainer").style.width = (+windowInnerHeight) + "px";
  } else {
    document.getElementById("fieldContainer").style.height = (+windowInnerWidth) + "px";
    document.getElementById("fieldContainer").style.width = (+windowInnerWidth) + "px";
  }
  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      div = document.createElement('div');
      div.className = "divField";
      SetParametrs(div);
      window.fieldContainer.appendChild(div);
    }
    window.fieldContainer.appendChild(document.createElement('br'));
  }
}

function SetDiamonds() {
  num = level + 5;
  for (i = 0; i < num; i++) {
    pos = Math.floor(Math.random() * width * height);
    while (diamondArray.includes(pos) || pos === 0) {
      pos = Math.floor(Math.random() * width * height);
    }
    image = document.createElement('img');
    image.src = 'diamond.png';
    image.className = 'imageClass';
    document.getElementsByClassName('divField')[pos].appendChild(image);
    SetParametrs(image);
    diamondArray.push(pos);
  }
}

window.addEventListener("load", function(){
  cookie = document.cookie;
  if(cookie.includes("Clicked")){
    cookie = cookie.slice(cookie.indexOf("=") + 1);
  }
  AddEventListenersAndEvents();  
  if(cookie == "savedGame"){
    let res = JSON.parse(localStorage.getItem('Save'));
    lives = res.lives;
    level = res.level;
    for(i = lives; i < 3;i++){
      window.lives.removeChild(window.lives.firstElementChild);
    }
    document.getElementById('level').innerHTML = level;
    document.getElementById('score').textContent = res.score;
    NewLevelCreate(false);
    timerId = setInterval(function () {
      MoveBadGuys();
    }, 1000);
  } else {
    level = Number(window.level.innerHTML);
    lives = 3;
    GenField();
    SetDiamonds();
    SetPlayer(0);
    SetTraps();
    SetBadGuys();
    timer2 = undefined;
    timerId = setInterval(function () {
      MoveBadGuys();
    }, 1000);
  }
});

function SetPlayer(pos) {
  if(!document.getElementsByClassName('mirror')[0]){
    div = document.getElementsByClassName('divField')[pos];
    div.style.background = "url('wall.png')";
    div.style.backgroundSize = '100%';
    img = document.createElement('img');
    img.src = 'cat.gif';
    img.style.backgroundSize = 'cover';
    img.className = 'imageClass mirror right';
    SetParametrs(img);
    div.appendChild(img);
  }
}

function movePlayer(key, isDraw = true) {
  if(!isModalOpen){
  switch (key) {
    case 87:  /*Up*/
    case 38:
      if (playerPos <= 9 || trapsArray.includes(playerPos - 10)) {
        return false;
      } else {
        playerImage = document.getElementsByClassName('mirror')[0];
        if(playerImage){
          playerImage.parentElement.removeChild(playerImage);
        }
        playerPos -= 10;
        if(isDraw){
        CheckHasDiamond(playerPos);
        CheckHitTheEnemy(playerPos);
        div = document.getElementsByClassName('divField')[playerPos];
        SetNewPlayerSquare(div, 'up');
        }
      }
      break;
    case 83:  /*Down*/
    case 40:
      if (playerPos > 89 || trapsArray.includes(playerPos + 10)) {
        return false;
      } else {
        playerImage = document.getElementsByClassName('mirror')[0];
       if(playerImage){
          playerImage.parentElement.removeChild(playerImage);
        }
        playerPos += 10;
        if(isDraw){
        CheckHasDiamond(playerPos);
        CheckHitTheEnemy(playerPos);
        div = document.getElementsByClassName('divField')[playerPos];
        SetNewPlayerSquare(div,'down');
        }
      }
      break;
    case 37: /*Left*/
    case 65:
      if ((playerPos - 1) < 0 || (playerPos - 1) % 10 == 9 || trapsArray.includes(playerPos - 1)) {
        return false;
      } else {
        playerImage = document.getElementsByClassName('mirror')[0];
        if(playerImage){
          playerImage.parentElement.removeChild(playerImage);
        }
        playerPos--;
        if(isDraw){
        CheckHasDiamond(playerPos);
        CheckHitTheEnemy(playerPos);
        div = document.getElementsByClassName('divField')[playerPos];
        SetNewPlayerSquare(div,'left');
        }
      }
      break;
    case 68: /*Right*/
    case 39:
      if (playerPos + 1 > 99 || (playerPos + 1) % 10 == 0 || trapsArray.includes(playerPos + 1)) {
        return false;
      } else {
        playerImage = document.getElementsByClassName('mirror')[0];
        if(playerImage){
          playerImage.parentElement.removeChild(playerImage);
        }
        playerPos++;
        if(isDraw){
        CheckHasDiamond(playerPos);
        CheckHitTheEnemy(playerPos);
        div = document.getElementsByClassName('divField')[playerPos];
        SetNewPlayerSquare(div,'right');
        }
      }
      break;
    case 27:
      window.modal.style.display = "block";
      isModalOpen = true;
      document.getElementsByTagName('p')[0].innerHTML = "You will be returned to the menu! If you don't want to move press enter.";
      idOut = setTimeout(function(){
        location.href = 'index.html';
      },2500);
      break;
    case 13:
      if(idOut){
        window.modal.style.display = "none";
        isModalOpen = false;
        clearTimeout(idOut);
      }
      break;
  }
  visited.push(playerPos);
  if(isDraw){
    CheckTraps(playerPos);
  }
  }
  return true;
}

function SetNewPlayerSquare(div, def = 'right') {
  div.style.background = "url('wall.png')";
  div.style.backgroundSize = '100%';
  image = document.createElement('img');
  image.src = 'cat.gif';
  image.style.backgroundSize = 'cover';
  switch(def){
    case 'left':
      image.className = 'imageClass mirror left';
      break;
    case 'right':
      image.className = 'imageClass mirror right';
      break;
    case 'down':
      image.className = 'imageClass mirror down';
      break;
    case 'up':
      image.className = 'imageClass mirror up';
      break;
  }
  SetParametrs(image);
  div.appendChild(image);
}

function CheckHasDiamond(pos) {
  if (diamondArray.includes(pos)) {
    div = document.getElementsByClassName('divField')[pos];
    div.removeChild(div.firstChild);
    diamondArray.splice(diamondArray.indexOf(pos), 1);
    score = Number(document.getElementById('score').textContent);
    score += 20;
    document.getElementById('score').textContent = score;
  } 
  if (diamondArray.length == 0) {
    level += 1;
    el = document.getElementById('level').innerHTML;
    document.getElementById('level').innerHTML = level;

    container = window.fieldContainer;
    
    while(container.hasChildNodes()){
     container.removeChild(container.childNodes[0]);
    }
    
    window.modalForSaving.style.display = "block";
    isModalOpen = true;
    NewLevelCreate();
  }
}

function NewLevelCreate(clear = true){
  console.log("New level create");
  diamondArray.length = 0;
  trapsArray.length = 0;
  playerPos = 0;
  visited.length = 0;
  badGuys.length = 0;
  if(clear){
    clearInterval(timerId);
  }
  if(clear && timer2){
    clearInterval(timer2);
  }
  timerId = undefined;
  GenField();
  if(!clear){
    SetPlayer(0);
  }
  SetDiamonds();
  SetTraps();
  SetBadGuys();
}

function SetTraps() {
  num = 6;
  for (i = 0; i < num; i++) {
    pos = Math.floor(Math.random() * (width - 1) * (height - 2) + 10);
    while (diamondArray.includes(pos) || pos === 0 || trapsArray.includes(pos)) {
      pos = Math.floor(Math.random() * (width - 1) * (height - 2) + 10);
    }
    image = document.createElement('img');
    image.src = 'money.png';
    image.className = 'imageClass';
    document.getElementsByClassName('divField')[pos].appendChild(image);
    SetParametrs(image);
    trapsArray.push(pos);
  }
}

function CheckTraps(pos) {
  let flag = false;
  trapPos = -1;
  dead = false;
  enemyIsDead=[];
  forChanging=[];
  for (i = 0; i < trapsArray.length; i++) {
    k = 0;
    search=trapsArray[i];
    trapsArray.splice(trapsArray.indexOf(search), 1);
    while (search + k <= 89) {
      k += 10;
      if (visited.includes(search + k) && !trapsArray.includes(search + k)) {
        flag = true;
        trapPos = search;
        if(playerPos == search + k){
          dead = true;
        }
      }
      else {
        k -= 10;
        break;
      }
    }
    trapsArray.unshift(search);
   if (flag) {
      flag = false;
      forChanging.push([trapPos, k]);
    }
  }
  if (forChanging.length > 0) {
    timer2 = setTimeout(function () {  
      if(key && playerPos != 0){
        for(i = 0; i < forChanging.length; i++){
            for(k = forChanging[i][0]; k <= forChanging[i][0] + forChanging[i][1]; k += 10){
              if(badGuys.includes(k)){
                div = document.getElementsByClassName('divField')[k];
                if(div.hasChildNodes()){
                  div.removeChild(div.firstElementChild);
                }
                badGuys.splice(badGuys.indexOf(k), 1);
              }
            }
        }
        for(i = 0; i < forChanging.length; i++){
          div = document.getElementsByClassName('divField')[forChanging[i][0]];
          if(div && div.hasChildNodes()){
            div.removeChild(div.firstChild);
          }
          image = document.createElement('img');
          image.src = 'money.png';
          image.className = 'imageClass';
          SetParametrs(image);
          document.getElementsByClassName('divField')[forChanging[i][1] + forChanging[i][0]].appendChild(image);
          trapsArray.push(forChanging[i][1] + forChanging[i][0]);
          trapsArray.splice(trapsArray.indexOf(forChanging[i][0]), 1);
        }
        key = false;
        if(dead){
            res = movePlayer(Math.floor(Math.random()*4+37),false);
            while(!res){
              res = movePlayer(Math.floor(Math.random()*4+37),false);
            }        
            RemoveLives();            
        }
      }           
    }, 750);
    key = true;
  }
}

function SetBadGuys() {
  num = Math.floor(level / 2 + 3);
  for (j = 0; j < num; j++) {
    pos = Math.floor(Math.random() * (width - 1) * height);
    while (!CheckToSetBadGuys(pos) || diamondArray.includes(pos) || trapsArray.includes(pos)) {
      pos = Math.floor(Math.random() * (width - 1) * height);
    }
    image = document.createElement('img');
    image.src = 'https://thumbs.gfycat.com/EsteemedDimpledEstuarinecrocodile-size_restricted.gif';
    image.className = 'imageClassEnemy';
    document.getElementsByClassName('divField')[pos].appendChild(image);
    SetParametrs(image);
    badGuys.push(pos);
  }
}

function CheckToSetBadGuys(pos){
  badPosition = [1,-1,10,-10,-9,9,-11,11];
  if(badGuys.includes(pos) ||  pos == playerPos){
    return false;
  }
  for(i=0;i<badPosition.length;i++){
    if(pos == playerPos + badPosition[i]){
      return false;
    }
  }
  return true;
}

function MoveBadGuys() {
  if(!gameOver){
  arrayWithVariants = [-1, -10, 10, 1];
  for (i = 0; i < badGuys.length; i++) {
      if (playerPos % 10 < badGuys[i] % 10) {
        shift = -1;
      } else if (playerPos % 10 > badGuys[i] % 10) {
        shift = 1;
      } else if (playerPos / 10 < badGuys[i] / 10) {
        shift = -10;
      } else {
        shift = 10;
      }
    newPos = shift + badGuys[i];
    counter = 4;
    while (!CheckPosition(shift, badGuys[i]) || trapsArray.includes(newPos) || diamondArray.includes(newPos) || badGuys.includes(newPos)) {
      shift = arrayWithVariants[Math.floor(Math.random() * arrayWithVariants.length)];
      newPos = shift + badGuys[i];
      if(--counter == 0){
        newPos = badGuys[i];
        break;
      }
    }
    div = document.getElementsByClassName('divField')[badGuys[i]];
    if(div.hasChildNodes()){
      div.removeChild(div.firstElementChild);
    }
    image = document.createElement('img');
    image.src = 'https://thumbs.gfycat.com/EsteemedDimpledEstuarinecrocodile-size_restricted.gif';
    image.className = 'imageClassEnemy';
    SetParametrs(image);
    document.getElementsByClassName('divField')[newPos].appendChild(image);
    badGuys.splice(badGuys.indexOf(badGuys[i]), 1);
    badGuys.unshift(newPos);
    if (newPos == playerPos) {
      RemoveLives();
      break;
    }
  }
  }
}

function SetParametrs(image){
  if(windowInnerWidth >= windowInnerHeight){
    image.style.height = (+windowInnerHeight / 10) + "px";
    image.style.width = (+windowInnerHeight / 10) + "px";
  } else {
    image.style.height = (+windowInnerWidth / 10) + "px";
    image.style.width = (+windowInnerWidth / 10) + "px";
  }
}

function CheckPosition(shift, pos) {
  if (shift == -1 && (pos - 1) % 10 == 9) {
    return false;
  }
  if (shift == 1 && (pos + 1) % 10 == 0) {
    return false;
  }
  if (shift == 10 && pos > 89) {
    return false;
  }
  if (shift == -10 && pos < 10) {
    return false;
  }
  return true;
}

function AddEventListenersAndEvents(){  
  document.addEventListener('keydown', function (event) {
    movePlayer(event.keyCode);
  });
  document.getElementsByClassName('close')[0].onclick = function (event) {
    event.target.parentElement.parentElement.style.display = "none";
    isModalOpen = false;
    if(!timerId){
      timerId = setInterval(function () {
        MoveBadGuys();
      }, 1000);
    }
  }
  document.getElementsByClassName('close')[1].onclick = function (event) {
      event.target.parentElement.parentElement.style.display = "none";
      isModalOpen = false;
      if(!timerId){
        timerId = setInterval(function () {
          MoveBadGuys();
        }, 1000);
      }
  }
  window.SaveResult.onclick = function(event){
    SaveInLocalStorageInJson();
    alert("Saved");
  }
}

function RegenerateTraps() {
  SetPlayer(playerPos);
  for (i = 0; i < badGuys.length; i++) {
    div = document.getElementsByClassName('divField')[badGuys[i]];
    if(div.hasChildNodes()){
      div.removeChild(div.firstChild);
    }
  }
  badGuys = [];
  SetBadGuys();
} 

function  CheckHitTheEnemy(playerPos){
  if(badGuys.includes(playerPos)){
    RemoveLives();
  }
}

function RemoveLives(){
  div = document.getElementsByClassName('divField')[playerPos];
  if(div.hasChildNodes()){        
    div.removeChild(div.firstChild);
  }    
  clearInterval(timerId);
  timerId = undefined;
  window.modal.style.display = "block";
  isModalOpen = true;
  RegenerateTraps();
  lives--;
  if (lives > 0) {
    window.lives.removeChild(window.lives.firstElementChild);
  }
  else {
    window.modal.style.display = "block";
    isModalOpen = true;
    document.getElementsByTagName('p')[0].innerHTML = `You Lost!<br>Your score is ${ document.getElementById('score').textContent}!<br>Great result!<br>You will be returned to the menu!`;
    setTimeout(function(){
      location.href = 'index.html';
    },2500);
  }
}

function SaveInLocalStorageInJson(){
  let infoForSaving={
    lives: lives,
    level: level,
    score: score
  }
  jsonFormatString = JSON.stringify(infoForSaving);
  localStorage.setItem('Save', jsonFormatString);
}

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;                                                        
let yDown = null;

function getTouches(evt) {
  return evt.touches;
}                                                     
                                                                         
function handleTouchStart(evt) {
  evt.preventDefault();
  const firstTouch = getTouches(evt)[0];                                      
  xDown = firstTouch.clientX;                                      
  yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
  evt.preventDefault();
  if (!xDown || !yDown) {
    return;
  }

  xUp = evt.touches[0].clientX;                                    
  yUp = evt.touches[0].clientY;

  xDiff = xDown - xUp;
  yDiff = yDown - yUp;
                                                                         
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      movePlayer(65);
    } else {
      movePlayer(68); 
    }                       
  } else {
    if (yDiff > 0) {
      movePlayer(87);
    } else { 
      movePlayer(83);
    }                                                                 
  }
  xDown = null;
  yDown = null;                                             
};
window.onbeforeunload = function(event){
  return;
}