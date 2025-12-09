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

### блондирование
- [Урок 1. Подготовка клиента к блондированию](/Theory/urok-1-podgotovka-klienta-k-blondirovaniyu)
- [Урок 2. 4 зоны осветления. Выбор % окислителя. Первичное осветление натуральных волос](/Theory/urok-2-4-zony-osvetleniya-vybor-okislitelya-pervichnoe-osvetlenie-naturalnyh-volos)
- [Урок 3 ОП БОНУСНЫЙ УРОК](/Theory/urok-3-op-bonusnyy-urok)
- [Урок 4. Блондирование очень темных и азиатских волос. Двойное блондирование](/Theory/urok-4-blondirovanie-ochen-temnyh-i-aziatskih-volos-dvoynoe-blondirovanie)
- [Урок 5. Блондирование корней разной длины. Блондирование неоднородных баз с пятнами и полосами](/Theory/urok-5-blondirovanie-korney-raznoy-dliny-blondirovanie-neodnorodnyh-baz-s-pyatnami-i-polosami)
- [Урок 6. Блондирование осветлённых волос. Блондирование седых волос](/Theory/urok-6-blondirovanie-osvetlennyh-volos-blondirovanie-sedyh-volos)
- [Урок 7. Дополнительное тепло при блондировании. Время выдержки. Постобработка](/Theory/urok-7-dopolnitelnoe-teplo-pri-blondirovanii-vremya-vyderzhki-postobrabotka)

### тонирование


