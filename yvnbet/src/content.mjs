export const languages = ["ru", "hy", "en"];
export const tr = (ru, hy, en) => ({ ru, hy, en });
const same = (s) => tr(s, s, s);
export const ui = {
  ru: {
    countrySearch: "Страна или код телефона",
    partners: "Партнёрская программа",
    contactOperator: "Связаться с оператором",
    partnerMessage:
      "Здравствуйте, YvnBet! Хочу узнать об условиях партнёрской программы.",
    country: "Страна",
    phoneInvalid: "Проверьте номер телефона и код страны.",
    acceptTerms: "Принимаю условия использования",
    countryEmpty: "Страна не найдена",
    allProviders: "Все",
    previousGames: "Предыдущие игры",
    nextGames: "Следующие игры",
    winner: "Лев выбрал для вас",

    home: "Главная",
    slots: "Слоты",
    promotions: "Акции",
    help: "Поддержка",
    login: "Войти",
    register: "Регистрация",
    all: "Все игры",
    providers: "Провайдеры",
    featured: "Топ игры",
    collection: "Ваша следующая любимая игра",
    search: "Найти игру",
    empty: "Ничего не найдено. Попробуйте другой фильтр.",
    play: "Играть",
    details: "Подробнее",
    random: "Не знаете, во что поиграть?",
    randomText: "Лев поможет вам.",
    spin: "Крутить",
    spinning: "Лев выбирает…",
    selection: "Выбор льва",
    again: "Попробовать ещё",
    telegram: "Написать в Telegram",
    age: "Вам уже исполнилось 18 лет?",
    ageText:
      "Этот сайт предназначен только для совершеннолетних. Играйте ответственно.",
    yes: "Да, мне есть 18",
    no: "Мне нет 18",
    denied: "Доступ доступен только с 18 лет.",
    back: "Назад",
    name: "Имя",
    phone: "Номер телефона",
    city: "Город",
    optional: "необязательно",
    adultConfirmation: "Подтверждаю, что мне исполнилось 18 лет",
    previousProviders: "Предыдущие провайдеры",
    nextProviders: "Следующие провайдеры",
    registrationIntro:
      "Здравствуйте, YvnBet! Хочу зарегистрироваться на сайте. Подтверждаю, что мне исполнилось 18 лет. Мои данные для регистрации:",
    handle: "Telegram",
    consent:
      "Согласен с обработкой данных согласно политике конфиденциальности",
    submit: "Сохранить и перейти в Telegram",
    saved: "Заявка сохранена",
    sendHint: "Отправьте подготовленное сообщение оператору в Telegram.",
    error: "Не удалось выполнить запрос. Попробуйте ещё раз.",
    close: "Закрыть",
    external: "Открыть в новой вкладке",
    frameHelp: "Если платформа не загрузилась, откройте её в новой вкладке.",
    unavailable:
      "Ссылка на эту игру скоро появится. Пока можно посмотреть другие игры.",
    demo: "Превью",
    about: "О нас",
    privacy: "Конфиденциальность",
    terms: "Условия использования",
    app: "Скачать приложение",
    download: "Скачать",
    soon: "Ссылка на приложение скоро появится",
    rights: "Все права защищены.",
    responsible:
      "Играйте ответственно",
    next: "Следующий слайд",
    prev: "Предыдущий слайд",
    pause: "Пауза",
    resume: "Продолжить",
    slide: "Слайд",
    catalog: "Каталог игр",
    offers: "Особые предложения",
    questions: "Чем можем помочь?",
    more: "Смотреть все",
    category: "Категория",
    notFound: "Страница не найдена",
    latest: "Новости",
    bonus: "Бонус",
    promotion: "Акция",
    news: "Новость",
    offer: "Предложение",
    pending: "Сохраняем…",
  },
  en: {
    countrySearch: "Country or calling code",
    partners: "Partner programme",
    contactOperator: "Contact the operator",
    partnerMessage:
      "Hello, YvnBet! I would like to learn about your partner programme.",
    country: "Country",
    phoneInvalid: "Check your phone number and country code.",
    acceptTerms: "I accept the terms of use",
    countryEmpty: "No countries found",
    allProviders: "All",
    previousGames: "Previous games",
    nextGames: "Next games",
    winner: "The lion picked for you",

    home: "Home",
    slots: "Slots",
    promotions: "Promotions",
    help: "Support",
    login: "Log in",
    register: "Register",
    all: "All games",
    providers: "Providers",
    featured: "Top games",
    collection: "Your next favourite game",
    search: "Find a game",
    empty: "No results. Try a different filter.",
    play: "Play",
    details: "Details",
    random: "Not sure what to play?",
    randomText: "The lion will help you.",
    spin: "Spin",
    spinning: "The lion is choosing…",
    selection: "The lion’s picks",
    again: "Try again",
    telegram: "Message on Telegram",
    age: "Are you 18 or older?",
    ageText: "This website is for adults only. Please play responsibly.",
    yes: "Yes, I am 18+",
    no: "I am under 18",
    denied: "Access is available to adults aged 18 and over.",
    back: "Back",
    name: "Name",
    phone: "Phone number",
    city: "City",
    optional: "optional",
    adultConfirmation: "I confirm that I am 18 or older",
    previousProviders: "Previous providers",
    nextProviders: "Next providers",
    registrationIntro:
      "Hello, YvnBet! I would like to register on the website. I confirm that I am 18 or older. My registration details:",
    handle: "Telegram",
    consent: "I agree to data processing under the privacy policy",
    submit: "Save and continue to Telegram",
    saved: "Request saved",
    sendHint: "Send the prepared message to the operator in Telegram.",
    error: "The request failed. Please try again.",
    close: "Close",
    external: "Open in a new tab",
    frameHelp: "If the platform does not load, open it in a new tab.",
    unavailable:
      "This game link is coming soon. Explore other games in the meantime.",
    demo: "Preview",
    about: "About us",
    privacy: "Privacy",
    terms: "Terms of use",
    app: "Get the app",
    download: "Download",
    soon: "The app link is coming soon",
    rights: "All rights reserved.",
    responsible: "Play responsibly",
    next: "Next slide",
    prev: "Previous slide",
    pause: "Pause",
    resume: "Resume",
    slide: "Slide",
    catalog: "Game library",
    offers: "Special offers",
    questions: "How can we help?",
    more: "View all",
    category: "Category",
    notFound: "Page not found",
    latest: "News",
    bonus: "Bonus",
    promotion: "Promotion",
    news: "News",
    offer: "Offer",
    pending: "Saving…",
  },
  hy: {
    countrySearch: "Երկիր կամ հեռախոսային կոդ",
    partners: "Գործընկերային ծրագիր",
    contactOperator: "Կապվել օպերատորի հետ",
    partnerMessage:
      "Բարև, YvnBet։ Ցանկանում եմ իմանալ գործընկերային ծրագրի պայմանները։",
    country: "Երկիր",
    phoneInvalid: "Ստուգեք հեռախոսահամարը և երկրի կոդը։",
    acceptTerms: "Ընդունում եմ օգտագործման պայմանները",
    countryEmpty: "Երկիրը չի գտնվել",
    allProviders: "Բոլորը",
    previousGames: "Նախորդ խաղերը",
    nextGames: "Հաջորդ խաղերը",
    winner: "Առյուծն ընտրել է ձեզ համար",

    home: "Գլխավոր",
    slots: "Սլոթեր",
    promotions: "Ակցիաներ",
    help: "Աջակցություն",
    login: "Մուտք",
    register: "Գրանցվել",
    all: "Բոլոր խաղերը",
    providers: "Մատակարարներ",
    featured: "Թոփ խաղեր",
    collection: "Ձեր հաջորդ սիրելի խաղը",
    search: "Գտնել խաղը",
    empty: "Արդյունքներ չկան։ Փորձեք այլ զտիչ։",
    play: "Խաղալ",
    details: "Մանրամասն",
    random: "Չգիտե՞ս՝ ինչ խաղալ",
    randomText: "Առյուծը կօգնի քեզ։",
    spin: "Պտտել",
    spinning: "Առյուծն ընտրում է…",
    selection: "Առյուծի ընտրությունը",
    again: "Փորձել կրկին",
    telegram: "Գրել Telegram-ում",
    age: "Դուք արդեն 18 տարեկան ե՞ք",
    ageText:
      "Այս կայքը նախատեսված է միայն չափահասների համար։ Խաղացեք պատասխանատու։",
    yes: "Այո, ես 18+ եմ",
    no: "Ես 18-ից փոքր եմ",
    denied: "Մուտքը հասանելի է միայն 18 տարեկանից։",
    back: "Հետ",
    name: "Անուն",
    phone: "Հեռախոսահամար",
    city: "Քաղաք",
    optional: "ոչ պարտադիր",
    adultConfirmation: "Հաստատում եմ, որ 18+ տարեկան եմ",
    previousProviders: "Նախորդ մատակարարները",
    nextProviders: "Հաջորդ մատակարարները",
    registrationIntro:
      "Բարև, YvnBet ջան։ Ուզում եմ գրանցվել կայքում։ Հաստատում եմ, որ 18+ տարեկան եմ։ Իմ տվյալները գրանցման համար՝",
    handle: "Telegram",
    consent:
      "Համաձայն եմ տվյալների մշակմանը՝ գաղտնիության քաղաքականության համաձայն",
    submit: "Պահպանել և անցնել Telegram",
    saved: "Հայտը պահպանված է",
    sendHint: "Ուղարկեք պատրաստված հաղորդագրությունը օպերատորին Telegram-ում։",
    error: "Հարցումը ձախողվեց։ Փորձեք կրկին։",
    close: "Փակել",
    external: "Բացել նոր ներդիրում",
    frameHelp: "Եթե հարթակը չի բեռնվում, բացեք այն նոր ներդիրում։",
    unavailable: "Այս խաղի հղումը շուտով կհայտնվի։ Մինչ այդ դիտեք այլ խաղեր։",
    demo: "Նախադիտում",
    about: "Մեր մասին",
    privacy: "Գաղտնիություն",
    terms: "Օգտագործման պայմաններ",
    app: "Ներբեռնել հավելվածը",
    download: "Ներբեռնել",
    soon: "Հավելվածի հղումը շուտով կհայտնվի",
    rights: "Բոլոր իրավունքները պաշտպանված են։",
    responsible:
      "Խաղա պատասխանատվությամբ",
    next: "Հաջորդ սլայդը",
    prev: "Նախորդ սլայդը",
    pause: "Դադար",
    resume: "Շարունակել",
    slide: "Սլայդ",
    catalog: "Խաղերի կատալոգ",
    offers: "Հատուկ առաջարկներ",
    questions: "Ինչո՞վ կարող ենք օգնել",
    more: "Դիտել բոլորը",
    category: "Կատեգորիա",
    notFound: "Էջը չի գտնվել",
    latest: "Նորություններ",
    bonus: "Բոնուս",
    promotion: "Ակցիա",
    news: "Նորություն",
    offer: "Առաջարկ",
    pending: "Պահպանվում է…",
  },
};
const seo = { title: same(""), description: same(""), keywords: same("") };
const item = (id, title, extra = {}) => ({
  id,
  slug: id,
  title,
  description: same(""),
  seo: structuredClone(seo),
  enabled: true,
  ...extra,
});
export const initialContent = {
  version: 2,
  settings: {
    brand: "YvnBet",
    logo: "/images/wordmark.webp",
    lion: "/images/lion-standing.webp",
    telegram: "yvnbet",
    registrationTelegramUrl: "",
    supportTelegramUrl: "",
    floatingTelegramUrl: "",
    partnersTelegramUrl: "",
    maintenanceTelegramUrl: "",
    maintenance: false,
    maintenanceTitle: tr("Технические работы", "Տեխնիկական աշխատանքներ", "Scheduled maintenance"),
    maintenanceText: tr("Обновляем сайт. Скоро вернёмся — спасибо за терпение!", "Թարմացնում ենք կայքը։ Շուտով կվերադառնանք․ շնորհակալություն համբերության համար։", "We’re updating the website. We’ll be back soon — thank you for your patience!"),
    telegramText: tr(
      "Здравствуйте! Нужна помощь.",
      "Բարև։ Օգնության կարիք ունեմ։",
      "Hello! I need help.",
    ),
    loginUrl: "https://ggplus.pro",
    loginMode: "iframe",
    appUrl: "",
    siteUrl: "",
    indexable: false,
    ogImage: "/images/hero.webp",
    defaultLanguage: "ru",
    sliderSeconds: 7,
  },
  interface: ui,
  seo: {
    home: {
      title: tr(
        "YvnBet — ваша территория игры",
        "YvnBet — ձեր խաղային տարածքը",
        "YvnBet — your world of play",
      ),
      description: tr(
        "Откройте каталог игр, провайдеров и специальных предложений YvnBet.",
        "Բացահայտեք YvnBet-ի խաղերը, մատակարարներն ու հատուկ առաջարկները։",
        "Explore the YvnBet collection of games, providers and special offers.",
      ),
      keywords: same("YvnBet, slots, games"),
    },
    slots: {
      title: tr(
        "Каталог игр — YvnBet",
        "Խաղերի կատալոգ — YvnBet",
        "Game library — YvnBet",
      ),
      description: tr(
        "Найдите игру в каталоге YvnBet: поиск, категории и фильтры по провайдерам.",
        "Գտեք խաղը YvnBet-ում՝ որոնման, կատեգորիաների և մատակարարների զտիչներով։",
        "Find your game in the YvnBet library using search, categories and provider filters.",
      ),
      keywords: same("YvnBet, games, slots"),
    },
    promotions: {
      title: tr(
        "Акции и новости — YvnBet",
        "Ակցիաներ և նորություններ — YvnBet",
        "Promotions and news — YvnBet",
      ),
      description: tr(
        "Новости, действующие акции и специальные предложения YvnBet с подробными условиями.",
        "YvnBet-ի նորությունները, ընթացիկ ակցիաներն ու հատուկ առաջարկները՝ մանրամասն պայմաններով։",
        "YvnBet news, current promotions and special offers with detailed terms.",
      ),
      keywords: same("YvnBet, promotions, news"),
    },
    help: {
      title: tr(
        "Поддержка и FAQ — YvnBet",
        "Աջակցություն և ՀՏՀ — YvnBet",
        "Support and FAQ — YvnBet",
      ),
      description: tr(
        "Ответы на вопросы о регистрации и запуске игр. Свяжитесь с поддержкой YvnBet в Telegram.",
        "Գրանցման և խաղերի գործարկման հարցերի պատասխաններ։ Կապվեք YvnBet աջակցության հետ Telegram-ում։",
        "Answers about registration and game access. Contact YvnBet support on Telegram.",
      ),
      keywords: same("YvnBet, support, FAQ"),
    },
    app: {
      title: tr("Приложение YvnBet", "YvnBet հավելված", "YvnBet app"),
      description: tr(
        "Информация о мобильном приложении YvnBet и доступных способах скачивания.",
        "Տեղեկություն YvnBet բջջային հավելվածի և ներբեռնման եղանակների մասին։",
        "Information about the YvnBet mobile app and available downloads.",
      ),
      keywords: same("YvnBet, mobile, app"),
    },
  },
  providers: [
    item("amusnet", same("Amusnet"), {
      logo: "/images/provider-amusnet.webp",
      url: "",
      mode: "external",
    }),
    item("pragmatic-play", same("Pragmatic Play"), {
      logo: "/images/provider-pragmatic-play.webp",
      url: "",
      mode: "external",
    }),
    item("amatic", same("Amatic"), {
      logo: "/images/provider-amatic.webp",
      url: "",
      mode: "external",
    }),
  ],
  categories: [item("slots", tr("Слоты", "Սլոթեր", "Slots"))],
  games: [
    ["golden-eclipse", "Golden Eclipse", "amusnet", "slots", 1],
    ["crystal-path", "Crystal Path", "amusnet", "slots", 1],
    ["midnight-star", "Midnight Star", "pragmatic-play", "slots", 2],
    ["neon-crown", "Neon Crown", "amatic", "slots", 3],
    ["royal-orbit", "Royal Orbit", "pragmatic-play", "slots", 4],
    ["silver-rush", "Silver Rush", "amatic", "slots", 5],
  ].map(([id, name, provider, category, n]) =>
    item(id, same(name), {
      provider,
      category,
      image: `/images/game-${n}.webp`,
      url: "",
      mode: "iframe",
      featured: true,
      description: tr(
        "Предварительный обзор игры. Запуск станет доступен после подключения ссылки провайдера.",
        "Խաղի նախադիտում։ Գործարկումը հասանելի կլինի մատակարարի հղումը միացնելուց հետո։",
        "Game preview. Launch will be available when the provider link is connected.",
      ),
    }),
  ),
  slides: [
    item(
      "welcome",
      tr(
        "Ваша территория.\nВаши правила.",
        "Ձեր տարածքը։\nՁեր կանոնները։",
        "Your world.\nYour rules.",
      ),
      {
        image: "/images/hero.webp",
        label: tr(
          "ДОБРО ПОЖАЛОВАТЬ В YVNBET",
          "ԲԱՐԻ ԳԱԼՈՒՍՏ YVNBET",
          "WELCOME TO YVNBET",
        ),
        description: tr(
          "Знакомые игры. Новые впечатления. Всё начинается с вашего выбора.",
          "Ծանոթ խաղեր։ Նոր տպավորություններ։ Ամեն ինչ սկսվում է ձեր ընտրությունից։",
          "Familiar games. New experiences. It all starts with your choice.",
        ),
        button: tr(
          "Открыть коллекцию",
          "Բացել հավաքածուն",
          "Explore the collection",
        ),
        url: "/slots",
      },
    ),
    item(
      "discovery",
      tr(
        "Найдите свою\nновую классику.",
        "Գտեք ձեր\nնոր դասականը։",
        "Find your\nnext classic.",
      ),
      {
        image: "/images/game-2.webp",
        label: tr(
          "ИГРЫ И ПРОВАЙДЕРЫ",
          "ԽԱՂԵՐ ԵՎ ՄԱՏԱԿԱՐԱՐՆԵՐ",
          "GAMES & PROVIDERS",
        ),
        description: tr(
          "Откройте каталог и выберите свой ритм игры.",
          "Բացեք կատալոգը և ընտրեք ձեր խաղի ռիթմը։",
          "Explore the library and find your own rhythm.",
        ),
        button: tr("Смотреть игры", "Դիտել խաղերը", "View games"),
        url: "/slots",
      },
    ),
    item(
      "club",
      tr(
        "Всегда\nна вашей стороне.",
        "Միշտ\nձեր կողքին։",
        "Always\nby your side.",
      ),
      {
        image: "/images/game-4.webp",
        label: tr("ПОДДЕРЖКА YVNBET", "YVNBET ԱՋԱԿՑՈՒԹՅՈՒՆ", "YVNBET SUPPORT"),
        description: tr(
          "Поможем с регистрацией, доступом и вопросами по платформе.",
          "Կօգնենք գրանցման, մուտքի և հարթակի հարցերով։",
          "Here to help with registration, access and platform questions.",
        ),
        button: tr("Связаться с нами", "Կապվել մեզ հետ", "Get in touch"),
        url: "/help",
      },
    ),
  ],
  promotions: [
    item(
      "welcome-guide",
      tr(
        "Ваш первый шаг в YvnBet",
        "Ձեր առաջին քայլը YvnBet-ում",
        "Your first step into YvnBet",
      ),
      {
        kind: "news",
        image: "/images/hero.webp",
        start: "",
        end: "",
        description: tr(
          "Зарегистрируйтесь через форму на сайте. Оператор в Telegram поможет с доступом и расскажет об актуальных предложениях.",
          "Գրանցվեք կայքի ձևի միջոցով։ Telegram-ի օպերատորը կօգնի մուտքի հարցում և կներկայացնի ընթացիկ առաջարկները։",
          "Register using the website form. Our Telegram operator will help with access and explain current offers.",
        ),
        button: tr("Связаться", "Կապվել", "Contact us"),
        url: "/help",
      },
    ),
  ],
  faq: [
    item(
      "registration",
      tr("Как зарегистрироваться?", "Ինչպե՞ս գրանցվել։", "How do I register?"),
      {
        description: tr(
          "Нажмите «Регистрация», заполните форму и перейдите в Telegram. Отправьте подготовленное сообщение оператору.",
          "Սեղմեք «Գրանցվել», լրացրեք ձևը և անցեք Telegram։ Պատրաստված հաղորդագրությունն ուղարկեք օպերատորին։",
          "Choose Register, complete the form and continue to Telegram. Send the prepared message to the operator.",
        ),
      },
    ),
    item(
      "launch",
      tr("Как открыть игру?", "Ինչպե՞ս բացել խաղը։", "How do I open a game?"),
      {
        description: tr(
          "Выберите игру в каталоге: платформа сразу откроется под шапкой сайта. Если она не загружается, нажмите на стрелку в шапке, чтобы открыть новую вкладку.",
          "Ընտրեք խաղը կատալոգում․ հարթակը կբացվի կայքի հեդերի տակ։ Եթե այն չի բեռնվում, հեդերի սլաքով բացեք նոր ներդիրում։",
          "Select a game: the platform opens directly below the site header. If it does not load, use the arrow in the header to open a new tab.",
        ),
      },
    ),
    item(
      "support",
      tr(
        "Как связаться с поддержкой?",
        "Ինչպե՞ս կապվել աջակցության հետ։",
        "How can I contact support?",
      ),
      {
        description: tr(
          "Используйте кнопку Telegram в правом нижнем углу сайта.",
          "Օգտագործեք կայքի ներքևի աջ անկյունի Telegram կոճակը։",
          "Use the Telegram button at the bottom right of the website.",
        ),
      },
    ),
  ],
  pages: [
    item(
      "partners",
      tr("Партнёрская программа", "Գործընկերային ծրագիր", "Partner programme"),
      {
        description: tr(
          "Хотите сотрудничать с YvnBet? Свяжитесь с оператором, чтобы обсудить формат партнёрства, условия и дальнейшие шаги.",
          "Ցանկանո՞ւմ եք համագործակցել YvnBet-ի հետ։ Կապվեք օպերատորի հետ՝ քննարկելու համագործակցության ձևաչափը, պայմանները և հետագա քայլերը։",
          "Interested in working with YvnBet? Contact our operator to discuss partnership options, terms and next steps.",
        ),
      },
    ),
    item("about", tr("О нас", "Մեր մասին", "About us"), {
      description: tr(
        "YvnBet — место для знакомства с играми и провайдерами. Выбирайте игру, изучайте предложения и обращайтесь к нашей поддержке.",
        "YvnBet-ը խաղերին և մատակարարներին ծանոթանալու վայր է։ Ընտրեք խաղը, ուսումնասիրեք առաջարկները և կապվեք աջակցության հետ։",
        "YvnBet is a place to discover games and providers. Explore the collection and contact our support team.",
      ),
    }),
    item(
      "privacy",
      tr(
        "Политика конфиденциальности",
        "Գաղտնիության քաղաքականություն",
        "Privacy policy",
      ),
      {
        description: tr(
          "Для ответа на заявку сохраняются имя, телефон, город, подтверждение 18+ и Telegram, если он указан. Доступ к заявкам есть у уполномоченных сотрудников. При переходе в Telegram данные добавляются в черновик сообщения; отправку подтверждаете вы. Для запроса удаления данных обратитесь в поддержку. Это предварительный текст: реквизиты оператора и сроки хранения необходимо указать до запуска.",
          "Հայտին պատասխանելու համար պահպանվում են անունը, հեռախոսը, քաղաքը, 18+ հաստատումը և Telegram-ը, եթե նշված է։ Հայտերին հասանելիություն ունեն լիազորված աշխատակիցները։ Telegram անցնելիս տվյալները հայտնվում են հաղորդագրության սևագրում. ուղարկումը հաստատում եք դուք։ Ջնջման համար կապվեք աջակցության հետ։ Նախնական տեքստ. օպերատորի տվյալներն ու պահպանման ժամկետները պետք է լրացվեն մինչև մեկնարկը։",
          "We save your name, phone number, city, age confirmation and optional Telegram handle to respond to your request. Authorised staff can access requests. Continuing to Telegram prepares a message draft; you decide whether to send it. Contact support to request deletion. This is draft copy: operator details and retention periods must be added before launch.",
        ),
      },
    ),
    item(
      "terms",
      tr("Условия использования", "Օգտագործման պայմաններ", "Terms of use"),
      {
        description: tr(
          "Сайт доступен лицам старше 18 лет. Условия отдельных игр и предложений определяются соответствующим провайдером. Перед использованием ознакомьтесь с его правилами. Текст для предварительного просмотра; финальные условия предоставляет оператор.",
          "Կայքը հասանելի է 18 տարեկանից բարձր անձանց։ Խաղերի և առաջարկների պայմանները սահմանում է համապատասխան մատակարարը։ Օգտագործելուց առաջ ծանոթացեք նրա կանոններին։ Նախնական տեքստ. վերջնական պայմանները տրամադրում է օպերատորը։",
          "This website is for adults aged 18 and over. Individual game and offer terms are set by the relevant provider. Read their rules before use. Preview copy; final terms must be supplied by the operator.",
        ),
      },
    ),
    item(
      "app",
      tr("YvnBet всегда рядом", "YvnBet-ը միշտ մոտ է", "Take YvnBet with you"),
      {
        description: tr(
          "Ваша коллекция игр в удобном мобильном формате.",
          "Ձեր խաղերի հավաքածուն՝ հարմար բջջային ձևաչափով։",
          "Your game collection in a convenient mobile format.",
        ),
      },
    ),
  ],
};
// Per-language artwork is optional; editable HTML copy supplies translations.
for (const slide of initialContent.slides) {
  slide.imageRu = "";
  slide.imageHy = "";
  slide.imageEn = "";
  slide.showText = true;
}

export function upgradeSiteControls(input) {
  const c = structuredClone(input);
  for (const key of ["floatingTelegramUrl", "partnersTelegramUrl", "maintenanceTelegramUrl", "maintenance", "maintenanceTitle", "maintenanceText"])
    c.settings[key] ??= structuredClone(initialContent.settings[key]);
  for (const slide of c.slides) {
    for (const key of ["imageRu", "imageHy", "imageEn"]) slide[key] ??= "";
    // Do not overlay new copy on custom artwork which may already include text.
    slide.showText ??= initialContent.slides.some((seed) => seed.id === slide.id && seed.image === slide.image);
  }
  for (const lang of languages) c.interface[lang].responsible = ui[lang].responsible;
  return c;
}

export function activePromotion(p, now = Date.now()) {
  return (
    p.enabled &&
    (!p.start || Date.parse(p.start) <= now) &&
    (!p.end || Date.parse(p.end + "T23:59:59Z") >= now)
  );
}
export function publicContent(c) {
  const out = structuredClone(c);
  for (const key of [
    "providers",
    "categories",
    "games",
    "slides",
    "promotions",
    "faq",
    "pages",
  ])
    out[key] = out[key].filter((x) => x.enabled);
  out.games = out.games.filter(
    (g) =>
      out.providers.some((p) => p.id === g.provider) &&
      out.categories.some((p) => p.id === g.category && p.slug === "slots"),
  );
  out.promotions = out.promotions.filter((p) => activePromotion(p));
  return out;
}

// Additive compatibility for existing CMS databases. Custom text and assets survive updates.
export function upgradeContent(input) {
  const c = structuredClone(input);
  for (const lang of languages)
    c.interface[lang] = { ...ui[lang], ...c.interface[lang] };
  for (const p of c.providers) {
    const seed = initialContent.providers.find((x) => x.id === p.id);
    if (!p.logo && seed) p.logo = seed.logo;
  }
  const originalCopy = {
    faq: {
      ru: "Выберите игру в каталоге. На её странице нажмите «Играть». Если встроенное окно не загружается, используйте кнопку открытия в новой вкладке.",
      hy: "Ընտրեք խաղը կատալոգում և սեղմեք «Խաղալ»։ Եթե ներկառուցված պատուհանը չի բեռնվում, բացեք նոր ներդիրում։",
      en: "Select a game and choose Play. If the embedded platform does not load, use Open in a new tab.",
    },
    privacy: {
      ru: "Для ответа на заявку сохраняются имя, телефон и Telegram. Доступ к заявкам есть у уполномоченных сотрудников. При переходе в Telegram данные добавляются в черновик сообщения; отправку подтверждаете вы. Для запроса удаления данных обратитесь в поддержку. Это предварительный текст: реквизиты оператора и сроки хранения необходимо указать до запуска.",
      hy: "Հայտին պատասխանելու համար պահպանվում են անունը, հեռախոսը և Telegram-ը։ Հայտերին հասանելիություն ունեն լիազորված աշխատակիցները։ Telegram անցնելիս տվյալները հայտնվում են հաղորդագրության սևագրում. ուղարկումը հաստատում եք դուք։ Ջնջման համար կապվեք աջակցության հետ։ Նախնական տեքստ. օպերատորի տվյալներն ու պահպանման ժամկետները պետք է լրացվեն մինչև մեկնարկը։",
      en: "We save your name, phone number and Telegram handle to respond to your request. Authorised staff can access requests. Continuing to Telegram prepares a message draft; you decide whether to send it. Contact support to request deletion. This is draft copy: operator details and retention periods must be added before launch.",
    },
  };
  for (const [collection, id, original] of [
    ["faq", "launch", originalCopy.faq],
    ["pages", "privacy", originalCopy.privacy],
  ]) {
    const record = c[collection].find((x) => x.id === id);
    const seed = initialContent[collection].find((x) => x.id === id);
    if (record && seed)
      for (const lang of languages)
        if (record.description[lang] === original[lang])
          record.description[lang] = seed.description[lang];
  }
  // The original six demo records used placeholder categories; real/custom games are untouched.
  for (const g of c.games) {
    const seed = initialContent.games.find((x) => x.id === g.id);
    if (
      seed &&
      g.image === seed.image &&
      !g.url &&
      ["table", "crash"].includes(g.category)
    )
      g.category = "slots";
  }
  c.categories = c.categories.filter(
    (x) =>
      !["table", "crash"].includes(x.id) ||
      c.games.some((g) => g.category === x.id),
  );
  return c;
}

export function upgradePresentation(input) {
  const c = structuredClone(input);
  const previous = {
    ru: "В центре внимания",
    hy: "Ուշադրության կենտրոնում",
    en: "In the spotlight",
  };
  for (const lang of languages)
    if (c.interface[lang].featured === previous[lang])
      c.interface[lang].featured = ui[lang].featured;
  return c;
}

export function upgradeRegistrationUi(input) {
  const c = structuredClone(input);
  for (const lang of languages)
    c.interface[lang] = { ...ui[lang], ...c.interface[lang] };
  if (!c.pages.some((p) => p.slug === "partners"))
    c.pages.push(
      structuredClone(initialContent.pages.find((p) => p.slug === "partners")),
    );
  return c;
}

export function upgradeTelegramLinks(input) {
  const c = structuredClone(input);
  c.settings.registrationTelegramUrl ??= "";
  c.settings.supportTelegramUrl ??= "";
  return c;
}

export function upgradeLionPresentation(input) {
  const c = structuredClone(input);
  if (c.settings.lion === "/images/lion.svg")
    c.settings.lion = initialContent.settings.lion;
  const previous = {
    ru: "Доверьтесь льву. Один клик — новая подборка.",
    hy: "Վստահեք առյուծին։ Մեկ սեղմում՝ նոր ընտրանի։",
    en: "Let the lion choose. One click, a fresh selection.",
  };
  for (const lang of languages)
    if (c.interface[lang].randomText === previous[lang])
      c.interface[lang].randomText = ui[lang].randomText;
  if (c.interface.hy.random === "Չգիտե՞ք՝ ինչ խաղալ")
    c.interface.hy.random = ui.hy.random;
  return c;
}

export function telegramContact(settings, purpose, text) {
  const key = { registration: "registrationTelegramUrl", support: "supportTelegramUrl", floating: "floatingTelegramUrl", partners: "partnersTelegramUrl", maintenance: "maintenanceTelegramUrl" }[purpose];
  const target = settings[key] || (purpose !== "registration" ? settings.supportTelegramUrl : "");
  const url = new URL(target || `https://t.me/${settings.telegram}`);
  url.searchParams.set("text", text);
  url.search = url.search.replace(/\+/g, "%20");
  return url.href;
}
