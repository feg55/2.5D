(() => {

      const playerRadius = 0.2; // допустим, чуть меньше половины размера клетки

      const canvas = document.getElementById("game");
      const ctx = canvas.getContext("2d");
      const screenWidth = canvas.width;
      const screenHeight = canvas.height;

      // Карта лабиринта
      const map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,1,1,0,1,1,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,1,1,0,1,1,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ];

      // Начальные координаты и направление игрока
      let posX = 3.5;
      let posY = 3.5;
      let dirX = -1;
      let dirY = 0;
      let planeX = 0;
      let planeY = 0.66;

      // Управление клавишами
      const keys = {};
      document.addEventListener("keydown", e => keys[e.code] = true);
      document.addEventListener("keyup", e => keys[e.code] = false);

      // Настройки текстур
      const textureSize = 256;
      const textures = [];
      const textureSrcs = ["textures/wall.png", "textures/sky.png"]; // Укажите путь к вашей текстуре

      let texturesLoaded = 0;
      function loadTextures(callback) {
        textureSrcs.forEach((src, i) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            textures[i] = img;
            texturesLoaded++;
            if (texturesLoaded === textureSrcs.length) callback();
          };
          img.onerror = () => console.error("Не удалось загрузить текстуру:", src);
        });
      }

      // Обновление положения игрока
      function canMoveTo(x, y) {
  // Проверяем 4 точки вокруг позиции с отступом playerRadius
  // Проверяем, что в пределах свободного пространства (0)
  // Чтобы избежать застревания в углах, делаем для всех четырёх углов циркуля.
  const checkPoints = [
    [x + playerRadius, y + playerRadius],
    [x + playerRadius, y - playerRadius],
    [x - playerRadius, y + playerRadius],
    [x - playerRadius, y - playerRadius],
  ];

  for (const [cx, cy] of checkPoints) {
    const mapX = Math.floor(cx);
    const mapY = Math.floor(cy);
    if (map[mapY] === undefined || map[mapY][mapX] === undefined || map[mapY][mapX] !== 0) {
      return false; // столкновение со стеной
    }
  }
  return true; // можно двигаться
}

function update(dt) {
  const moveSpeed = dt * 8;
  const rotSpeed = dt * 4;

  let newX = posX;
  let newY = posY;

  if (keys["ArrowUp"]) {
    const testX = posX + dirX * moveSpeed;
    const testY = posY + dirY * moveSpeed;
    if (canMoveTo(testX, posY)) {
      newX = testX;
    }
    if (canMoveTo(posX, testY)) {
      newY = testY;
    }
  }
  if (keys["ArrowDown"]) {
    const testX = posX - dirX * moveSpeed;
    const testY = posY - dirY * moveSpeed;
    if (canMoveTo(testX, posY)) {
      newX = testX;
    }
    if (canMoveTo(posX, testY)) {
      newY = testY;
    }
  }

  // Обновляем позицию после проверки коллизий
  posX = newX;
  posY = newY;

  if (keys["ArrowRight"]) {
    const oldDirX = dirX;
    dirX = dirX * Math.cos(-rotSpeed) - dirY * Math.sin(-rotSpeed);
    dirY = oldDirX * Math.sin(-rotSpeed) + dirY * Math.cos(-rotSpeed);

    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed);
    planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed);
  }
  if (keys["ArrowLeft"]) {
    const oldDirX = dirX;
    dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
    dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);

    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
    planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);
  }
}


      // Отрисовка сцены
      function draw() {
        // Небо
            // Вычисляем угол игрока на основе вектора направления (dirX, dirY)
            // atan2 дает значение в диапазоне [-PI, PI], нормализуем в [0, 2PI]
            let angle = Math.atan2(dirY, dirX);
            if (angle < 0) angle += Math.PI * 2;
            // Рассчитываем смещение по X для текстуры неба в зависимости от угла
            // Инвертируем смещение, чтобы текстура сдвигалась в противоположную сторону поворота
            const speedMultiplier = 3;
            const skyOffsetX = (1 - (((angle * speedMultiplier) % (Math.PI * 2)) / (Math.PI * 2))) * textures[1].width;
            const skyHeight = screenHeight / 2;
            // Рисуем небо с учетом смещения и обеспечиваем бесшовное поведение, рисуя два куска текстуры
            let sx1 = skyOffsetX;
            let width1 = textures[1].width - sx1;
            width1 = Math.min(width1, screenWidth);
            ctx.drawImage(
              textures[1],
              sx1, 0,
              width1, textures[1].height,
              0, 0,
              width1 * screenWidth / textures[1].width, skyHeight
            );
            const width2 = screenWidth - (width1 * screenWidth / textures[1].width);
            if (width2 > 0) {
              ctx.drawImage(
                textures[1],
                0, 0,
                width2 * textures[1].width / screenWidth, textures[1].height,
                width1 * screenWidth / textures[1].width, 0,
                width2, skyHeight
              );
            }
        // Пол
        ctx.fillStyle = "#747474";
        ctx.fillRect(0, screenHeight / 2, screenWidth, screenHeight / 2);

        // Цикл по каждому столбцу экрана
        for (let x = 0; x < screenWidth; x++) {
          const cameraX = 2 * x / screenWidth - 1;
          const rayDirX = dirX + planeX * cameraX;
          const rayDirY = dirY + planeY * cameraX;

          let mapX = Math.floor(posX);
          let mapY = Math.floor(posY);

          const deltaDistX = Math.abs(1 / rayDirX);
          const deltaDistY = Math.abs(1 / rayDirY);

          let sideDistX, sideDistY;
          let stepX, stepY;

          let hit = 0;
          let side;

          if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (posX - mapX) * deltaDistX;
          } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - posX) * deltaDistX;
          }

          if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (posY - mapY) * deltaDistY;
          } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - posY) * deltaDistY;
          }

          // Поиск столкновения с стеной
          while (hit === 0) {
            if (sideDistX < sideDistY) {
              sideDistX += deltaDistX;
              mapX += stepX;
              side = 0;
            } else {
              sideDistY += deltaDistY;
              mapY += stepY;
              side = 1;
            }
            if (map[mapY] && map[mapY][mapX] > 0) hit = 1;
          }

          // Установка минимального расстояния до стены
          const minDist = 0.1; // Можно увеличить до 0.3 или 0.4
          const maxLineHeight = screenHeight * 4;
          let perpWallDist;
          if (side === 0)
            perpWallDist = Math.max(minDist, (mapX - posX + (1 - stepX) / 2) / rayDirX);
          else
            perpWallDist = Math.max(minDist, (mapY - posY + (1 - stepY) / 2) / rayDirY);

          // Вычисление высоты стены
          const lineHeight = Math.min(maxLineHeight, Math.floor(screenHeight / perpWallDist));
          const drawStart = Math.max(0, Math.floor(screenHeight / 2 - lineHeight / 2));
          const drawEnd = Math.min(screenHeight - 1, Math.floor(screenHeight / 2 + lineHeight / 2));

          // Координата столкновения с текстурой
          let wallX;
          if (side === 0)
            wallX = posY + perpWallDist * rayDirY;
          else
            wallX = posX + perpWallDist * rayDirX;
          wallX -= Math.floor(wallX);

          // X-координата на текстуре
          let texX = Math.floor(wallX * textureSize);
          if (side === 0 && rayDirX > 0) texX = textureSize - texX - 1;
          if (side === 1 && rayDirY < 0) texX = textureSize - texX - 1;
          texX = Math.max(0, Math.min(texX, textureSize - 1));

          const texNum = map[mapY][mapX] - 1;

          // Эффект затемнения по расстоянию
          const shade = Math.max(0.3, 1 - perpWallDist / 200);
          ctx.globalAlpha = shade;

          // Оптимизированная отрисовка текстуры
          const wallTop = screenHeight / 2 - lineHeight / 2;
          let sy = (drawStart - wallTop) / lineHeight * textureSize;
          if (sy < 0) sy = 0;
          let texVisibleHeight = (drawEnd - drawStart + 1) * (textureSize / lineHeight);
          if (sy + texVisibleHeight > textureSize) texVisibleHeight = textureSize - sy;

          ctx.drawImage(
            textures[texNum],
            texX, sy, 1, texVisibleHeight,
            x, drawStart, 1, drawEnd - drawStart + 1
          );

          ctx.globalAlpha = 1;
        }
      }

      // Игровой цикл
      let lastTime = 0;
      function loop(time) {
        if (!lastTime) lastTime = time;
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        update(dt);
        draw();

        requestAnimationFrame(loop);
      }

      // Запуск после загрузки текстур
      loadTextures(() => {
        requestAnimationFrame(loop);
      });
    })();