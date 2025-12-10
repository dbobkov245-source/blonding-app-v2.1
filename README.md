# Blonding App v2.1

Интерактивное приложение для обучения техникам блондирования — версия 2.1.

Дата сборки: 2025-11-05

## Ключевые возможности
- Автоматическая генерация Markdown-уроков из `lessons/source/*.txt`
- Автоматическое копирование изображений в `public/lessons/{slug}/images/`
- AI-консультант (через Hugging Face) — proxy в `/api/proxy.js`
- Сборка на Vercel / GitHub Pages совместима

## Локальная разработка
1. Установите зависимости: `npm install`
2. Добавьте HF_TOKEN в окружение при необходимости для локальной проверки AI (необязательно для уроков)
3. Добавьте уроки в `lessons/source/` и изображения в `lessons/source/images/`.
   В тексте урока используйте токены изображений вида `[[filename.ext]]`
4. Сгенерируйте уроки: `npm run generate-lessons`
5. Запустите dev сервер: `npm run dev`

## Деплой
1. Создайте репозиторий на GitHub и запушьте проект.
2. Подключите репозиторий к Vercel.
3. Добавьте переменную окружения `HF_TOKEN` в настройках проекта Vercel.
4. При пуше workflow (если настроен) автоматически выполнит генерацию уроков.

## Уроки

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Как проходить уроки предобучения?](/Theory/urok1)
- [Для чего нужны тестовые пряди](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [Натуральные пигменты.](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [Натуральные пигменты.](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [Основное правило колористики.](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [Основное правило колористики.](/Theory/urok8)
- [Основное правило колористики.](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [Классификация блондирующих препаратов.](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [Классификация блондирующих препаратов.](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)

### блондирование
- [Чистые или грязные?](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [Как осветляются волосы на разных участках. 4 участка осветления.](/Theory/urok2zonyosvetleniyavyborokislitelyapervichnoeosv)
- [12% окислитель при блондировании волос.](/Theory/urok3opbonusnyjurok)
- [Резистентные волосы. Осветление очень темных волос.](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [Блондированние корней.](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [Блондирование ранее осветленных волос.](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья.](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)

### тонирование
- [Сверхточные весы.](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [Перед просмотром урока в обязательном порядке просмотрите урок 4 из ПРЕДОБУЧЕНИЯ.](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [Работа с переосветленными базами и с базами с высокой пористостью.](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [Как бороться с негативными оттенками при тонировании (матовый, зеленый, фиолетовый, голубой, слишком серый).](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [Выравнивание неоднородной базы перед тонированием:](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Как проходить уроки предобучения?](/Theory/urok1)
- [Для чего нужны тестовые пряди](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [Натуральные пигменты.](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [Натуральные пигменты.](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [Основное правило колористики.](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [Основное правило колористики.](/Theory/urok8)
- [Основное правило колористики.](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [Классификация блондирующих препаратов.](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [Классификация блондирующих препаратов.](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)

### блондирование
- [Чистые или грязные?](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [12% окислитель при блондировании волос.](/Theory/urok3opbonusnyjurok)
- [Резистентные волосы. Осветление очень темных волос.](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [Блондированние корней.](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [Блондирование ранее осветленных волос.](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья.](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)
- [Как осветляются волосы на разных участках. 4 участка осветления.](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)

### тонирование
- [Сверхточные весы.](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [Перед просмотром урока в обязательном порядке просмотрите урок 4 из ПРЕДОБУЧЕНИЯ.](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [Работа с переосветленными базами и с базами с высокой пористостью.](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [Как бороться с негативными оттенками при тонировании (матовый, зеленый, фиолетовый, голубой, слишком серый).](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [Выравнивание неоднородной базы перед тонированием:](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Как проходить уроки предобучения?](/Theory/urok1)
- [Для чего нужны тестовые пряди](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [Натуральные пигменты.](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [Натуральные пигменты.](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [Основное правило колористики.](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [Основное правило колористики.](/Theory/urok8)
- [Основное правило колористики.](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [Классификация блондирующих препаратов.](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [Классификация блондирующих препаратов.](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)

### блондирование
- [Чистые или грязные?](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [12% окислитель при блондировании волос.](/Theory/urok3opbonusnyjurok)
- [Резистентные волосы. Осветление очень темных волос.](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [Блондированние корней.](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [Блондирование ранее осветленных волос.](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья.](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)
- [Как осветляются волосы на разных участках. 4 участка осветления.](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)

### тонирование
- [Сверхточные весы.](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [Работа с переосветленными базами и с базами с высокой пористостью.](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [Перед просмотром урока в обязательном порядке просмотрите урок 4 из ПРЕДОБУЧЕНИЯ.](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [Как бороться с негативными оттенками при тонировании (матовый, зеленый, фиолетовый, голубой, слишком серый).](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [Выравнивание неоднородной базы перед тонированием:](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Как проходить уроки предобучения?](/Theory/urok1)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [Классификация блондирующих препаратов.](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [Классификация блондирующих препаратов.](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)
- [Для чего нужны тестовые пряди](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [Натуральные пигменты.](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [Натуральные пигменты.](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [Основное правило колористики.](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [Основное правило колористики.](/Theory/urok8)
- [Основное правило колористики.](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)

### блондирование
- [Чистые или грязные?](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [Как осветляются волосы на разных участках. 4 участка осветления.](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)
- [12% окислитель при блондировании волос.](/Theory/urok3opbonusnyjurok)
- [Резистентные волосы. Осветление очень темных волос.](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [Блондированние корней.](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [Блондирование ранее осветленных волос.](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья.](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)

### тонирование
- [Перед просмотром урока в обязательном порядке просмотрите урок 4 из ПРЕДОБУЧЕНИЯ.](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [Сверхточные весы.](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [Работа с переосветленными базами и с базами с высокой пористостью.](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [Как бороться с негативными оттенками при тонировании (матовый, зеленый, фиолетовый, голубой, слишком серый).](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [Выравнивание неоднородной базы перед тонированием:](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Как проходить уроки предобучения?](/Theory/urok1)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [Классификация блондирующих препаратов.](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [Классификация блондирующих препаратов.](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [Ожог кожи головы. Крем-протектор.](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [Диалог с клиентом перед блондированием: правило 14 пунктов.](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)
- [Для чего нужны тестовые пряди](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [Натуральные пигменты.](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [Натуральные пигменты.](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [Уровни глубины тона, сокращенно УГТ.](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [Основное правило колористики.](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [Основное правило колористики.](/Theory/urok8)
- [Основное правило колористики.](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [Воздействие блондирующего порошка на структуру волос или почему волосы отваливаются.](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)

### блондирование
- [Чистые или грязные?](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [Как осветляются волосы на разных участках. 4 участка осветления.](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)
- [12% окислитель при блондировании волос.](/Theory/urok3opbonusnyjurok)
- [Резистентные волосы. Осветление очень темных волос.](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [Блондированние корней.](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [Блондирование ранее осветленных волос.](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [Дополнительное тепло при блондировании. Время выдержки при блондировании. Предельное время выдержки.  Постобработка волос - 4 концепции финального мытья.](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)

### тонирование
- [Сверхточные весы.](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [Перед просмотром урока в обязательном порядке просмотрите урок 4 из ПРЕДОБУЧЕНИЯ.](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [Работа с переосветленными базами и с базами с высокой пористостью.](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [Как бороться с негативными оттенками при тонировании (матовый, зеленый, фиолетовый, голубой, слишком серый).](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [Выравнивание неоднородной базы перед тонированием:](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [urok1](/Theory/urok1)
- [urok10izuchiteblondirovaniena12okisliteleproanaliz](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [urok11poluchiteklassifikatsiyublondiruyuschihprepa](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [urok12poimetekaksmeshivatproduktchtobyoptimizirova](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [urok13uznaetekakizbegatozhogakozhipoimetechtodelat](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [urok14izuchitetselesoobraznostdobavokvobestsvechiv](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [urok15nauchitespravilnozadavatvoprosydlyaanalizapo](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [urok16obrazetspravilnozapolnennogotehnicheskogoteh](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)
- [urok2uznaetekaklegkopodgotovitilikakpriobrestitest](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [urok3izuchitenaturalnyepigmentypoimeteraznitsumezh](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [urok4usvoitekakprotekaetprotsessokrashivaniyasosve](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [urok5izuchiterovniglubinytonaifonyosvetleniyanauch](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [urok6poluchiteshkaluugtifopoimeteihvliyanienarezul](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [urok7priobreteteglubinnoeponimanieinavykirabotysts](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [urok8](/Theory/urok8)
- [urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [urok9poimeteznacheniernpriblondirovaniiiokrashivan](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)

### блондирование
- [urok1podgotovkaklientakblondirovaniyu](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [urok24zonyosvetleniyavyborokislitelyapervichnoeosv](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)
- [urok3opbonusnyjurok](/Theory/urok3opbonusnyjurok)
- [urok4blondirovanieochentemnyhiaziatskihvolosdvojno](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [urok5blondirovaniekornejraznojdlinyblondirovaniene](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [urok6blondirovanieosvetlyonnyhvolosblondirovaniese](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [urok7dopolnitelnoeteplopriblondirovaniivremyavyder](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)

### тонирование
- [urok1vyborkrasitelyaiokislitelyapritonirovaniiprav](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [urok3tonirovanieblondirovannyhvolosholodnymiottenk](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [urok4predotvraschenienezhelatelnyhottenkovpritonir](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [urok5vyravnivanieneodnorodnoibazypritonirovaniirep](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [urok1](/Theory/urok1)
- [urok10izuchiteblondirovaniena12okisliteleproanaliz](/Theory/urok10izuchiteblondirovaniena12okisliteleproanaliz)
- [urok11poluchiteklassifikatsiyublondiruyuschihprepa](/Theory/urok11poluchiteklassifikatsiyublondiruyuschihprepa)
- [urok12poimetekaksmeshivatproduktchtobyoptimizirova](/Theory/urok12poimetekaksmeshivatproduktchtobyoptimizirova)
- [urok13uznaetekakizbegatozhogakozhipoimetechtodelat](/Theory/urok13uznaetekakizbegatozhogakozhipoimetechtodelat)
- [urok14izuchitetselesoobraznostdobavokvobestsvechiv](/Theory/urok14izuchitetselesoobraznostdobavokvobestsvechiv)
- [urok15nauchitespravilnozadavatvoprosydlyaanalizapo](/Theory/urok15nauchitespravilnozadavatvoprosydlyaanalizapo)
- [urok16obrazetspravilnozapolnennogotehnicheskogoteh](/Theory/urok16obrazetspravilnozapolnennogotehnicheskogoteh)
- [urok2uznaetekaklegkopodgotovitilikakpriobrestitest](/Theory/urok2uznaetekaklegkopodgotovitilikakpriobrestitest)
- [urok3izuchitenaturalnyepigmentypoimeteraznitsumezh](/Theory/urok3izuchitenaturalnyepigmentypoimeteraznitsumezh)
- [urok4usvoitekakprotekaetprotsessokrashivaniyasosve](/Theory/urok4usvoitekakprotekaetprotsessokrashivaniyasosve)
- [urok5izuchiterovniglubinytonaifonyosvetleniyanauch](/Theory/urok5izuchiterovniglubinytonaifonyosvetleniyanauch)
- [urok6poluchiteshkaluugtifopoimeteihvliyanienarezul](/Theory/urok6poluchiteshkaluugtifopoimeteihvliyanienarezul)
- [urok7priobreteteglubinnoeponimanieinavykirabotysts](/Theory/urok7priobreteteglubinnoeponimanieinavykirabotysts)
- [urok8](/Theory/urok8)
- [urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy](/Theory/urok8naponyatnyhprimerahbezuprechnoosvoitereaktsiy)
- [urok9poimeteznacheniernpriblondirovaniiiokrashivan](/Theory/urok9poimeteznacheniernpriblondirovaniiiokrashivan)

### блондирование
- [urok1podgotovkaklientakblondirovaniyu](/Theory/urok1podgotovkaklientakblondirovaniyu)
- [urok24zonyosvetleniyavyborokislitelyapervichnoeosv](/Theory/urok24zonyosvetleniyavyborokislitelyapervichnoeosv)
- [urok3opbonusnyjurok](/Theory/urok3opbonusnyjurok)
- [urok4blondirovanieochentemnyhiaziatskihvolosdvojno](/Theory/urok4blondirovanieochentemnyhiaziatskihvolosdvojno)
- [urok5blondirovaniekornejraznojdlinyblondirovaniene](/Theory/urok5blondirovaniekornejraznojdlinyblondirovaniene)
- [urok6blondirovanieosvetlyonnyhvolosblondirovaniese](/Theory/urok6blondirovanieosvetlyonnyhvolosblondirovaniese)
- [urok7dopolnitelnoeteplopriblondirovaniivremyavyder](/Theory/urok7dopolnitelnoeteplopriblondirovaniivremyavyder)

### тонирование
- [urok1vyborkrasitelyaiokislitelyapritonirovaniiprav](/Theory/urok1vyborkrasitelyaiokislitelyapritonirovaniiprav)
- [urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi](/Theory/urok2neitralizatsiyazheltogoizhelto-oranzhevogofoi)
- [urok3tonirovanieblondirovannyhvolosholodnymiottenk](/Theory/urok3tonirovanieblondirovannyhvolosholodnymiottenk)
- [urok4predotvraschenienezhelatelnyhottenkovpritonir](/Theory/urok4predotvraschenienezhelatelnyhottenkovpritonir)
- [urok5vyravnivanieneodnorodnoibazypritonirovaniirep](/Theory/urok5vyravnivanieneodnorodnoibazypritonirovaniirep)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Урок 1](/Theory/urok-1)
- [Урок 10 Изучите блондирование на 12% окислителе. Проанализируете плюсы и минусы этого метода.](/Theory/urok-10-izuchite-blondirovanie-na-12-okislitele-proanaliziruete-plyusy-i-minusy-)
- [Урок 11 Получите классификацию блондирующих препаратов по содержанию аммиака по выбору техник по степени осветления.](/Theory/urok-11-poluchite-klassifikatsiyu-blondiruyushchih-preparatov-po-soderzhaniyu-am)
- [Урок 12 Поймете как смешивать продукт чтобы оптимизировать расходы.](/Theory/urok-12-poimete-kak-smeshivat-produkt-chtoby-optimizirovat-rashody)
- [Урок 13 Узнаете как избегать ожога кожи. Поймете что делать если все-таки ожог произошел.](/Theory/urok-13-uznaete-kak-izbegat-ozhoga-kozhi-poimete-chto-delat-esli-vse-taki-ozhog-)
- [Урок 14 Изучите целесообразность добавок в обесцвечивающий порошок вазелин минеральное масло протеины](/Theory/urok-14-izuchite-tselesoobraznost-dobavok-v-obestsvechivayushchii-poroshok-vazel)
- [Урок 15 Научитесь правильно задавать вопросы для анализа. Получите список из 14 обязательных пунктов необходимых для диалога с клиентом](/Theory/urok-15-nauchites-pravilno-zadavat-voprosy-dlya-analiza-poluchite-spisok-iz-14-o)
- [Урок 16 Образец правильно заполненного технического технического досье. Памятка по уходу (как продавать, не продавая)](/Theory/urok-16-obrazets-pravilno-zapolnennogo-tehnicheskogo-tehnicheskogo-dose-pamyatka)
- [Урок 2 Узнаете, как легко подготовить или как приобрести тестовые пряди. Научитесь создавать личную библиотеку блондиньеро – портфолио оттенков для тонирования.](/Theory/urok-2-uznaete-kak-legko-podgotovit-ili-kak-priobresti-testovye-pryadi-nauchites)
- [Урок 3 Изучите натуральные пигменты. Поймете разницу между влиянием эумеланина и феомеланина на результат осветления и блондирования.](/Theory/urok-3-izuchite-naturalnye-pigmenty-poimete-raznitsu-mezhdu-vliyaniem-eumelanina)
- [Урок 4 Усвоите как протекает процесс окрашивания с осветлением и как протекает процесс блондирования.](/Theory/urok-4-usvoite-kak-protekaet-protsess-okrashivaniya-s-osvetleniem-i-kak-protekae)
- [Урок 5 Изучите ровни глубины тона и фоны осветления. Научитесь понимать характер каждого оттенка без привязки к бренду.](/Theory/urok-5-izuchite-rovni-glubiny-tona-i-fony-osvetleniya-nauchites-ponimat-harakter)
- [Урок 6 Получите шкалу УГТ и ФО, поймете их влияние на результат тонирования, узнаете про идеальный фон осветления.](/Theory/urok-6-poluchite-shkalu-ugt-i-fo-poimete-ih-vliyanie-na-rezultat-tonirovaniya-uz)
- [Урок 7 Приобретете глубинное понимание и навыки работы с цветовым кругом. Изучите правила колористики и их практическое применение при тонировании.](/Theory/urok-7-priobretete-glubinnoe-ponimanie-i-navyki-raboty-s-tsvetovym-krugom-izuchi)
- [Урок 8 На понятных примерах безупречно освоите реакцию нейтрализации нежелательных фонов осветления - желтого и желто-оранжевого.](/Theory/urok-8-na-ponyatnyh-primerah-bezuprechno-osvoite-reaktsiyu-neitralizatsii-nezhel)
- [Урок 8](/Theory/urok-8)
- [Урок 9 Поймете значение рН при блондировании и окрашивании и его влияние на белковую структуру волос.](/Theory/urok-9-poimete-znachenie-rn-pri-blondirovanii-i-okrashivanii-i-ego-vliyanie-na-b)

### блондирование
- [Урок 1. Подготовка клиента к блондированию](/Theory/urok-1-podgotovka-klienta-k-blondirovaniyu)
- [Урок 2. 4 зоны осветления. Выбор % окислителя. Первичное осветление натуральных волос](/Theory/urok-2-4-zony-osvetleniya-vybor-okislitelya-pervichnoe-osvetlenie-naturalnyh-vol)
- [Урок 3 ОП БОНУСНЫЙ УРОК](/Theory/urok-3-op-bonusnyy-urok)
- [Урок 4. Блондирование очень темных и азиатских волос. Двойное блондирование](/Theory/urok-4-blondirovanie-ochen-temnyh-i-aziatskih-volos-dvoynoe-blondirovanie)
- [Урок 5. Блондирование корней разной длины. Блондирование неоднородных баз с пятнами и полосами](/Theory/urok-5-blondirovanie-korney-raznoy-dliny-blondirovanie-neodnorodnyh-baz-s-pyatna)
- [Урок 6. Блондирование осветлённых волос. Блондирование седых волос](/Theory/urok-6-blondirovanie-osvetlennyh-volos-blondirovanie-sedyh-volos)
- [Урок 7. Дополнительное тепло при блондировании. Время выдержки. Постобработка](/Theory/urok-7-dopolnitelnoe-teplo-pri-blondirovanii-vremya-vyderzhki-postobrabotka)

### тонирование
- [Урок 1. Выбор красителя и окислителя при тонировании. Правильное нанесение при тонировании. Время выдержки. Последующий уход.](/Theory/urok-1-vybor-krasitelya-i-okislitelya-pri-tonirovanii-pravilnoe-nanesenie-pri-to)
- [Урок 2. Нейтрализация желтого и желто-оранжевого ФО. Индивидуальное портфолио колориста.](/Theory/urok-2-neitralizatsiya-zheltogo-i-zhelto-oranzhevogo-fo-individualnoe-portfolio-)
- [Урок 3. Тонирование блондированных волос холодными оттенками. Тонирование тепло-холодными и теплыми оттенками.](/Theory/urok-3-tonirovanie-blondirovannyh-volos-holodnymi-ottenkami-tonirovanie-teplo-ho)
- [Урок_4_Предотвращение_нежелательных_оттенков_при_тонировании_](/Theory/urok-4-predotvrashchenie-nezhelatelnyh-ottenkov-pri-tonirovanii)
- [Урок_5_Выравнивание_неоднородной_базы_при_тонировании_Репигментация](/Theory/urok-5-vyravnivanie-neodnorodnoi-bazy-pri-tonirovanii-repigmentatsiya)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Урок 1](/Theory/urok-1)
- [Урок 10 Изучите блондирование на 12% окислителе. Проанализируете плюсы и минусы этого метода.](/Theory/urok-10-izuchite-blondirovanie-na-12-okislitele-proanaliziruete-plyusy-i-minusy-etogo-metoda)
- [Урок 11 Получите классификацию блондирующих препаратов по содержанию аммиака по выбору техник по степени осветления.](/Theory/urok-11-poluchite-klassifikatsiyu-blondiruyushchih-preparatov-po-soderzhaniyu-ammiaka-po-vyboru-tehnik-po-stepeni-osvetleniya)
- [Урок 12 Поймете как смешивать продукт чтобы оптимизировать расходы.](/Theory/urok-12-poimete-kak-smeshivat-produkt-chtoby-optimizirovat-rashody)
- [Урок 13 Узнаете как избегать ожога кожи. Поймете что делать если все-таки ожог произошел.](/Theory/urok-13-uznaete-kak-izbegat-ozhoga-kozhi-poimete-chto-delat-esli-vse-taki-ozhog-proizoshel)
- [Урок 14 Изучите целесообразность добавок в обесцвечивающий порошок вазелин минеральное масло протеины](/Theory/urok-14-izuchite-tselesoobraznost-dobavok-v-obestsvechivayushchii-poroshok-vazelin-mineralnoe-maslo-proteiny)
- [Урок 15 Научитесь правильно задавать вопросы для анализа. Получите список из 14 обязательных пунктов необходимых для диалога с клиентом](/Theory/urok-15-nauchites-pravilno-zadavat-voprosy-dlya-analiza-poluchite-spisok-iz-14-obyazatelnyh-punktov-neobhodimyh-dlya-dialoga-s-klientom)
- [Урок 16 Образец правильно заполненного технического технического досье. Памятка по уходу (как продавать, не продавая)](/Theory/urok-16-obrazets-pravilno-zapolnennogo-tehnicheskogo-tehnicheskogo-dose-pamyatka-po-uhodu-kak-prodavat-ne-prodavaya)
- [Урок 2 Узнаете, как легко подготовить или как приобрести тестовые пряди. Научитесь создавать личную библиотеку блондиньеро – портфолио оттенков для тонирования.](/Theory/urok-2-uznaete-kak-legko-podgotovit-ili-kak-priobresti-testovye-pryadi-nauchites-sozdavat-lichnuyu-biblioteku-blondinero-portfolio-ottenkov-dlya-tonirovaniya)
- [Урок 3 Изучите натуральные пигменты. Поймете разницу между влиянием эумеланина и феомеланина на результат осветления и блондирования.](/Theory/urok-3-izuchite-naturalnye-pigmenty-poimete-raznitsu-mezhdu-vliyaniem-eumelanina-i-feomelanina-na-rezultat-osvetleniya-i-blondirovaniya)
- [Урок 4 Усвоите как протекает процесс окрашивания с осветлением и как протекает процесс блондирования.](/Theory/urok-4-usvoite-kak-protekaet-protsess-okrashivaniya-s-osvetleniem-i-kak-protekaet-protsess-blondirovaniya)
- [Урок 5 Изучите ровни глубины тона и фоны осветления. Научитесь понимать характер каждого оттенка без привязки к бренду.](/Theory/urok-5-izuchite-rovni-glubiny-tona-i-fony-osvetleniya-nauchites-ponimat-harakter-kazhdogo-ottenka-bez-privyazki-k-brendu)
- [Урок 6 Получите шкалу УГТ и ФО, поймете их влияние на результат тонирования, узнаете про идеальный фон осветления.](/Theory/urok-6-poluchite-shkalu-ugt-i-fo-poimete-ih-vliyanie-na-rezultat-tonirovaniya-uznaete-pro-idealnyi-fon-osvetleniya)
- [Урок 7 Приобретете глубинное понимание и навыки работы с цветовым кругом. Изучите правила колористики и их практическое применение при тонировании.](/Theory/urok-7-priobretete-glubinnoe-ponimanie-i-navyki-raboty-s-tsvetovym-krugom-izuchite-pravila-koloristiki-i-ih-prakticheskoe-primenenie-pri-tonirovanii)
- [Урок 8 На понятных примерах безупречно освоите реакцию нейтрализации нежелательных фонов осветления - желтого и желто-оранжевого.](/Theory/urok-8-na-ponyatnyh-primerah-bezuprechno-osvoite-reaktsiyu-neitralizatsii-nezhelatelnyh-fonov-osvetleniya-zheltogo-i-zhelto-oranzhevogo)
- [Урок 8](/Theory/urok-8)
- [Урок 9 Поймете значение рН при блондировании и окрашивании и его влияние на белковую структуру волос.](/Theory/urok-9-poimete-znachenie-rn-pri-blondirovanii-i-okrashivanii-i-ego-vliyanie-na-belkovuyu-strukturu-volos)

### блондирование
- [Урок 1. Подготовка клиента к блондированию](/Theory/urok-1-podgotovka-klienta-k-blondirovaniyu)
- [Урок 2. 4 зоны осветления. Выбор % окислителя. Первичное осветление натуральных волос](/Theory/urok-2-4-zony-osvetleniya-vybor-okislitelya-pervichnoe-osvetlenie-naturalnyh-volos)
- [Урок 3 ОП БОНУСНЫЙ УРОК](/Theory/urok-3-op-bonusnyy-urok)
- [Урок 4. Блондирование очень темных и азиатских волос. Двойное блондирование](/Theory/urok-4-blondirovanie-ochen-temnyh-i-aziatskih-volos-dvoynoe-blondirovanie)
- [Урок 5. Блондирование корней разной длины. Блондирование неоднородных баз с пятнами и полосами](/Theory/urok-5-blondirovanie-korney-raznoy-dliny-blondirovanie-neodnorodnyh-baz-s-pyatnami-i-polosami)
- [Урок 6. Блондирование осветлённых волос. Блондирование седых волос](/Theory/urok-6-blondirovanie-osvetlennyh-volos-blondirovanie-sedyh-volos)
- [Урок 7. Дополнительное тепло при блондировании. Время выдержки. Постобработка](/Theory/urok-7-dopolnitelnoe-teplo-pri-blondirovanii-vremya-vyderzhki-postobrabotka)

### тонирование
- [Урок 1. Выбор красителя и окислителя при тонировании. Правильное нанесение при тонировании. Время выдержки. Последующий уход.](/Theory/urok-1-vybor-krasitelya-i-okislitelya-pri-tonirovanii-pravilnoe-nanesenie-pri-tonirovanii-vremya-vyderzhki-posleduyushchii-uhod)
- [Урок 2. Нейтрализация желтого и желто-оранжевого ФО. Индивидуальное портфолио колориста.](/Theory/urok-2-neitralizatsiya-zheltogo-i-zhelto-oranzhevogo-fo-individualnoe-portfolio-kolorista)
- [Урок 3. Тонирование блондированных волос холодными оттенками. Тонирование тепло-холодными и теплыми оттенками.](/Theory/urok-3-tonirovanie-blondirovannyh-volos-holodnymi-ottenkami-tonirovanie-teplo-holodnymi-i-teplymi-ottenkami)
- [Урок_4_Предотвращение_нежелательных_оттенков_при_тонировании_](/Theory/urok-4-predotvrashchenie-nezhelatelnyh-ottenkov-pri-tonirovanii)
- [Урок_5_Выравнивание_неоднородной_базы_при_тонировании_Репигментация](/Theory/urok-5-vyravnivanie-neodnorodnoi-bazy-pri-tonirovanii-repigmentatsiya)

### ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)
- [Урок 1](/Theory/urok-1)
- [Урок 10 Изучите блондирование на 12% окислителе. Проанализируете плюсы и минусы этого метода.](/Theory/urok-10-izuchite-blondirovanie-na-12-okislitele-proanaliziruete-plyusy-i-minusy-etogo-metoda)
- [Урок 11 Получите классификацию блондирующих препаратов по содержанию аммиака по выбору техник по степени осветления.](/Theory/urok-11-poluchite-klassifikatsiyu-blondiruyushchih-preparatov-po-soderzhaniyu-ammiaka-po-vyboru-tehnik-po-stepeni-osvetleniya)
- [Урок 12 Поймете как смешивать продукт чтобы оптимизировать расходы.](/Theory/urok-12-poimete-kak-smeshivat-produkt-chtoby-optimizirovat-rashody)
- [Урок 13 Узнаете как избегать ожога кожи. Поймете что делать если все-таки ожог произошел.](/Theory/urok-13-uznaete-kak-izbegat-ozhoga-kozhi-poimete-chto-delat-esli-vse-taki-ozhog-proizoshel)
- [Урок 14 Изучите целесообразность добавок в обесцвечивающий порошок вазелин минеральное масло протеины](/Theory/urok-14-izuchite-tselesoobraznost-dobavok-v-obestsvechivayushchii-poroshok-vazelin-mineralnoe-maslo-proteiny)
- [Урок 15 Научитесь правильно задавать вопросы для анализа. Получите список из 14 обязательных пунктов необходимых для диалога с клиентом](/Theory/urok-15-nauchites-pravilno-zadavat-voprosy-dlya-analiza-poluchite-spisok-iz-14-obyazatelnyh-punktov-neobhodimyh-dlya-dialoga-s-klientom)
- [Урок 16 Образец правильно заполненного технического технического досье. Памятка по уходу (как продавать, не продавая)](/Theory/urok-16-obrazets-pravilno-zapolnennogo-tehnicheskogo-tehnicheskogo-dose-pamyatka-po-uhodu-kak-prodavat-ne-prodavaya)
- [Урок 2 Узнаете, как легко подготовить или как приобрести тестовые пряди. Научитесь создавать личную библиотеку блондиньеро – портфолио оттенков для тонирования.](/Theory/urok-2-uznaete-kak-legko-podgotovit-ili-kak-priobresti-testovye-pryadi-nauchites-sozdavat-lichnuyu-biblioteku-blondinero-portfolio-ottenkov-dlya-tonirovaniya)
- [Урок 3 Изучите натуральные пигменты. Поймете разницу между влиянием эумеланина и феомеланина на результат осветления и блондирования.](/Theory/urok-3-izuchite-naturalnye-pigmenty-poimete-raznitsu-mezhdu-vliyaniem-eumelanina-i-feomelanina-na-rezultat-osvetleniya-i-blondirovaniya)
- [Урок 4 Усвоите как протекает процесс окрашивания с осветлением и как протекает процесс блондирования.](/Theory/urok-4-usvoite-kak-protekaet-protsess-okrashivaniya-s-osvetleniem-i-kak-protekaet-protsess-blondirovaniya)
- [Урок 5 Изучите ровни глубины тона и фоны осветления. Научитесь понимать характер каждого оттенка без привязки к бренду.](/Theory/urok-5-izuchite-rovni-glubiny-tona-i-fony-osvetleniya-nauchites-ponimat-harakter-kazhdogo-ottenka-bez-privyazki-k-brendu)
- [Урок 6 Получите шкалу УГТ и ФО, поймете их влияние на результат тонирования, узнаете про идеальный фон осветления.](/Theory/urok-6-poluchite-shkalu-ugt-i-fo-poimete-ih-vliyanie-na-rezultat-tonirovaniya-uznaete-pro-idealnyi-fon-osvetleniya)
- [Урок 7 Приобретете глубинное понимание и навыки работы с цветовым кругом. Изучите правила колористики и их практическое применение при тонировании.](/Theory/urok-7-priobretete-glubinnoe-ponimanie-i-navyki-raboty-s-tsvetovym-krugom-izuchite-pravila-koloristiki-i-ih-prakticheskoe-primenenie-pri-tonirovanii)
- [Урок 8 На понятных примерах безупречно освоите реакцию нейтрализации нежелательных фонов осветления - желтого и желто-оранжевого.](/Theory/urok-8-na-ponyatnyh-primerah-bezuprechno-osvoite-reaktsiyu-neitralizatsii-nezhelatelnyh-fonov-osvetleniya-zheltogo-i-zhelto-oranzhevogo)
- [Урок 8](/Theory/urok-8)
- [Урок 9 Поймете значение рН при блондировании и окрашивании и его влияние на белковую структуру волос.](/Theory/urok-9-poimete-znachenie-rn-pri-blondirovanii-i-okrashivanii-i-ego-vliyanie-na-belkovuyu-strukturu-volos)

### блондирование
- [Урок 1. Подготовка клиента к блондированию](/Theory/urok-1-podgotovka-klienta-k-blondirovaniyu)
- [Урок 2. 4 зоны осветления. Выбор % окислителя. Первичное осветление натуральных волос](/Theory/urok-2-4-zony-osvetleniya-vybor-okislitelya-pervichnoe-osvetlenie-naturalnyh-volos)
- [Урок 3 ОП БОНУСНЫЙ УРОК](/Theory/urok-3-op-bonusnyy-urok)
- [Урок 4. Блондирование очень темных и азиатских волос. Двойное блондирование](/Theory/urok-4-blondirovanie-ochen-temnyh-i-aziatskih-volos-dvoynoe-blondirovanie)
- [Урок 5. Блондирование корней разной длины. Блондирование неоднородных баз с пятнами и полосами](/Theory/urok-5-blondirovanie-korney-raznoy-dliny-blondirovanie-neodnorodnyh-baz-s-pyatnami-i-polosami)
- [Урок 6. Блондирование осветлённых волос. Блондирование седых волос](/Theory/urok-6-blondirovanie-osvetlennyh-volos-blondirovanie-sedyh-volos)
- [Урок 7. Дополнительное тепло при блондировании. Время выдержки. Постобработка](/Theory/urok-7-dopolnitelnoe-teplo-pri-blondirovanii-vremya-vyderzhki-postobrabotka)

### тонирование
- [Урок 1. Выбор красителя и окислителя при тонировании. Правильное нанесение при тонировании. Время выдержки. Последующий уход.](/Theory/urok-1-vybor-krasitelya-i-okislitelya-pri-tonirovanii-pravilnoe-nanesenie-pri-tonirovanii-vremya-vyderzhki-posleduyushchii-uhod)
- [Урок 2. Нейтрализация желтого и желто-оранжевого ФО. Индивидуальное портфолио колориста.](/Theory/urok-2-neitralizatsiya-zheltogo-i-zhelto-oranzhevogo-fo-individualnoe-portfolio-kolorista)
- [Урок 3. Тонирование блондированных волос холодными оттенками. Тонирование тепло-холодными и теплыми оттенками.](/Theory/urok-3-tonirovanie-blondirovannyh-volos-holodnymi-ottenkami-tonirovanie-teplo-holodnymi-i-teplymi-ottenkami)

### блондирование
- [Урок 1. Подготовка клиента к блондированию](/Theory/urok-1-podgotovka-klienta-k-blondirovaniyu)
- [Урок 2. 4 зоны осветления. Выбор % окислителя. Первичное осветление натуральных волос](/Theory/urok-2-4-zony-osvetleniya-vybor-okislitelya-pervichnoe-osvetlenie-naturalnyh-volos)
- [Урок 3 ОП БОНУСНЫЙ УРОК](/Theory/urok-3-op-bonusnyy-urok)
- [Урок 4. Блондирование очень темных и азиатских волос. Двойное блондирование](/Theory/urok-4-blondirovanie-ochen-temnyh-i-aziatskih-volos-dvoynoe-blondirovanie)
- [Урок 5. Блондирование корней разной длины. Блондирование неоднородных баз с пятнами и полосами](/Theory/urok-5-blondirovanie-korney-raznoy-dliny-blondirovanie-neodnorodnyh-baz-s-pyatnami-i-polosami)
- [Урок 6. Блондирование осветлённых волос. Блондирование седых волос](/Theory/urok-6-blondirovanie-osvetlennyh-volos-blondirovanie-sedyh-volos)
- [Урок 7. Дополнительное тепло при блондировании. Время выдержки. Постобработка](/Theory/urok-7-dopolnitelnoe-teplo-pri-blondirovanii-vremya-vyderzhki-postobrabotka)

### тонирование


