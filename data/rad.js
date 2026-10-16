/* ═══════════════════════════════════════════════════════
   R.A.D. PRACTICE — LESSONS AND PRACTICE ITEMS
   Learning, not testing (Marcos 10/15): "this group is not ready to fully
   write them. We must use this site for them to build their understanding
   and to see what good RAD answers look like."  So nothing here asks a
   student to type. Every activity opens with lesson cards, every question
   is answered by picking, and every answer ends with a finished R.A.D.
   answer in the class's color check (blue Restate, green Answer, red Detail).

   Source: RAD_Answers_Day1_v5 + Day2_v5 (OneDrive › AAA - Wonders Reading ›
   Wonders Reading ChatGPT Materials). The lesson's own models (favorite lunch,
   weekends, the class pet vote) appear ONLY on lesson cards, as reminders.
   Every practice question is new: none come from the worksheets, the
   homework, or R.A.D. Online Quiz 1.

   Item fields
     id      letter + number, unique on the site (M01, B07 …)
     skill   the skill the dashboard ranks (names match R.A.D. Online Quiz 1
             where the skill is the same, so practice and quiz line up)
     q       what the student is asked
     story   a short story to read first (optional)
     ask     the question being answered, shown in its own box (optional)
     shown   an answer to look at: text, or { R, A, D, mark } for Color-Check
     given   { R, A } — the start of an answer, shown in color (Pick the Detail)
     choices written with the RIGHT one first; the site shuffles them
     fixed   keep the choices in this order (R/A/D and the "what is missing" set)
     kinds   what each wrong choice is (detail and turnaround mistakes) —
             the site turns each kind into a short note that says why
     why     the teaching line shown after every answer
     model   { R, A, D, para } — the finished R.A.D. answer shown after
   Build and Look Back items are groups of steps: one question, built one
   part at a time; each step is its own scored item.
═══════════════════════════════════════════════════════ */

window.RAD_STEPS = [
  { key: 'R', name: 'Restate', tip: 'Turn the question around. Start with the key words.' },
  { key: 'A', name: 'Answer',  tip: 'Tell the answer clearly.' },
  { key: 'D', name: 'Detail',  tip: 'Tell more. Use a fact, a reason, or an example.' }
];

/* What a wrong choice did — said after the student picks it */
window.RAD_KIND_NOTES = {
  off:     'Off topic. This detail is not about the answer.',
  same:    'Same answer again. This detail tells nothing new.',
  vague:   'Too vague. This detail does not tell enough.',
  notext:  'Not from the story. Look back in the story for a detail.',
  because: 'Never start with Because. Start with the key words.',
  copy:    'Do not copy the whole question. Use only the key words.',
  oneword: 'One word is not enough. Start with the key words.',
  you:     'Change you to I. Change your to my.',
  noanswer:'This does not answer the question.',
  wrongtext:'Look back. The story does not say that.'
};

/* The question words and the kind of answer each one wants */
window.RAD_CLUES = [
  { word: 'Who',   wants: 'a person' },
  { word: 'What',  wants: 'a thing' },
  { word: 'Where', wants: 'a place' },
  { word: 'When',  wants: 'a time' },
  { word: 'Why',   wants: 'a reason' },
  { word: 'How',   wants: 'a way' }
];

/* The story for Look Back in the Story (original, numbered paragraphs) */
window.RAD_STORY = {
  title: 'The Big Snow Day',
  paragraphs: [
    'On a cold Tuesday in January, snow fell all night. In the morning, the news said there was no school. Maya cheered and ran to the window.',
    'Maya and her little brother Omar put on their boots, coats, and hats. They wanted to build the biggest snowman on their street.',
    'First, they rolled a big ball of snow for the bottom. Next, they rolled a smaller ball for the middle. Omar was too short to lift the head, so their neighbor, Mr. Diaz, helped him put the head on top.',
    'Maya used two rocks for the eyes and a carrot for the nose. Omar gave the snowman his old red scarf so the snowman would stay warm.',
    'When they were done, the snowman was taller than Maya. Mr. Diaz took a picture of the kids next to their snowman.'
  ]
};

window.RAD_ACTIVITIES = [

  /* ═══ 1 · MEET R.A.D. ═══════════════════════════════ */
  {
    kind: 'meet', letter: 'M', icon: '🎨', label: 'Meet R.A.D.', sub: 'What R, A, and D mean',
    cards: [
      { title: 'Make your answers R.A.D.', blocks: [
        { p: 'When you answer a question in writing, make your answer R.A.D.' },
        { steps: true },
        { p: 'Key words are the most important words in the question.' }
      ]},
      { title: 'Which answer tells the most?', blocks: [
        { ask: 'What is your favorite lunch?' },
        { bad: 'Pizza.', why: 'Only one word. No Restate. No Detail.' },
        { bad: 'My favorite lunch is pizza.', why: 'A Restate and an Answer. But no Detail yet.' },
        { good: 'My favorite lunch is pizza. I like it best when the cheese is melted and the crust is crunchy.', why: 'Restate, Answer, and Detail. This answer is R.A.D.!' }
      ]},
      { title: 'The color check', blocks: [
        { p: 'Good writers check each answer with three colors.' },
        { rows: [['R', 'A blue line shows the Restate.'], ['A', 'A green line shows the Answer.'], ['D', 'A red line shows the Detail.']] },
        { ask: 'What is your favorite lunch?' },
        { rad: { R: 'My favorite lunch is', A: 'pizza.', D: 'I like it best when the cheese is melted and the crust is crunchy.' } },
        { p: 'If a color is missing, the answer is not done yet.' }
      ]}
    ],
    items: [
      { id: 'M01', skill: 'R.A.D. steps', q: 'What does the R in R.A.D. stand for?',
        choices: ['Restate', 'Read', 'Repeat', 'Reason'],
        why: 'R stands for Restate. Turn the question around. Start with the key words.' },
      { id: 'M02', skill: 'R.A.D. steps', q: 'What does the A in R.A.D. stand for?',
        choices: ['Answer', 'Ask', 'Add', 'Again'],
        why: 'A stands for Answer. Tell the answer clearly.' },
      { id: 'M03', skill: 'R.A.D. steps', q: 'What does the D in R.A.D. stand for?',
        choices: ['Detail', 'Draw', 'Done', 'Decide'],
        why: 'D stands for Detail. A detail tells more about your answer.' },
      { id: 'M04', skill: 'R.A.D. steps', q: 'In the color check, which color shows the Restate?',
        choices: ['Blue', 'Green', 'Red', 'Yellow'], fixed: true, answer: 0,
        why: 'Blue shows the Restate. Green shows the Answer. Red shows the Detail.' },
      { id: 'M05', skill: 'R.A.D. steps', q: 'In the color check, which color shows the Detail?',
        choices: ['Blue', 'Green', 'Red', 'Yellow'], fixed: true, answer: 2,
        why: 'Red shows the Detail. Blue shows the Restate. Green shows the Answer.' },
      { id: 'M06', skill: 'Full R.A.D. answer', q: 'Which answer is R.A.D.?', ask: 'What is your favorite animal?',
        choices: ['My favorite animal is a horse. Horses can run very fast across a field.', 'A horse.', 'My favorite animal is a horse.', 'I like it a lot.'],
        notes: [null, 'Only the answer. The Restate and the Detail are missing.', 'A Restate and an Answer, but no Detail.', 'This answer never names the animal.'],
        why: 'The R.A.D. answer turns the question around, names the animal, and tells more about horses.',
        model: { R: 'My favorite animal is', A: 'a horse.', D: 'Horses can run very fast across a field.' } },
      { id: 'M07', skill: 'Full R.A.D. answer', q: 'Which answer is R.A.D.?', ask: 'What do you like to do on a rainy day?',
        choices: ['On a rainy day, I like to read in my room. I read comic books under a warm blanket.', 'Read.', 'On a rainy day, I like to read in my room.', 'Because it is wet outside.'],
        notes: [null, 'Only one word. The Restate and the Detail are missing.', 'A Restate and an Answer, but no Detail.', 'Never start with Because. This does not answer the question.'],
        why: 'The R.A.D. answer has all three parts: a Restate, an Answer, and a Detail.',
        model: { R: 'On a rainy day, I like to', A: 'read in my room.', D: 'I read comic books under a warm blanket.' } },
      { id: 'M08', skill: 'Full R.A.D. answer', q: 'Which answer is R.A.D.?', ask: 'Who is your favorite person to play with?',
        choices: ['My favorite person to play with is my cousin Ben. Ben and I build forts out of pillows.', 'My cousin.', 'He is fun. We play a lot.', 'My favorite person to play with is my cousin Ben.'],
        notes: [null, 'Only the answer. The Restate and the Detail are missing.', 'The reader does not know who he is. Name the person first.', 'A Restate and an Answer, but no Detail.'],
        why: 'The R.A.D. answer names the person first. Then the Detail tells what Ben and I do.',
        model: { R: 'My favorite person to play with is', A: 'my cousin Ben.', D: 'Ben and I build forts out of pillows.' } }
    ]
  },

  /* ═══ 2 · COLOR-CHECK ═══════════════════════════════ */
  {
    kind: 'color', letter: 'C', icon: '🖍️', label: 'Color-Check', sub: 'Find the R, the A, and the D',
    cards: [
      { title: 'Find the three parts', blocks: [
        { p: 'Every R.A.D. answer has three parts. Let us find them.' },
        { ask: 'Why do you like weekends?' },
        { rad: { R: 'I like weekends because', A: 'I get to sleep late.', D: 'On Saturdays, I also go to the park with my family.' } },
        { rows: [['R', 'The Restate starts with the key words: like weekends.'], ['A', 'The Answer gives the reason: I get to sleep late.'], ['D', 'The Detail tells more: the park with my family.']] }
      ]},
      { title: 'Now you try', blocks: [
        { p: 'You will see a R.A.D. answer. One part has a yellow box around the words.' },
        { p: 'Pick the part in the yellow box. Is the part the Restate, the Answer, or the Detail?' },
        { ask: 'Where do you like to play after school?' },
        { shown: { R: 'After school, I like to play', A: 'at the park.', D: 'The park has a big slide and a basketball court.', mark: 'A' } },
        { p: 'The yellow box shows the place: at the park. That part is the Answer.' }
      ]}
    ],
    items: [
      { id: 'C01', skill: 'Color check', ask: 'What is your favorite fruit?',
        shown: { R: 'My favorite fruit is', A: 'mango.', D: 'Mangoes are sweet and juicy, so I eat mangoes all summer.', mark: 'A' },
        why: 'Mango is the Answer. The Answer tells what the question asks.' },
      { id: 'C02', skill: 'Color check', ask: 'Where do you like to sit at lunch?',
        shown: { R: 'At lunch, I like to sit', A: 'next to my friend Nia.', D: 'Nia always saves me a seat by the window.', mark: 'R' },
        why: 'The Restate starts with the key words from the question: sit at lunch.' },
      { id: 'C03', skill: 'Color check', ask: 'Why do you like art class?',
        shown: { R: 'I like art class because', A: 'I get to paint.', D: 'Last week, I painted a big orange sunset.', mark: 'D' },
        why: 'The Detail tells more about the Answer. The sunset is an example of painting.' },
      { id: 'C04', skill: 'Color check', ask: 'How do you help your family?',
        shown: { R: 'I help my family by', A: 'feeding our dog, Max.', D: 'I fill the bowl with dog food every morning before school.', mark: 'A' },
        why: 'A How question wants a way. Feeding our dog is the way I help. That part is the Answer.' },
      { id: 'C05', skill: 'Color check', ask: 'When do you feel happy?',
        shown: { R: 'I feel happy', A: 'when I play soccer.', D: 'Running fast and kicking the ball makes me smile.', mark: 'R' },
        why: 'The Restate uses the key words from the question: feel happy.' },
      { id: 'C06', skill: 'Color check', ask: 'Who helps you when you are stuck?',
        shown: { R: 'Someone who helps me when I am stuck is', A: 'my big sister, Jada.', D: 'Jada shows me how to sound out hard words.', mark: 'D' },
        why: 'The Detail tells more about Jada. The Detail shows how Jada helps.' },
      { id: 'C07', skill: 'Color check', ask: 'What is your favorite game?',
        shown: { R: 'My favorite game is', A: 'hide-and-seek.', D: 'I always hide behind the big tree in my yard.', mark: 'R' },
        why: 'The Restate turns the question around: My favorite game is…' },
      { id: 'C08', skill: 'Color check',
        story: 'Omar lost his red hat at the park. Later, Omar found the hat under a bench next to the swings.',
        ask: 'Where did Omar find his hat?',
        shown: { R: 'Omar found his hat', A: 'under a bench.', D: 'The bench was next to the swings at the park.', mark: 'D' },
        why: 'The Detail comes from the story. The Detail tells more about the bench.' },
      { id: 'C09', skill: 'Color check',
        story: 'Tia’s class went to the zoo in May. Tia liked the seals best, because the seals did flips in the water.',
        ask: 'What animal did Tia like best?',
        shown: { R: 'The animal Tia liked best was', A: 'the seals.', D: 'The seals did flips in the water.', mark: 'A' },
        why: 'The seals is the Answer. A What question wants a thing.' }
    ]
  },

  /* ═══ 3 · QUESTION WORD CLUES ═══════════════════════ */
  {
    kind: 'clues', letter: 'Q', icon: '❓', label: 'Question Word Clues', sub: 'What kind of answer does it want?',
    cards: [
      { title: 'The question word is a clue', blocks: [
        { p: 'Most questions start with a question word. The question word tells you what kind of answer to give.' },
        { clues: true }
      ]},
      { title: 'See the clue at work', blocks: [
        { ask: 'Where do you like to play after school?' },
        { p: 'Where wants a place.' },
        { rad: { R: 'After school, I like to play', A: 'at the park.', D: 'The park has a big slide and a basketball court.' } },
        { ask: 'When do you go to bed?' },
        { p: 'When wants a time.' },
        { rad: { R: 'I go to bed', A: 'at eight o’clock.', D: 'First, I brush my teeth and read a short book.' } }
      ]}
    ],
    items: [
      { id: 'Q01', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'Who made the birthday cake?',
        choices: ['a person', 'a place', 'a time', 'a reason'],
        why: 'Who wants a person.',
        model: { R: 'The person who made the birthday cake was', A: 'my grandma.', D: 'Grandma put pink frosting and candles on top.' } },
      { id: 'Q02', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'Where did the class go on the trip?',
        choices: ['a place', 'a person', 'a time', 'a way'],
        why: 'Where wants a place.',
        model: { R: 'On the trip, the class went to', A: 'the science museum.', D: 'The class saw a real dinosaur bone at the museum.' } },
      { id: 'Q03', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'When does the library open?',
        choices: ['a time', 'a place', 'a reason', 'a thing'],
        why: 'When wants a time.',
        model: { R: 'The library opens', A: 'at nine in the morning.', D: 'Kids line up at the door to get new books.' } },
      { id: 'Q04', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'Why did Leo wear a coat?',
        choices: ['a reason', 'a person', 'a place', 'a time'],
        why: 'Why wants a reason. The answer often uses the word because, in the middle of the sentence.',
        model: { R: 'Leo wore a coat because', A: 'snow was falling outside.', D: 'Leo also wore a hat and mittens.' } },
      { id: 'Q05', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'How did Nia get to the party?',
        choices: ['a way', 'a person', 'a time', 'a thing'],
        why: 'How wants a way.',
        model: { R: 'Nia got to the party by', A: 'riding her bike.', D: 'Nia’s mom rode next to her the whole way.' } },
      { id: 'Q06', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'What did Ben find in the box?',
        choices: ['a thing', 'a place', 'a time', 'a reason'],
        why: 'What wants a thing.',
        model: { R: 'In the box, Ben found', A: 'an old toy train.', D: 'The train was red and had a bent wheel.' } },
      { id: 'Q07', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'Why do you like summer?',
        choices: ['a reason', 'a time', 'a place', 'a person'],
        why: 'Why wants a reason.',
        model: { R: 'I like summer because', A: 'I can swim every day.', D: 'I swim at the city pool with my friends.' } },
      { id: 'Q08', skill: 'Question-word clues', q: 'What kind of answer does this question want?', ask: 'When do you eat breakfast?',
        choices: ['a time', 'a way', 'a person', 'a thing'],
        why: 'When wants a time.',
        model: { R: 'I eat breakfast', A: 'at seven o’clock.', D: 'I like cereal with a banana on top.' } }
    ]
  },

  /* ═══ 4 · TURN IT AROUND ════════════════════════════ */
  {
    kind: 'turn', letter: 'T', icon: '🔄', label: 'Turn It Around', sub: 'Start with the key words',
    cards: [
      { title: 'Find the key words', blocks: [
        { p: 'Key words are the most important words in the question. Key words tell what the question is about.' },
        { ask: 'What is your favorite lunch?' },
        { rows: [['?', 'The question word is What.'], ['🔑', 'The key words are favorite lunch.']] },
        { p: 'Start your answer with the key words: My favorite lunch is…' }
      ]},
      { title: 'Change you to I', blocks: [
        { p: 'The question talks to you. Your answer talks about you, so you say I.' },
        { rows: [['you', 'changes to I'], ['your', 'changes to my']] },
        { ask: 'Why do you like weekends?' },
        { p: 'The answer starts: I like weekends because…' }
      ]},
      { title: 'Three rules for a good start', blocks: [
        { bad: 'Because I get to sleep late.', why: 'Never start with Because. Start with the key words.' },
        { bad: 'Why do I like weekends? I like weekends because I get to sleep late.', why: 'Do not copy the whole question. Use only the key words.' },
        { bad: 'Sleep.', why: 'Never answer with just one word.' },
        { good: 'I like weekends because I get to sleep late.', why: 'This answer starts with the key words. Because is in the middle.' }
      ]}
    ],
    items: [
      { id: 'T01', skill: 'Restating with key words', q: 'What are the key words in this question?', ask: 'What is your favorite color?',
        choices: ['favorite color', 'What is', 'is your', 'your'],
        why: 'The key words tell what the question is about: favorite color.',
        model: { R: 'My favorite color is', A: 'purple.', D: 'My room has purple walls and a purple rug.' } },
      { id: 'T02', skill: 'Restating with key words', q: 'Which is the best way to start the answer?', ask: 'Why do you like music class?',
        choices: ['I like music class because…', 'Because…', 'Why do I like music class?', 'Music.'],
        kinds: ['good', 'because', 'copy', 'oneword'],
        why: 'The best start uses the key words, like music class, and changes you to I.',
        model: { R: 'I like music class because', A: 'we get to play the drums.', D: 'Our teacher lets us take turns on the big drum.' } },
      { id: 'T03', skill: 'Restating with key words', q: 'Which is the best way to start the answer?', ask: 'Where does your family shop for food?',
        choices: ['My family shops for food at…', 'Your family shops for food at…', 'Where does my family shop for food?', 'Food.'],
        kinds: ['good', 'you', 'copy', 'oneword'],
        why: 'The best start uses the key words, shop for food, and changes your to my.',
        model: { R: 'My family shops for food at', A: 'the market on Main Street.', D: 'The market sells fresh bread and big red apples.' } },
      { id: 'T04', skill: 'Restating with key words', q: 'Which is the best way to start the answer?', ask: 'Who is someone who makes you laugh?',
        choices: ['Someone who makes me laugh is…', 'Someone who makes you laugh is…', 'Because he is funny.', 'Him.'],
        kinds: ['good', 'you', 'because', 'oneword'],
        why: 'The best start uses the key words, makes you laugh, and changes you to me.',
        model: { R: 'Someone who makes me laugh is', A: 'my uncle Luis.', D: 'Uncle Luis tells silly jokes at dinner.' } },
      { id: 'T05', skill: 'Restating with key words', q: 'In this question, which word changes to I in your answer?', ask: 'How do you keep your room clean?',
        choices: ['you', 'How', 'keep', 'room'],
        why: 'You changes to I. Your changes to my.',
        model: { R: 'I keep my room clean by', A: 'putting my toys away every night.', D: 'My books go on a shelf, and my toy cars go in a bin.' } },
      { id: 'T06', skill: 'Restating with key words', q: 'Which answer starts the right way?', ask: 'Why do you like dogs?',
        choices: ['I like dogs because dogs are friendly.', 'Because dogs are friendly.', 'Dogs.', 'Why do I like dogs? Dogs are friendly.'],
        kinds: ['good', 'because', 'oneword', 'copy'],
        why: 'The right start uses the key words, like dogs. Because goes in the middle.',
        model: { R: 'I like dogs because', A: 'dogs are friendly.', D: 'My neighbor’s dog runs to me and wags his tail.' } },
      { id: 'T07', skill: 'Restating with key words', q: 'Which is the best way to start the answer?', ask: 'When do you visit your grandma?',
        choices: ['I visit my grandma…', 'You visit your grandma…', 'When do I visit my grandma?', 'Sunday.'],
        kinds: ['good', 'you', 'copy', 'oneword'],
        why: 'The best start uses the key words, visit your grandma, and changes your to my.',
        model: { R: 'I visit my grandma', A: 'every Sunday afternoon.', D: 'Grandma makes rice and beans for the whole family.' } },
      { id: 'T08', skill: 'Restating with key words', q: 'Which is the best way to start the answer?', ask: 'What is one thing you can cook?',
        choices: ['One thing I can cook is…', 'One thing you can cook is…', 'Because I like eggs.', 'Eggs.'],
        kinds: ['good', 'you', 'because', 'oneword'],
        why: 'The best start uses the key words, thing you can cook, and changes you to I.',
        model: { R: 'One thing I can cook is', A: 'scrambled eggs.', D: 'My dad and I stir the eggs in a pan.' } }
    ]
  },

  /* ═══ 5 · PICK THE BEST DETAIL ══════════════════════ */
  {
    kind: 'detail', letter: 'D', icon: '🔍', label: 'Pick the Best Detail', sub: 'A detail tells MORE',
    cards: [
      { title: 'A detail tells MORE', blocks: [
        { p: 'A detail has one job. A detail tells more about your answer.' },
        { ask: 'What is your favorite lunch?' },
        { given: { R: 'My favorite lunch is', A: 'pizza.' } },
        { good: 'I like it best when the cheese is melted and the crust is crunchy.', why: 'This detail tells more! The reader learns something new about the pizza.' }
      ]},
      { title: 'Three details that do not work', blocks: [
        { bad: 'My sister likes tacos.', why: 'Off topic. This detail is not about my pizza.' },
        { bad: 'Pizza is the lunch I like best.', why: 'Same answer again. Nothing new.' },
        { bad: 'It is good.', why: 'Too vague. The words do not tell enough. What is good about the pizza?' },
        { p: 'Ask yourself: Does my detail tell the reader something NEW?' }
      ]}
    ],
    items: [
      { id: 'D01', skill: 'Strong vs. vague details', q: 'Which detail tells the most about the answer?', ask: 'What is your favorite sport?',
        given: { R: 'My favorite sport is', A: 'basketball.' },
        choices: ['I practice my jump shot at the park every day.', 'My brother plays the drums.', 'Basketball is the sport I like the most.', 'It is really fun.'],
        kinds: ['good', 'off', 'same', 'vague'],
        why: 'The best detail tells something new about basketball: practice at the park every day.',
        model: { R: 'My favorite sport is', A: 'basketball.', D: 'I practice my jump shot at the park every day.' } },
      { id: 'D02', skill: 'Strong vs. vague details', q: 'Which detail tells the most about the answer?', ask: 'Where do you like to go on the weekend?',
        given: { R: 'On the weekend, I like to go to', A: 'the library.' },
        choices: ['The library has a big room full of comic books.', 'My aunt has a new car.', 'The library is where I go on weekends.', 'It is nice there.'],
        kinds: ['good', 'off', 'same', 'vague'],
        why: 'The best detail tells something new about the library: a big room full of comic books.',
        model: { R: 'On the weekend, I like to go to', A: 'the library.', D: 'The library has a big room full of comic books.' } },
      { id: 'D03', skill: 'Strong vs. vague details', q: 'Which detail tells the most about the answer?', ask: 'Why do you like fall?',
        given: { R: 'I like fall because', A: 'the leaves change color.' },
        choices: ['The trees on my street turn bright red and orange.', 'I got new shoes last week.', 'Fall is good because of the leaves changing color.', 'It is so cool.'],
        kinds: ['good', 'off', 'same', 'vague'],
        why: 'The best detail tells more about the leaves: bright red and orange trees on my street.',
        model: { R: 'I like fall because', A: 'the leaves change color.', D: 'The trees on my street turn bright red and orange.' } },
      { id: 'D04', skill: 'Strong vs. vague details', q: 'Which detail tells the most about the answer?', ask: 'Who is a helper at your school?',
        given: { R: 'A helper at my school is', A: 'Ms. Gomez, the nurse.' },
        choices: ['Ms. Gomez gives us ice packs when we get hurt at recess.', 'My school has a big gym.', 'The nurse, Ms. Gomez, is a helper at school.', 'She is nice.'],
        kinds: ['good', 'off', 'same', 'vague'],
        why: 'The best detail shows how Ms. Gomez helps: ice packs when we get hurt.',
        model: { R: 'A helper at my school is', A: 'Ms. Gomez, the nurse.', D: 'Ms. Gomez gives us ice packs when we get hurt at recess.' } },
      { id: 'D05', skill: 'Strong vs. vague details', q: 'Which detail from the story tells the most about the answer?',
        story: 'Kai wanted a pet. Kai did chores for a month to save money. Then Kai bought a small green turtle and named the turtle Speedy.',
        ask: 'What pet did Kai buy?',
        given: { R: 'The pet Kai bought was', A: 'a small green turtle.' },
        choices: ['Kai did chores for a month to save money for the turtle.', 'Turtles can live in ponds.', 'Kai’s new pet was a turtle.', 'He was happy.'],
        kinds: ['good', 'notext', 'same', 'vague'],
        why: 'The best detail comes from the story and tells more: Kai did chores for a month.',
        model: { R: 'The pet Kai bought was', A: 'a small green turtle.', D: 'Kai did chores for a month to save money for the turtle.' } },
      { id: 'D06', skill: 'Strong vs. vague details', q: 'Which detail from the story tells the most about the answer?',
        story: 'The fourth grade had a bake sale. The class sold cookies, cupcakes, and banana bread. The class made fifty dollars for new library books.',
        ask: 'Why did the fourth grade have a bake sale?',
        given: { R: 'The fourth grade had a bake sale to', A: 'make money for new library books.' },
        choices: ['The class made fifty dollars by selling cookies, cupcakes, and banana bread.', 'My mom bakes cookies at home.', 'The bake sale was to get money for library books.', 'It went well.'],
        kinds: ['good', 'notext', 'same', 'vague'],
        why: 'The best detail comes from the story and tells more: fifty dollars from cookies, cupcakes, and banana bread.',
        model: { R: 'The fourth grade had a bake sale to', A: 'make money for new library books.', D: 'The class made fifty dollars by selling cookies, cupcakes, and banana bread.' } },
      { id: 'D07', skill: 'Strong vs. vague details', q: 'Which detail tells the most about the answer?', ask: 'What is your favorite thing to do at the beach?',
        given: { R: 'My favorite thing to do at the beach is', A: 'build sand castles.' },
        choices: ['I use a bucket to make tall towers with a moat all around.', 'My friend has a pool.', 'Building sand castles is what I like to do most at the beach.', 'It is the best.'],
        kinds: ['good', 'off', 'same', 'vague'],
        why: 'The best detail tells how I build the sand castles: a bucket, tall towers, and a moat.',
        model: { R: 'My favorite thing to do at the beach is', A: 'build sand castles.', D: 'I use a bucket to make tall towers with a moat all around.' } },
      { id: 'D08', skill: 'Strong vs. vague details', q: 'Which detail from the story tells the most about the answer?',
        story: 'Zoe’s soccer team lost every game in September. In October, the team practiced passing every day after school. The team won the last three games.',
        ask: 'How did Zoe’s team get better?',
        given: { R: 'Zoe’s team got better by', A: 'practicing passing every day after school.' },
        choices: ['After all that practice, the team won the last three games.', 'Soccer balls are black and white.', 'The team got better because the team practiced passing.', 'They tried hard.'],
        kinds: ['good', 'notext', 'same', 'vague'],
        why: 'The best detail comes from the story and tells more: the team won the last three games.',
        model: { R: 'Zoe’s team got better by', A: 'practicing passing every day after school.', D: 'After all that practice, the team won the last three games.' } }
    ]
  },

  /* ═══ 6 · IS IT R.A.D.? ═════════════════════════════ */
  {
    kind: 'check', letter: 'K', icon: '✅', label: 'Is It R.A.D.?', sub: 'Find the missing part',
    cards: [
      { title: 'Check the answer', blocks: [
        { p: 'Read the answer. Then ask yourself three questions.' },
        { rows: [['R', 'Did the answer restate, with the key words?'], ['A', 'Did the answer answer the question?'], ['D', 'Did the answer add a detail that tells more?']] },
        { p: 'If one part is missing, the answer is not R.A.D. yet.' }
      ]},
      { title: 'Watch out for these mistakes', blocks: [
        { ask: 'Why do you like weekends?' },
        { bad: 'Because I get to sleep late. On Saturdays, I go to the park.', why: 'The answer starts with Because. The Restate is missing.' },
        { bad: 'I like weekends because I get to sleep late.', why: 'The answer stops too soon. The Detail is missing.' },
        { bad: 'I like weekends a lot. On Saturdays, I go to the park.', why: 'The answer never tells why. The Answer is missing.' }
      ]}
    ],
    items: [
      { id: 'K01', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'What is your favorite subject?',
        shown: 'My favorite subject is science.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 3,
        why: 'The answer has a Restate and an Answer. A Detail would tell more about science.',
        model: { R: 'My favorite subject is', A: 'science.', D: 'I like to do experiments with magnets.' } },
      { id: 'K02', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'Why do you like the park?',
        shown: 'Because the swings go really high. I can see over the fence.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 1,
        why: 'The answer starts with Because. A Restate would start with the key words: I like the park because…',
        model: { R: 'I like the park because', A: 'the swings go really high.', D: 'From the top, I can see over the fence.' } },
      { id: 'K03', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'Where do you keep your books?',
        shown: 'I keep my books on a shelf in my room. The shelf has three rows, and my favorite books are on top.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 0,
        why: 'Nothing is missing. The answer has a Restate, an Answer, and a Detail.',
        model: { R: 'I keep my books', A: 'on a shelf in my room.', D: 'The shelf has three rows, and my favorite books are on top.' } },
      { id: 'K04', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'Who taught you to ride a bike?',
        shown: 'Someone taught me to ride a bike. The person held the seat and ran next to me.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 2,
        why: 'The answer never names the person. A Who question wants a person.',
        model: { R: 'The person who taught me to ride a bike was', A: 'my mom.', D: 'Mom held the seat and ran next to me.' } },
      { id: 'K05', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'How do you get ready for school?',
        shown: 'I get ready for school by packing my bag the night before. In the morning, I just eat breakfast and go.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 0,
        why: 'Nothing is missing. The answer has a Restate, an Answer, and a Detail.',
        model: { R: 'I get ready for school by', A: 'packing my bag the night before.', D: 'In the morning, I just eat breakfast and go.' } },
      { id: 'K06', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?', ask: 'When do you play outside?',
        shown: 'After school. I play tag with the kids on my street.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 1,
        why: 'After school is only the Answer. A Restate would start with the key words: I play outside…',
        model: { R: 'I play outside', A: 'after school.', D: 'I play tag with the kids on my street.' } },
      { id: 'K07', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?',
        story: 'Ivy found a baby bird on the ground. Ivy put the bird in a box with soft grass. Then Ivy called an animal rescue for help.',
        ask: 'Where did Ivy put the baby bird?',
        shown: 'Ivy put the baby bird in a box with soft grass.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 3,
        why: 'The answer stops too soon. The story has a detail to add: Ivy called an animal rescue.',
        model: { R: 'Ivy put the baby bird', A: 'in a box with soft grass.', D: 'Then Ivy called an animal rescue for help.' } },
      { id: 'K08', skill: 'Full R.A.D. answer', q: 'What is missing from this answer?',
        story: 'Owen’s class grew a pumpkin in the school garden. By October, the pumpkin was as big as a beach ball. The class used the pumpkin to make pumpkin bread.',
        ask: 'How big did the pumpkin grow?',
        shown: 'The pumpkin grew. The class used the pumpkin to make pumpkin bread.',
        choices: ['Nothing. This answer is R.A.D.!', 'The Restate is missing.', 'The Answer is missing.', 'The Detail is missing.'], fixed: true, answer: 2,
        why: 'The answer never tells how big. Look back: as big as a beach ball.',
        model: { R: 'The pumpkin grew', A: 'as big as a beach ball.', D: 'The class used the pumpkin to make pumpkin bread.' } }
    ]
  },

  /* ═══ 7 · BUILD A R.A.D. ANSWER ═════════════════════ */
  {
    kind: 'build', letter: 'B', icon: '🧱', label: 'Build a R.A.D. Answer', sub: 'Pick each part. Watch the answer grow.',
    cards: [
      { title: 'Build an answer one part at a time', blocks: [
        { p: 'Now you will build a R.A.D. answer.' },
        { rows: [['R', 'First, pick the Restate.'], ['A', 'Next, pick the Answer.'], ['D', 'Last, pick the Detail.']] },
        { p: 'Your answer grows on the screen, one color at a time.' },
        { ask: 'What is your favorite thing to eat for breakfast?' },
        { rad: { R: 'My favorite thing to eat for breakfast is', A: 'pancakes.', D: 'I put butter and syrup on top.' } }
      ]}
    ],
    groups: [
      { ask: 'What is your favorite place in your home?',
        steps: [
          { id: 'B01', part: 'R', skill: 'Restating with key words',
            choices: ['My favorite place in my home is', 'Your favorite place in your home is', 'Because', 'What is my favorite place?'],
            kinds: ['good', 'you', 'because', 'copy'],
            why: 'The Restate uses the key words, favorite place in your home, and changes your to my.' },
          { id: 'B02', part: 'A', skill: 'Answering the question',
            choices: ['my bedroom.', 'yes.', 'a lot.', 'because.'],
            why: 'A What question wants a thing. My bedroom names the place.' },
          { id: 'B03', part: 'D', skill: 'Strong vs. vague details',
            choices: ['My bedroom has a big window and a beanbag chair.', 'My bedroom is my favorite place.', 'My friend has a cat.', 'It is cool.'],
            kinds: ['good', 'same', 'off', 'vague'],
            why: 'The best detail tells more about the bedroom: a big window and a beanbag chair.' }
        ],
        model: { R: 'My favorite place in my home is', A: 'my bedroom.', D: 'My bedroom has a big window and a beanbag chair.' } },
      { ask: 'Why do you like your best friend?',
        steps: [
          { id: 'B04', part: 'R', skill: 'Restating with key words',
            choices: ['I like my best friend because', 'You like your best friend because', 'Because', 'Why do I like my best friend?'],
            kinds: ['good', 'you', 'because', 'copy'],
            why: 'The Restate uses the key words, like your best friend, and changes you to I.' },
          { id: 'B05', part: 'A', skill: 'Answering the question',
            choices: ['my best friend is kind to everyone.', 'yes.', 'a friend.', 'school.'],
            why: 'A Why question wants a reason. Kind to everyone is the reason.' },
          { id: 'B06', part: 'D', skill: 'Strong vs. vague details',
            choices: ['Last week, my best friend shared lunch with a new kid.', 'My best friend is a nice person.', 'I have a blue backpack.', 'She is cool.'],
            kinds: ['good', 'same', 'off', 'vague'],
            why: 'The best detail is an example of being kind: sharing lunch with a new kid.' }
        ],
        model: { R: 'I like my best friend because', A: 'my best friend is kind to everyone.', D: 'Last week, my best friend shared lunch with a new kid.' } },
      { ask: 'How do you stay safe on the way to school?',
        steps: [
          { id: 'B07', part: 'R', skill: 'Restating with key words',
            choices: ['I stay safe on the way to school by', 'You stay safe on the way to school by', 'Because I', 'How do I stay safe?'],
            kinds: ['good', 'you', 'because', 'copy'],
            why: 'The Restate uses the key words, stay safe on the way to school, and changes you to I.' },
          { id: 'B08', part: 'A', skill: 'Answering the question',
            choices: ['looking both ways before I cross the street.', 'yes.', 'school.', 'every day.'],
            why: 'A How question wants a way. Looking both ways is the way I stay safe.' },
          { id: 'B09', part: 'D', skill: 'Strong vs. vague details',
            choices: ['I also wait for the crossing guard to wave me on.', 'Looking both ways keeps me safe.', 'My school has a red door.', 'It works.'],
            kinds: ['good', 'same', 'off', 'vague'],
            why: 'The best detail tells one more way I stay safe: the crossing guard.' }
        ],
        model: { R: 'I stay safe on the way to school by', A: 'looking both ways before I cross the street.', D: 'I also wait for the crossing guard to wave me on.' } },
      { ask: 'When is your birthday?',
        steps: [
          { id: 'B10', part: 'R', skill: 'Restating with key words',
            choices: ['My birthday is', 'Your birthday is', 'Because', 'When is my birthday?'],
            kinds: ['good', 'you', 'because', 'copy'],
            why: 'The Restate uses the key word, birthday, and changes your to my.' },
          { id: 'B11', part: 'A', skill: 'Answering the question',
            choices: ['in March.', 'yes.', 'a cake.', 'because.'],
            why: 'A When question wants a time. In March is a time.' },
          { id: 'B12', part: 'D', skill: 'Strong vs. vague details',
            choices: ['Every year, my family makes a chocolate cake for me.', 'My birthday is in the month of March.', 'Dogs have birthdays too.', 'It is fun.'],
            kinds: ['good', 'same', 'off', 'vague'],
            why: 'The best detail tells more about my birthday: a chocolate cake every year.' }
        ],
        model: { R: 'My birthday is', A: 'in March.', D: 'Every year, my family makes a chocolate cake for me.' } }
    ]
  },

  /* ═══ 8 · LOOK BACK IN THE STORY ════════════════════ */
  {
    kind: 'story', letter: 'S', icon: '📖', label: 'Look Back in the Story', sub: 'Find the paragraph. Then build.',
    usesStory: true,
    cards: [
      { title: 'Look back. Do not guess.', blocks: [
        { p: 'The answer is in the story. Go find the answer.' },
        { p: 'A paragraph is a group of sentences. In this story, every paragraph has a number.' },
        { rows: [['1', 'Find the key words in the question.'], ['2', 'Ask: Where would this be in the story?'], ['3', 'Reread that paragraph.'], ['4', 'Say the number: I found the answer in paragraph 3.']] }
      ]},
      { title: 'The detail comes from the story', blocks: [
        { p: 'When a question is about a story, your detail comes from the story too.' },
        { ask: 'What news did Ms. Rivera tell her class?' },
        { rad: { R: 'Ms. Rivera told her class that', A: 'the class was going to get a class pet.', D: 'First, the students had to vote on which animal to choose.', para: 1 } },
        { p: 'You will read a story called The Big Snow Day. The story stays on the screen. Look back at the story for every answer.' }
      ]}
    ],
    groups: [
      { ask: 'Why did Maya cheer?', para: 1,
        steps: [
          { id: 'S01', part: 'P', skill: 'Finding evidence in the text',
            choices: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3', 'Paragraph 5'],
            why: 'Paragraph 1 says Maya cheered. The reason is in paragraph 1 too.' },
          { id: 'S02', part: 'R', skill: 'Restating with key words',
            choices: ['Maya cheered because', 'Because', 'Why did Maya cheer?', 'Maya.'],
            kinds: ['good', 'because', 'copy', 'oneword'],
            why: 'The Restate uses the key words, Maya cheer, and puts because in the middle.' },
          { id: 'S03', part: 'A', skill: 'Finding evidence in the text',
            choices: ['there was no school.', 'she ran to the window.', 'she liked her boots.', 'Omar made a snowman.'],
            kinds: ['good', 'noanswer', 'wrongtext', 'wrongtext'],
            why: 'Paragraph 1 says the news said there was no school. That is why Maya cheered.' },
          { id: 'S04', part: 'D', skill: 'Strong vs. vague details',
            choices: ['Snow fell all night on a cold Tuesday in January.', 'Maya was glad about no school.', 'Snow is cold and white.', 'It was a good day.'],
            kinds: ['good', 'same', 'notext', 'vague'],
            why: 'The best detail comes from paragraph 1 and tells more: snow fell all night.' }
        ],
        model: { R: 'Maya cheered because', A: 'there was no school.', D: 'Snow fell all night on a cold Tuesday in January.', para: 1 } },
      { ask: 'Who helped Omar put the head on the snowman?', para: 3,
        steps: [
          { id: 'S05', part: 'P', skill: 'Finding evidence in the text',
            choices: ['Paragraph 3', 'Paragraph 1', 'Paragraph 2', 'Paragraph 5'],
            why: 'Paragraph 3 tells how the kids built the snowman, ball by ball.' },
          { id: 'S06', part: 'R', skill: 'Restating with key words',
            choices: ['The person who helped Omar put the head on the snowman was', 'Because', 'Who helped Omar?', 'He helped.'],
            kinds: ['good', 'because', 'copy', 'oneword'],
            why: 'The Restate uses the key words: helped Omar put the head on the snowman.' },
          { id: 'S07', part: 'A', skill: 'Finding evidence in the text',
            choices: ['their neighbor, Mr. Diaz.', 'Maya.', 'the snowman.', 'a carrot.'],
            kinds: ['good', 'wrongtext', 'noanswer', 'noanswer'],
            why: 'Paragraph 3 says their neighbor, Mr. Diaz, helped Omar.' },
          { id: 'S08', part: 'D', skill: 'Strong vs. vague details',
            choices: ['Omar was too short to lift the head by himself.', 'Mr. Diaz helped Omar.', 'Neighbors live next door.', 'He was nice.'],
            kinds: ['good', 'same', 'notext', 'vague'],
            why: 'The best detail comes from paragraph 3 and tells why Omar needed help.' }
        ],
        model: { R: 'The person who helped Omar put the head on the snowman was', A: 'their neighbor, Mr. Diaz.', D: 'Omar was too short to lift the head by himself.', para: 3 } },
      { ask: 'What did Omar give the snowman?', para: 4,
        steps: [
          { id: 'S09', part: 'P', skill: 'Finding evidence in the text',
            choices: ['Paragraph 4', 'Paragraph 1', 'Paragraph 2', 'Paragraph 3'],
            why: 'Paragraph 4 tells what each kid put on the snowman.' },
          { id: 'S10', part: 'R', skill: 'Restating with key words',
            choices: ['Omar gave the snowman', 'You gave the snowman', 'Because', 'What did Omar give?'],
            kinds: ['good', 'you', 'because', 'copy'],
            why: 'The Restate uses the key words: Omar give the snowman.' },
          { id: 'S11', part: 'A', skill: 'Finding evidence in the text',
            choices: ['his old red scarf.', 'two rocks.', 'a carrot.', 'his boots.'],
            kinds: ['good', 'wrongtext', 'wrongtext', 'wrongtext'],
            why: 'Paragraph 4 says Omar gave the snowman his old red scarf. Maya used the rocks and the carrot.' },
          { id: 'S12', part: 'D', skill: 'Strong vs. vague details',
            choices: ['Omar wanted the snowman to stay warm.', 'The scarf was from Omar.', 'Scarves come in many colors.', 'It looked good.'],
            kinds: ['good', 'same', 'notext', 'vague'],
            why: 'The best detail comes from paragraph 4 and tells why: so the snowman would stay warm.' }
        ],
        model: { R: 'Omar gave the snowman', A: 'his old red scarf.', D: 'Omar wanted the snowman to stay warm.', para: 4 } }
    ]
  }
];
