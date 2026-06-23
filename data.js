// ============================================================
// ДАННЫЕ ГРАФА: геометрические фигуры
// Каждый узел: id, label, group (root | category | shape), info
// ============================================================

const GRAPH_DATA = {
  nodes: [
    // --- ROOT ---
    {
      id: "root",
      label: "Плоские\nфигуры",
      group: "root",
      eyebrow: "Начало карты",
      desc: "Геометрическая фигура — это множество точек плоскости, ограниченное линиями. Карта ниже показывает, как простые формы складываются в семьи: многоугольники, кривые и их особые случаи.",
      svg: null,
      props: [
        "Изучается планиметрией — разделом геометрии о плоских фигурах",
        "Каждая фигура имеет периметр (длину границы) и площадь (величину занимаемого пространства)"
      ]
    },

    // --- CATEGORIES ---
    {
      id: "polygons",
      label: "Многоугольники",
      group: "category",
      eyebrow: "Категория",
      desc: "Многоугольник — замкнутая фигура, образованная отрезками прямых (сторонами), соединёнными в вершинах. Чем больше сторон, тем ближе многоугольник по форме к окружности.",
      svg: null,
      props: [
        "Сумма углов n-угольника равна (n − 2) × 180°",
        "Бывают выпуклые и невыпуклые",
        "Правильный многоугольник — все стороны и углы равны"
      ]
    },
    {
      id: "triangles",
      label: "Треугольники",
      group: "category",
      eyebrow: "Категория",
      desc: "Треугольник — многоугольник с тремя сторонами и тремя вершинами. Самая жёсткая из плоских фигур: три стороны однозначно задают её форму.",
      svg: null,
      props: [
        "Сумма углов всегда равна 180°",
        "Классифицируются по сторонам и по углам"
      ]
    },
    {
      id: "quadrilaterals",
      label: "Четырёхугольники",
      group: "category",
      eyebrow: "Категория",
      desc: "Четырёхугольник — многоугольник с четырьмя сторонами. Сумма его внутренних углов всегда равна 360°.",
      svg: null,
      props: [
        "Сумма углов равна 360°",
        "Делятся на параллелограммы и не-параллелограммы"
      ]
    },
    {
      id: "circles_group",
      label: "Окружность\nи круг",
      group: "category",
      eyebrow: "Категория",
      desc: "Окружность — множество точек, равноудалённых от центра. Круг — часть плоскости внутри окружности. Единственная фигура без углов и сторон.",
      svg: null,
      props: [
        "Отношение длины окружности к диаметру равно числу π",
        "Имеет максимальную площадь при фиксированном периметре"
      ]
    },
    {
      id: "polygons_regular",
      label: "Правильные\nмногоугольники",
      group: "category",
      eyebrow: "Категория",
      desc: "Правильные многоугольники с числом сторон от пяти и выше — переходное звено между многоугольниками и окружностью.",
      svg: null,
      props: [
        "Все вписываются в окружность",
        "При n → ∞ форма стремится к кругу"
      ]
    },

    // --- TRIANGLES ---
    {
      id: "equilateral",
      label: "Равносторонний\nтреугольник",
      group: "shape",
      eyebrow: "Треугольник",
      desc: "Все три стороны равны, все углы равны 60°. Самый симметричный из треугольников — три оси симметрии.",
      svg: "triangle_equilateral",
      area: "S = (√3 / 4) × a²",
      perimeter: "P = 3a",
      props: [
        "Все углы равны 60°",
        "Высота, медиана и биссектриса из любой вершины совпадают",
        "a — длина стороны"
      ]
    },
    {
      id: "isosceles",
      label: "Равнобедренный\nтреугольник",
      group: "shape",
      eyebrow: "Треугольник",
      desc: "Две стороны (боковые) равны между собой, углы при основании также равны. Имеет одну ось симметрии.",
      svg: "triangle_isosceles",
      area: "S = (b / 4) × √(4a² − b²)",
      perimeter: "P = 2a + b",
      props: [
        "a — боковая сторона, b — основание",
        "Углы при основании равны"
      ]
    },
    {
      id: "right_triangle",
      label: "Прямоугольный\nтреугольник",
      group: "shape",
      eyebrow: "Треугольник",
      desc: "Один из углов равен 90°. Стороны, образующие прямой угол, — катеты; сторона напротив — гипотенуза.",
      svg: "triangle_right",
      area: "S = (a × b) / 2",
      perimeter: "P = a + b + c",
      props: [
        "a, b — катеты, c — гипотенуза",
        "Теорема Пифагора: a² + b² = c²"
      ]
    },
    {
      id: "scalene",
      label: "Разностороний\nтреугольник",
      group: "shape",
      eyebrow: "Треугольник",
      desc: "Все три стороны и все три угла различны. Нет осей симметрии.",
      svg: "triangle_scalene",
      area: "S = √(p(p−a)(p−b)(p−c)), где p = (a+b+c)/2",
      perimeter: "P = a + b + c",
      props: [
        "Формула Герона для площади через полупериметр p",
        "Самый общий случай треугольника"
      ]
    },

    // --- QUADRILATERALS ---
    {
      id: "square",
      label: "Квадрат",
      group: "shape",
      eyebrow: "Четырёхугольник",
      desc: "Все четыре стороны равны, все углы равны 90°. Частный случай и прямоугольника, и ромба одновременно.",
      svg: "square",
      area: "S = a²",
      perimeter: "P = 4a",
      props: [
        "Диагонали равны и пересекаются под 90°",
        "Четыре оси симметрии",
        "a — длина стороны"
      ]
    },
    {
      id: "rectangle",
      label: "Прямоугольник",
      group: "shape",
      eyebrow: "Четырёхугольник",
      desc: "Противоположные стороны равны и параллельны, все углы равны 90°.",
      svg: "rectangle",
      area: "S = a × b",
      perimeter: "P = 2(a + b)",
      props: [
        "Диагонали равны между собой",
        "a, b — длины сторон"
      ]
    },
    {
      id: "rhombus",
      label: "Ромб",
      group: "shape",
      eyebrow: "Четырёхугольник",
      desc: "Все четыре стороны равны, но углы не обязательно прямые. Диагонали пересекаются под прямым углом и делят углы ромба пополам.",
      svg: "rhombus",
      area: "S = (d₁ × d₂) / 2",
      perimeter: "P = 4a",
      props: [
        "d₁, d₂ — диагонали, a — сторона",
        "Диагонали взаимно перпендикулярны"
      ]
    },
    {
      id: "parallelogram",
      label: "Параллелограмм",
      group: "shape",
      eyebrow: "Четырёхугольник",
      desc: "Противоположные стороны попарно параллельны и равны. Общий случай для прямоугольника, ромба и квадрата.",
      svg: "parallelogram",
      area: "S = a × h",
      perimeter: "P = 2(a + b)",
      props: [
        "a — основание, h — высота, b — боковая сторона",
        "Диагонали делят друг друга пополам в точке пересечения"
      ]
    },
    {
      id: "trapezoid",
      label: "Трапеция",
      group: "shape",
      eyebrow: "Четырёхугольник",
      desc: "Ровно одна пара сторон параллельна (основания), другая пара — боковые стороны.",
      svg: "trapezoid",
      area: "S = ((a + b) / 2) × h",
      perimeter: "P = a + b + c + d",
      props: [
        "a, b — основания (параллельные стороны), h — высота",
        "Равнобедренная трапеция имеет ось симметрии"
      ]
    },

    // --- CIRCLES ---
    {
      id: "circle",
      label: "Круг",
      group: "shape",
      eyebrow: "Окружность",
      desc: "Часть плоскости, ограниченная окружностью. Не имеет ни углов, ни прямых сторон — бесконечная ось симметрии.",
      svg: "circle",
      area: "S = π × r²",
      perimeter: "L = 2 × π × r",
      props: [
        "r — радиус",
        "При равном периметре имеет наибольшую площадь среди всех фигур"
      ]
    },
    {
      id: "semicircle",
      label: "Полукруг",
      group: "shape",
      eyebrow: "Окружность",
      desc: "Половина круга, отделённая диаметром. Граница состоит из дуги и отрезка-диаметра.",
      svg: "semicircle",
      area: "S = (π × r²) / 2",
      perimeter: "P = π × r + 2r",
      props: [
        "r — радиус исходного круга",
        "Вписанный угол, опирающийся на диаметр, всегда равен 90°"
      ]
    },
    {
      id: "ellipse",
      label: "Эллипс",
      group: "shape",
      eyebrow: "Окружность",
      desc: "Овальная кривая — растянутая окружность с двумя полуосями вместо одного радиуса.",
      svg: "ellipse",
      area: "S = π × a × b",
      perimeter: "P ≈ π × (3(a+b) − √((3a+b)(a+3b)))",
      props: [
        "a, b — большая и малая полуоси",
        "Окружность — частный случай эллипса при a = b"
      ]
    },

    // --- REGULAR POLYGONS ---
    {
      id: "pentagon",
      label: "Пятиугольник",
      group: "shape",
      eyebrow: "Правильный многоугольник",
      desc: "Правильный многоугольник с пятью равными сторонами и углами по 108°.",
      svg: "pentagon",
      area: "S = (5a² ) / (4 × tan(36°))",
      perimeter: "P = 5a",
      props: [
        "a — длина стороны",
        "Каждый внутренний угол равен 108°"
      ]
    },
    {
      id: "hexagon",
      label: "Шестиугольник",
      group: "shape",
      eyebrow: "Правильный многоугольник",
      desc: "Правильный многоугольник с шестью сторонами. Единственный многоугольник, который замощает плоскость без зазоров вместе с треугольниками и квадратами.",
      svg: "hexagon",
      area: "S = (3√3 / 2) × a²",
      perimeter: "P = 6a",
      props: [
        "a — длина стороны",
        "Каждый внутренний угол равен 120°",
        "Встречается в сотах пчёл как самая экономная форма"
      ]
    },
    {
      id: "octagon",
      label: "Восьмиугольник",
      group: "shape",
      eyebrow: "Правильный многоугольник",
      desc: "Правильный многоугольник с восемью сторонами, визуально близкий к окружности.",
      svg: "octagon",
      area: "S = 2(1 + √2) × a²",
      perimeter: "P = 8a",
      props: [
        "a — длина стороны",
        "Каждый внутренний угол равен 135°"
      ]
    }
  ],

  // Связи: from -> to
  links: [
    { source: "root", target: "polygons" },
    { source: "root", target: "circles_group" },

    { source: "polygons", target: "triangles" },
    { source: "polygons", target: "quadrilaterals" },
    { source: "polygons", target: "polygons_regular" },

    { source: "triangles", target: "equilateral" },
    { source: "triangles", target: "isosceles" },
    { source: "triangles", target: "right_triangle" },
    { source: "triangles", target: "scalene" },

    { source: "quadrilaterals", target: "square" },
    { source: "quadrilaterals", target: "rectangle" },
    { source: "quadrilaterals", target: "rhombus" },
    { source: "quadrilaterals", target: "parallelogram" },
    { source: "quadrilaterals", target: "trapezoid" },

    { source: "circles_group", target: "circle" },
    { source: "circles_group", target: "semicircle" },
    { source: "circles_group", target: "ellipse" },

    { source: "polygons_regular", target: "pentagon" },
    { source: "polygons_regular", target: "hexagon" },
    { source: "polygons_regular", target: "octagon" },

    // Дополнительные смысловые связи между листьями (как "wiki-links")
    { source: "square", target: "rhombus" },
    { source: "square", target: "rectangle" },
    { source: "rectangle", target: "parallelogram" },
    { source: "rhombus", target: "parallelogram" },
    { source: "equilateral", target: "hexagon" },
    { source: "circle", target: "semicircle" },
    { source: "circle", target: "ellipse" },
    { source: "right_triangle", target: "square" },
    { source: "pentagon", target: "hexagon" },
    { source: "hexagon", target: "octagon" }
  ]
};

// Карта "связанные фигуры" для панели (выводим соседей по графу, кроме родителя/категории)
function getRelated(nodeId) {
  const related = new Set();
  GRAPH_DATA.links.forEach(l => {
    if (l.source === nodeId) related.add(l.target);
    if (l.target === nodeId) related.add(l.source);
  });
  return Array.from(related);
}