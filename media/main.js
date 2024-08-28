(function () {
  const monster = document.querySelector('#monster');
  const healthIndicator = document.querySelector('.health-indicator');

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'updateMonsterStyle':
        updateMonster(message.value);
        break;
      case 'changeMonster':
        changeMoster(message.value);
        break;
      case 'updateMonsterLife':
        updateMonsterLife(message.value);
        break;
    }
  });

  function updateMonster(textLength) {
    if (monster) {
      if (textLength > 0) {
        // Ativa o efeito de balancear e mudar a cor
        monster.style.animation = 'shake 0.3s ease-in-out';
        monster.style.filter = 'grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(0.8)';

        setTimeout(() => {
          monster.style.animation = 'none';
          monster.style.filter = 'none';
        }, 600);
      } else {
        // Remove o efeito imediatamente se não houver texto
        monster.style.animation = 'none';
        monster.style.filter = 'none';
      }
    }
  }

  function changeMoster(src) {
      if (monster) {
        monster.src = src;
    } else {
        console.error('Elemento de imagem não encontrado');
    }
  }

  function updateMonsterLife(lifePoints) {
    let maxLife = 30;
    let percentLif = (lifePoints / maxLife) *100;

    healthIndicator.style.width = percentLif+'%';
  }

})();
