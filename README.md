# React drawboard
**Деплой**: [https://react-drawboard.vercel.app/](https://react-drawboard.vercel.app/)

![Drawboard screenshot](./assets/drwbrd.png)

### Библиотеки и технологии:
- react
- vite
- typescript
- rough.js
- perfect-freehand
- zustand
- @radix-ui

### Функции:
- [x] Рисунки карандашом
- [x] Различные элементы (круг, прямоугольник, треугольник, ромб, стрелка, текст, изображение)
- [x] Настройки рисования (цвет линии, ширина линии, стиль заливки фона и т. д.)
- [x] Адаптивный дизайн
- [x] Масштабирование на холсте
- [x] Экспорт рисунков в формате JSON
- [x] Отмена/повтор действий
- [x] i18n (русский, английский)
- [x] Экспорт рисунков в виде изображения
- [ ] Совместная работа
- [ ] Тесты
  

# Локальный запуск:
1. Запуск контейнера
```
docker compose -f ./deploy/docker-compose.yml up
```

2. Доступно на: `http://localhost:80`


