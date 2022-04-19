//本代码主体参考课程录屏中老师给的代码，学习了cookie并实现了本地记录当前难度、难度逐渐升级，实现了大部分函数，部分函数学习了同学开源后的写法
const MAP_SIZE = {width: 10, height: 10}
const BONUS_SCORE = 10
const BONUS_COUNT = 10
const BOMBS_COUNT = 1
let   SATB_COUNT=2
let   time=40

if(localStorage.getItem('SATB_COUNT')>2&&localStorage.getItem('SATB_COUNT')!=null){alert("接受挑战吧！");SATB_COUNT=localStorage.getItem('SATB_COUNT')}
if(localStorage.getItem('time')!=null){time=localStorage.getItem('time');}
//if(!SATB_COUNT){alert(2),SATB_COUNT = 2}

//if(!SATB_COUNT){SATB_COUNT=2,BOMBS_COUNT=2}
//localStorage.setItem(SATB_COUNT, 2);
//localStorage.setItem(BOMBS_COUNT, 2);

const CLOCK_TIME = 10
const CLOCK_COUNT = 2
const IMAGE_RESOURCES = {}
const IMAGES = [
    { name: 'robot', url: './images/zombie.png' },
    { name: 'prize', url: './images/flower.png' },
    { name: 'stab', url: './images/stab.png' },
    { name: 'bombs', url: './images/doom.png' },
    { name: 'clock', url: './images/brain.png' },
  ]
let score = 0;
let position = [0, 0];

  const initMap = (size, BONUS_count, STAB_count, BOMBScount, CLOCK_count) => {
    const map = []
    const bonusRecord = initrecord(size, BONUS_count);
    const stabRecord = initrecord(size, STAB_count);
    const bombsRecord = initrecord(size, BOMBScount);
    const clockRecord = initrecord(size, CLOCK_count);
    for (let row = 0; row < size.width; row++) {
      const rowItem = [];
      for (let col = 0; col < size.height; col++) {//随机奖励8-10
        let score=BONUS_SCORE+Math.floor(Math.random() * 2);
        if (isInRecord([row, col], bonusRecord)){rowItem.push({bonus: score})}
        else if (isInRecord([row, col], stabRecord)){rowItem.push({ stab:10})}
        else if (isInRecord([row, col], bombsRecord)){rowItem.push({bombs: 100}) }
        else if (isInRecord([row, col], clockRecord)){rowItem.push({clock: CLOCK_TIME})
        }
        else {rowItem.push(null)}
      }
      map.push(rowItem)
    }
    return map
  }
  
  const initrecord = (size, count) => {
    const record = [];
    while (record.length < count) {
      const row = Math.floor(Math.random() * size.width);
      const col = Math.floor(Math.random() * size.height);
      if ((row === 0 && col === 0) || isInRecord([row, col], record)) {
        continue;
      }
      record.push([row, col])
    }
    return record
  }
  
  const drawMap = (map) => {
    const mapContainer = document.getElementsByClassName('map')[0];
    mapContainer.innerHTML = ''
    for (let [rowIndex, row] of map.entries()) {
      const rowEl = document.createElement('div')
      rowEl.className = 'row'
      for (let [colIndex, col] of row.entries()) {
        const colEl = document.createElement('div');
        colEl.className = 'cell'
        const isBonusCell = isBonus(col)
        const isStabCell = isStab(col)
        const isBombsCell = isBombs(col)
        const isClockCell = isClock(col)
        const isPersonCell = isEqualVector(position, [rowIndex, colIndex])
        drawCellWithImage(colEl, {map, rowIndex, colIndex,col}, {isBonusCell, isPersonCell, isStabCell, isBombsCell, isClockCell})
        rowEl.appendChild(colEl)
      }
      mapContainer.appendChild(rowEl)
    }
  }
 
  const drawCellWithImage = (container, {map, rowIndex, colIndex,col}, {isBonusCell, isPersonCell, isStabCell, isBombsCell, isClockCell}) => {
    if (isPersonCell) {
      const position = createImageContainer();
      position.appendChild(createImage(IMAGE_RESOURCES.robot))
      container.appendChild(position)
    }
    if (isBonusCell) {
      if (isPersonCell) {
        score += col.bonus;
        map[rowIndex][colIndex] = null;
      } else {
        const bonus = createImageContainer();
        bonus.appendChild(createImage(IMAGE_RESOURCES.prize))
        container.appendChild(bonus)
      }
    }
    if (isStabCell) {
      if (isPersonCell) {//人也踩到了
        score -= col.stab;
        map[rowIndex][colIndex] = null;
      }
      else {
        const stab = createImageContainer();
        stab.appendChild(createImage(IMAGE_RESOURCES.stab))
        container.appendChild(stab)
      }
    }
    if (isBombsCell) {
      if (isPersonCell) {
        map[rowIndex][colIndex] = null;
        alert('踩到炸弹，游戏结束')
        window.location.reload()
        return;
      }
      else {
        const bombs = createImageContainer();
        bombs.appendChild(createImage(IMAGE_RESOURCES.bombs))
        container.appendChild(bombs)
      }
    }
    if (isClockCell) {
      if (isPersonCell) {
        curTime += col.clock;
        map[rowIndex][colIndex] = null;
      }
      else {
        const clock = createImageContainer();
        clock.appendChild(createImage(IMAGE_RESOURCES.clock))
        container.appendChild(clock)
      }
    }
  }
  
  const move = (timer) => (e) => {
    const [y, x] = position
    if (y == 0 && e.code == 'ArrowUp' || y == 9 && e.code == 'ArrowDown' || x == 0 && e.code == 'ArrowLeft' || x ==9 && e.code == 'ArrowRight') {//边界判断
      return;
    }
    else switch(e.code) {
      case 'ArrowRight':
        position = [y, x + 1]
        break;
      case 'ArrowUp':
        position = [y - 1, x]
        break;
      case 'ArrowDown':
        position = [y + 1, x]
        break;
      case 'ArrowLeft':
        position = [y, x - 1]
        break;
      default:
        return;
    }
  
    drawMap(map)
    const scoreEl = document.getElementsByClassName('score')[0];
    scoreEl.innerHTML = `当前分数: ${Math.round(score)}`
    setTimeout(() => {
      if (isBonusEmpty(map)&&score<=80) {
        alert('吃完了，但踩了过多刺，游戏失败！')
        clearInterval(timer);
        window.location.reload()
      }
      else if(isBonusEmpty(map)&&score>80){
        alert('吃完了，完全胜利！')
        
        localStorage.removeItem('SATB_COUNT');
        localStorage.setItem('SATB_COUNT',2*SATB_COUNT);
        if(time>20){
        localStorage.removeItem('time');
        localStorage.setItem('time',time-10);}
        if(localStorage.getItem('SATB_COUNT')>=20){SATB_COUNT=2;alert('这也难不倒你吗，你赢了！');localStorage.removeItem('SATB_COUNT');localStorage.setItem('SATB_COUNT',2);localStorage.removeItem('time');localStorage.setItem('time',40); clearInterval(timer);
        window.location.reload();return}
        alert('难度剧增！！尖刺增加，时间减少！')
        // alert(localStorage.getItem('SATB_COUNT'));
        clearInterval(timer);
        window.location.reload();
      }
    }, 0)
  }
  const startGame = () => {
    hideButton()
    const timerEl = document.getElementsByClassName('timer')[0];
    window.curTime = time;
    timerEl.innerHTML = `TIME: ${curTime}s`
    const scoreEl = document.getElementsByClassName('score')[0];
    scoreEl.innerHTML = `SCORE: ${score}`
    const timer = setInterval(() => {
      if (curTime <= 0) {
        alert('时间耗尽！。')
        clearInterval(timer)
        window.location.reload()
        return;
      }
      curTime--;
      timerEl.innerHTML = `TIME: ${curTime}s`
    }, 1000)
    document.addEventListener('keydown', move(timer))
  }
 
  const isEqualVector = (a, b) => a[0] === b[0] && a[1] === b[1]
  const isInRecord = (pos, record) => record.some(x => isEqualVector(x, pos))
  const isBonus = (item) => item && typeof item.bonus === 'number'
  const isStab = (item) => item && typeof item.stab === 'number'
  const isBombs = (item) => item && typeof item.bombs === 'number'
  const isClock = (item) => item && typeof item.clock === 'number'
  const isPerson = (item) => item && item.position

  const isBonusEmpty = (map) => map.every(row => row.every(col => !isBonus(col)))

  const createImage = (url) => {
    const image = new Image();
    image.src = url;
    return image
  }

  const createImageContainer = () => {
    const container = document.createElement('div');
    container.className = 'image-container'
    return container
  }
  const loadImage = ({name, url}) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;

      image.onload = () => resolve({name, url});
      image.onerror = () => reject(url)
    })
  }
  
  const loadImages = async () => {
    const image = await Promise.all(IMAGES.map(loadImage))
    
    for (let {name, url} of image) {
      IMAGE_RESOURCES[name] = url
    }
  }
  
  const main = async () => {
    //if(SATB_COUNT!=2&&BOMBS_COUNT!=2){
    //SATB_COUNT=localStorage.getItem('SATB_COUNT');
    map = initMap(MAP_SIZE, BONUS_COUNT, SATB_COUNT, BOMBS_COUNT, CLOCK_COUNT)
    console.log(map)
    await loadImages()
    drawMap(map)
  }
  

  function hideButton(){
    document.getElementById("startGame").style.visibility = 'hidden';
  }
  
  main()
