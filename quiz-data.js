// ============================================================
// ДАННЫЕ КВИЗА
// Часть 1: вручную написанные вопросы (приоритет, идут первыми).
// Часть 2: автогенерация вопросов из GRAPH_DATA — покрывает
//          все узлы группы "shape", чтобы тест рос вместе с графом.
// ============================================================

// ---------- 1. РУЧНЫЕ ВОПРОСЫ ----------
// Добавляй сюда свои вопросы в любой момент — формат ниже.
// correctIndex — индекс правильного варианта в массиве options (с нуля).
const MANUAL_QUIZ_QUESTIONS = [
  {
    question: "Сколько сторон у многоугольника?",
    options: ["Меньше трёх", "Три и больше", "Только четыре", "Любое чётное число"],
    correctIndex: 1,
    explanation: "Многоугольник — это замкнутая фигура из отрезков, и минимальное число сторон, при котором фигура замыкается, равно трём (треугольник)."
  },
  {
    question: "Что объединяет квадрат и ромб?",
    options: [
      "У обоих все углы прямые",
      "У обоих все стороны равны",
      "У обоих нет диагоналей",
      "Оба не имеют осей симметрии"
    ],
    correctIndex: 1,
    explanation: "И квадрат, и ромб — четырёхугольники с четырьмя равными сторонами. Разница в углах: у квадрата они всегда прямые, у ромба — не обязательно."
  }
];

// ---------- 2. АВТОГЕНЕРАЦИЯ ИЗ GRAPH_DATA ----------
// Строит вопросы на основе area/perimeter/props/desc каждого узла
// группы "shape". Дистракторы (неверные варианты) берутся из
// соседних узлов той же группы, чтобы быть правдоподобными, но неверными.

function cleanLabel(label) {
  return label.replace(/\n/g, ' ');
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Возвращает N случайных "чужих" узлов той же группы shape, кроме excludeId.
// Опциональный valueKey + excludeValue отфильтровывает узлы, у которых значение
// этого поля текстуально совпадает со значением исходного узла (чтобы не получить
// два одинаковых варианта ответа, например "P = 4a" у квадрата и ромба).
function pickDistractors(excludeId, count, pool, valueKey, excludeValue) {
  let candidates = pool.filter(n => n.id !== excludeId);
  if (valueKey && excludeValue) {
    candidates = candidates.filter(n => n[valueKey] !== excludeValue);
  }
  return shuffleArray(candidates).slice(0, count);
}

// Убирает дубли по тексту, сохраняя порядок первого появления
function dedupeByText(arr) {
  const seen = new Set();
  const out = [];
  arr.forEach(item => {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  });
  return out;
}

function buildAutoQuestions(graphData) {
  const shapeNodes = graphData.nodes.filter(n => n.group === 'shape');
  const questions = [];

  shapeNodes.forEach(node => {
    const distractorPool = shapeNodes;

    // --- Вопрос по площади (если есть area) ---
    if (node.area) {
      const distractors = pickDistractors(node.id, 6, distractorPool, 'area', node.area)
        .map(d => d.area)
        .filter(Boolean);
      const uniqueDistractors = dedupeByText(distractors).slice(0, 3);
      if (uniqueDistractors.length >= 2) {
        const options = shuffleArray([node.area, ...uniqueDistractors]);
        questions.push({
          question: `Как вычисляется площадь фигуры «${cleanLabel(node.label)}»?`,
          options,
          correctIndex: options.indexOf(node.area),
          explanation: node.desc
        });
      }
    }

    // --- Вопрос по периметру (если есть perimeter) ---
    if (node.perimeter) {
      const distractors = pickDistractors(node.id, 6, distractorPool, 'perimeter', node.perimeter)
        .map(d => d.perimeter)
        .filter(Boolean);
      const uniqueDistractors = dedupeByText(distractors).slice(0, 3);
      if (uniqueDistractors.length >= 2) {
        const options = shuffleArray([node.perimeter, ...uniqueDistractors]);
        questions.push({
          question: `Как вычисляется периметр фигуры «${cleanLabel(node.label)}»?`,
          options,
          correctIndex: options.indexOf(node.perimeter),
          explanation: node.desc
        });
      }
    }

    // --- Вопрос "какой фигуре принадлежит это свойство" ---
    if (node.props && node.props.length > 0) {
      const propText = node.props[0];
      const distractors = pickDistractors(node.id, 6, distractorPool);
      if (distractors.length >= 2) {
        const optionLabels = dedupeByText(shuffleArray([
          cleanLabel(node.label),
          ...distractors.slice(0, 3).map(d => cleanLabel(d.label))
        ]));
        questions.push({
          question: `Какому утверждению соответствует факт: «${propText}»?`,
          options: optionLabels,
          correctIndex: optionLabels.indexOf(cleanLabel(node.label)),
          explanation: node.desc
        });
      }
    }

    // --- Вопрос "по описанию определи фигуру" ---
    if (node.desc) {
      const distractors = pickDistractors(node.id, 6, distractorPool);
      if (distractors.length >= 2) {
        const optionLabels = dedupeByText(shuffleArray([
          cleanLabel(node.label),
          ...distractors.slice(0, 3).map(d => cleanLabel(d.label))
        ]));
        questions.push({
          question: `О какой фигуре идёт речь: «${node.desc}»?`,
          options: optionLabels,
          correctIndex: optionLabels.indexOf(cleanLabel(node.label)),
          explanation: `Эйброу узла: ${node.eyebrow || ''}`.trim()
        });
      }
    }
  });

  return questions;
}

// ---------- 3. СБОРКА ИТОГОВОГО ПУЛА ВОПРОСОВ ----------
// Ручные вопросы идут первыми, затем автогенерированные.
// Если у узла недостаточно "соседей" для дистракторов — вопрос просто не создаётся,
// так что добавление новых узлов в граф автоматически расширяет квиз без правок здесь.

function getAllQuizQuestions() {
  const auto = buildAutoQuestions(GRAPH_DATA);
  return [...MANUAL_QUIZ_QUESTIONS, ...auto];
}

// Возвращает случайную выборку из N вопросов (по умолчанию 8) из всего пула.
// Ручные вопросы получают приоритет (всегда попадают в выборку, если их мало).
function getQuizSet(count = 8) {
  const manual = MANUAL_QUIZ_QUESTIONS;
  const auto = shuffleArray(buildAutoQuestions(GRAPH_DATA));

  const combined = [...manual, ...auto];
  if (combined.length <= count) return combined;

  // оставляем все ручные + дополняем случайными авто до нужного количества
  const remaining = count - manual.length;
  if (remaining <= 0) return shuffleArray(manual).slice(0, count);

  return shuffleArray([...manual, ...auto.slice(0, remaining)]);
}