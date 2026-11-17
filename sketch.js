let bgImg; // 儲存背景圖片
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let characterX; // 儲存角色一目前的水平中心位置
let bgX = 0; // 記錄背景捲動的水平位移量
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效
const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

function preload() { // 在畫布建立前載入圖片
  bgImg = loadImage("bg/0.jpg"); // 載入 bg/0.jpg 背景圖片
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格或圖片的中心點
  characterX = width / 2; // 將角色初始位置設在畫布正中央
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 使用天空藍作為預備底色

  // 計算三張並排背景縮放後的寬度與高度（以填滿畫布高度為基準）
  let bgDrawHeight = height;
  let bgDrawWidth = bgImg.width * (height / bgImg.height);

  // 取得總捲動範圍限制（三張圖片串接，以中間那張為基準，左右各有一張）
  let maxBgX = bgDrawWidth;   // 往右捲動極限（顯示左側背景）
  let minBgX = -bgDrawWidth;  // 往左捲動極限（顯示右側背景）

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 設定是否走路
  const movementStep = constrain(width * 0.004, 2, 8); // 移動速度

  // 高度固定為畫布高度的 1/3，並依精靈圖比例計算寬度
  const targetHeight = height / 3; 
  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite;
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite;
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth;
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight;

  const activeScale = targetHeight / activeFrameHeight;
  const activeWidth = activeFrameWidth * activeScale; 
  const activeHeight = targetHeight; 

  if (movingRight) {
    isWalking = true;
    facingDirection = 1;
    // 如果背景還沒捲動到最右側（minBgX），則背景往左移
    if (bgX > minBgX) {
      bgX -= movementStep;
      if (bgX < minBgX) bgX = minBgX;
    } else {
      // 背景已到底，角色開始往右移動
      characterX += movementStep;
    }
  } else if (movingLeft) {
    isWalking = true;
    facingDirection = -1;
    // 如果背景還沒捲動到最左側（maxBgX），則背景往右移
    if (bgX < maxBgX) {
      bgX += movementStep;
      if (bgX > maxBgX) bgX = maxBgX;
    } else {
      // 背景已到底，角色開始往左移動
      characterX -= movementStep;
    }
  }

  // 限制角色不超出畫布左右邊界
  characterX = constrain(characterX, activeWidth / 2, width - activeWidth / 2);

  // 繪製三張串接的背景圖片（左、中、右）
  imageMode(CORNER);
  image(bgImg, (width - bgDrawWidth) / 2 + bgX - bgDrawWidth, 0, bgDrawWidth, height); // 左側背景
  image(bgImg, (width - bgDrawWidth) / 2 + bgX, 0, bgDrawWidth, height);             // 中間背景
  image(bgImg, (width - bgDrawWidth) / 2 + bgX + bgDrawWidth, 0, bgDrawWidth, height); // 右側背景
  imageMode(CENTER); // 恢復中心點繪製模式

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) {
    isCasting = false;
    activeEffects.push({ x: characterX + magicDirection * activeWidth / 2, y: height - activeHeight * 0.58, direction: magicDirection });
  }

  const elapsedMagicFrames = frameCount - magicStartFrame;
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount;
  const sourceX = frameIndex * activeFrameWidth;
  const characterY = height - activeHeight / 2;

  push();
  translate(characterX, characterY);
  scale(isCasting ? magicDirection : facingDirection, 1);
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight);
  pop();

  const effectScale = targetHeight / frameHeight; 
  const effectWidth = effectFrameWidth * effectScale; 
  const effectHeight = effectFrameHeight * effectScale; 
  const effectSpeed = max(6, width * 0.008); 

  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) {
    const effect = activeEffects[effectIndex];
    effect.x += effect.direction * effectSpeed; 
    if (effect.x > width || effect.x < 0) { 
      activeEffects.splice(effectIndex, 1); 
      continue; 
    } 
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; 
    push(); 
    translate(effect.x, effect.y); 
    scale(effect.direction, 1); 
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); 
    pop(); 
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }
  if (keyCode === LEFT_ARROW) {
    isWalking = true;
    facingDirection = -1;
    return false;
  }
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }
    spaceIsDown = true;
    return false;
  }
}

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  characterX = constrain(characterX, 1, width - 1);
}