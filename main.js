(() => {
  setTimeout(async () => {
    // ---------- TG WEB APP ----------
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.expand();
    }

    function showBackButton() {
      if (!tg) {
        return;
      }

      tg?.MainButton.setText("Забрать подарок")
        .show()
        .onClick(function () {
          tg.close();
          webviewClose();
        });
    }

    // ---------- Получение переменных пользователя ----------

    const urlParams = new URLSearchParams(window.location.search);
    const clientId = +urlParams.get("id") || 546085190;

    const userVariables = await getUserVariables(clientId);

    let isGetPrize = userVariables ? false : true;

    let { k2_вебинар, k2_лекция, k2_пакет_лекций, k2_гайд, k2_практика, k2_видео_и_гайд} =
      userVariables;
    let availableSpins = userVariables.available_spins_k2;
    let dealSpins = userVariables.deal_spins_k2; 

    // список призов
    const prizes = [
      {
        text: "Вебинар",
        dropChance: +k2_вебинар > 0 ? 20 : 0,
      },
      {
        text: "Лекция",
        dropChance: +k2_лекция > 0 ? 20 : 0,
      },
      {
        text: "Пакет лекций",
        dropChance: +k2_пакет_лекций > 0 ? 20 : 0,
      },
      {
        text: "Гайд",
        dropChance: +k2_гайд > 0 ? 20 : 0,
      },
      {
        text: "Практика",
        dropChance: +k2_практика > 0 ? 20 : 0,
      },
      {
        text: "Видео и Гайд",
        dropChance: +k2_видео_и_гайд > 0 ? 20 : 0,
      },
    ];

    // ---------- DOM элементы ----------
    const phoneElems = document.querySelectorAll(".phone");
    const popupElem = document.querySelector(".popup");
    const popupTextElem = document.querySelector(".popup__text");

    // ---------- Шанс дропа ----------
    function lerp(min, max, value) {
      return (1 - value) * min + value * max;
    }

    function dropPrize(items) {
      const total = items.reduce(
        (accumulator, item) => accumulator + item.dropChance,
        0
      );
      const chance = lerp(0, total, Math.random());

      let current = 0;
      for (let i = 0; i < items.length; i++) {
        item = items[i];

        if (current <= chance && chance < current + item.dropChance) {
          return i;
        }

        current += item.dropChance;
      }

      return current;
    }

    // ---------- Первоначальные настройки ----------
    // Если нет вращений
    if (availableSpins <= 0) {
      isGetPrize = true;
      document.body.classList.add("no-spin");
      showPrizePopup("no-spin");
    }

    function setSpinsCount() {
      availableSpins -= 1;
      dealSpins += 1;

      if (availableSpins <= 0) {
        isGetPrize = true;
        document.body.classList.add("no-spin");
      }
    }

    // отправляем подарок в бота
    async function sendPrizeToBot(prizeIndex) {
      return await fetch(
        "https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/callback",
        {
          method: "POST",
          body: JSON.stringify({
            message: `приз_k2_${prizeIndex + 1}`,
            client_id: clientId,
          }),
        }
      );
    }

    // получаем переменные
    async function getUserVariables(id) {
      return await fetch(
        `https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/get_variables?client_id=${id}`
      ).then((body) => body.json());
    }

    // ---------- Попап----------
    function showPrizePopup(index) {
      popupElem.classList.remove("hide");
      document.querySelector(`.prize-${index == "no-spin" ? index : index + 1}`).classList.remove("hide");
      console.log(prizes[index]);
    }

    // ---------- Функции обработчиков событий ----------
    function onPhoneClick(e) {
      if (isGetPrize) {
        return;
      }
      isGetPrize = true;

      e.target.classList.add("active");

      const prizeId = dropPrize(prizes);

      setTimeout(async () => {
        showPrizePopup(prizeId);
        showBackButton();
        await sendPrizeToBot(prizeId);
        setSpinsCount();
      }, 800);
    }

    // ---------- Обработчики событий ----------
    phoneElems.forEach((el) => {
      el.addEventListener("click", onPhoneClick);
    });
  }, 0);
})();
