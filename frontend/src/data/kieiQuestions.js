/**
 * KUNDU INTROVERSION EXTRAVERSION INVENTORY (K.I.E.I.)
 * Authoritative 70-Item Questionnaire Dataset (Frontend ES Module)
 * Author: Dr. Ramanath Kundu, Department of Psychology, Calcutta University (1976)
 */

export const KIEI_QUESTIONS = [
  // ==========================================
  // BLOCK A: QUESTIONS 1 TO 11 (4 Choices Each)
  // ==========================================
  {
    id: 1,
    number: 1,
    block: 'A',
    text: 'Which one of the following four jobs you would like best as your profession?',
    options: [
      { value: 1, label: 'Laboratory research worker.' },
      { value: 2, label: 'Political leader.' },
      { value: 3, label: 'Military officer.' },
      { value: 4, label: 'Officer in a factory or office.' },
    ],
    rowWeights: { 2: 1, 3: 2, 4: 3, 1: 4 },
  },
  {
    id: 2,
    number: 2,
    block: 'A',
    text: 'Which one of the following four type of pictures (Cinema) do you like to enjoy most?',
    options: [
      { value: 1, label: 'Picture of a battle.' },
      { value: 2, label: 'Picture of a comedy.' },
      { value: 3, label: 'Picture of a grim tragedy.' },
      { value: 4, label: 'Picture of natural devastation.' },
    ],
    rowWeights: { 1: 1, 2: 2, 4: 3, 3: 4 },
  },
  {
    id: 3,
    number: 3,
    block: 'A',
    text: 'To which one of the following four types of persons do majority of your friends belong?',
    options: [
      { value: 1, label: 'Persons who love to spend money very much.' },
      { value: 2, label: 'Persons who love to spend money but adjust it according to their earning.' },
      { value: 3, label: 'Persons who love to save money but do spend where social prestige is involved.' },
      { value: 4, label: 'Persons who love to save money very much.' },
    ],
    rowWeights: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 4,
    number: 4,
    block: 'A',
    text: 'Which one of the following four types of work do you like most?',
    options: [
      { value: 1, label: 'Completely repetitive work.' },
      { value: 2, label: 'Moderately repetitive work.' },
      { value: 3, label: 'Slightly repetitive work.' },
      { value: 4, label: 'Completely non-repetitive work.' },
    ],
    rowWeights: { 4: 1, 3: 2, 2: 3, 1: 4 },
  },
  {
    id: 5,
    number: 5,
    block: 'A',
    text: 'Which one of the following four types of persons do you like most to have with you in a social gathering?',
    options: [
      { value: 1, label: 'Those who would initiate the spirit of laughing and talking in the function.' },
      { value: 2, label: 'Those who would not initiate but join others in laughing and talking to make the function lively.' },
      { value: 3, label: 'Those who would laugh and talk only to keep friendly terms with others.' },
      { value: 4, label: 'Those who would always prefer to be silent and observe others activities.' },
    ],
    rowWeights: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 6,
    number: 6,
    block: 'A',
    text: 'Which one of the following four types of persons do you like most to have as your friends?',
    options: [
      { value: 1, label: 'Persons who will never do anything without planning.' },
      { value: 2, label: 'Persons who will do planning in most of the occasions.' },
      { value: 3, label: 'Persons who will never like to plan before doing a thing.' },
      { value: 4, label: 'Persons who will do planning only on rare occasions.' },
    ],
    rowWeights: { 4: 1, 3: 2, 2: 3, 1: 4 },
  },
  {
    id: 7,
    number: 7,
    block: 'A',
    text: 'Which one of the following four types of persons do you like most to have as your friends?',
    options: [
      { value: 1, label: 'Those who usually feel happy.' },
      { value: 2, label: 'Those who feel happy most of the times.' },
      { value: 3, label: 'Those who feel happy occasionally.' },
      { value: 4, label: 'Those who do not feel happy usually.' },
    ],
    rowWeights: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 8,
    number: 8,
    block: 'A',
    text: 'What will you do during a disturbing mass demonstration on a political issue?',
    options: [
      { value: 1, label: 'Go and take active part.' },
      { value: 2, label: 'Observe the situation without taking any active part.' },
      { value: 3, label: 'Enquire about the situation for the sake of curiosity from a distance.' },
      { value: 4, label: 'Avoid the situation altogether.' },
    ],
    rowWeights: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 9,
    number: 9,
    block: 'A',
    text: 'How would you like to have a strong opponent and contest with him?',
    options: [
      { value: 1, label: 'Always prefer to have a strong opponent and contest with him.' },
      { value: 2, label: 'Sometimes prefer to have a strong opponent and contest with him.' },
      { value: 3, label: 'Usually prefer not to have a strong opponent and like to withdraw.' },
      { value: 4, label: 'Practically do not prefer to have a strong opponent and always like to withdraw.' },
    ],
    rowWeights: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 10,
    number: 10,
    block: 'A',
    text: 'To what extent does lack of careful planning make you disturbed?',
    options: [
      { value: 1, label: 'To a great extent.' },
      { value: 2, label: 'To some extent.' },
      { value: 3, label: 'To little extent.' },
      { value: 4, label: 'To practically no extent.' },
    ],
    rowWeights: { 4: 1, 3: 2, 2: 3, 1: 4 },
  },
  {
    id: 11,
    number: 11,
    block: 'A',
    text: 'Which one of the following four types of work would you like most to do?',
    options: [
      { value: 1, label: 'Work which involves too much of delicacies (Consideration).' },
      { value: 2, label: 'Work which involves delicacies but not too much of them.' },
      { value: 3, label: 'Work which preferably does not involve delicacies.' },
      { value: 4, label: 'Work which involves no delicacy at all.' },
    ],
    rowWeights: { 4: 1, 3: 2, 2: 3, 1: 4 },
  },

  // ==========================================
  // BLOCK B: QUESTIONS 12 TO 28 (5-Point Likert Scale)
  // ==========================================
  ...[
    { num: 12, text: 'Always thinking about yourself.', introverted: true },
    { num: 13, text: 'Thinking much before accepting a new issue or an idea.', introverted: true },
    { num: 14, text: 'Starting conversation with a stranger.', introverted: false },
    { num: 15, text: 'Sticking to a task in spite of your failures.', introverted: true },
    { num: 16, text: "Standing other's criticism calmly.", introverted: false },
    { num: 17, text: 'To be cautious while making decisions.', introverted: true },
    { num: 18, text: 'To have always a planned life.', introverted: true },
    { num: 19, text: 'Always keeping confidence in others.', introverted: false },
    { num: 20, text: 'Taking leading parts in social functions.', introverted: false },
    { num: 21, text: 'Like the idea of having a limited number of friends and associates.', introverted: true },
    { num: 22, text: 'Always take particular care of personal properties (watches, clothes etc.).', introverted: true },
    { num: 23, text: 'Always approaching others to make friendship with them.', introverted: false },
    { num: 24, text: 'Always be cautious about possible misfortunes.', introverted: true },
    { num: 25, text: 'Prefer thinking alone about a problem till it is solved.', introverted: true },
    { num: 26, text: 'Always like to plan about future work.', introverted: true },
    { num: 27, text: 'Changing your work from one type to another.', introverted: false },
    { num: 28, text: 'Analyzing your thoughts and motives.', introverted: true },
  ].map((item) => ({
    id: item.num,
    number: item.num,
    block: 'B',
    text: item.text,
    options: [
      { value: 1, label: 'Like the activity to a great extent.' },
      { value: 2, label: 'Dislike the activity to a great extent.' },
      { value: 3, label: 'Like the activity to some extent.' },
      { value: 4, label: 'Dislike the activity to some extent.' },
      { value: 5, label: 'More or less indifferent towards the activity.' },
    ],
    rowWeights: item.introverted
      ? { 2: 1, 4: 2, 5: 3, 3: 4, 1: 5 }
      : { 1: 1, 3: 2, 5: 3, 4: 4, 2: 5 },
  })),

  // ==========================================
  // BLOCK C: QUESTIONS 29 TO 42 (3 Choices Each)
  // ==========================================
  ...[
    { num: 29, text: 'While doing a work, do you pay more attention to details than to important aspects only?', introverted: true },
    { num: 30, text: 'Do you prefer more to work alone than in groups?', introverted: true },
    { num: 31, text: 'Do you find more interest in spending time with books than with people?', introverted: true },
    { num: 32, text: 'Do you want to derive knowledge more through books than through practical experience?', introverted: true },
    { num: 33, text: 'Do you usually avoid trouble rather than facing it?', introverted: true },
    { num: 34, text: 'Do you prefer indoor games to outdoor games?', introverted: true },
    { num: 35, text: 'Do you like more to live in a lonely place rather than in a lively one?', introverted: true },
    { num: 36, text: 'Do you like more to take part in an argument than to remain silent?', introverted: false },
    { num: 37, text: 'Do you prefer more to leave a social gathering earlier rather than spending much time in it?', introverted: true },
    { num: 38, text: 'Do you feel that you present a case better through writing than through speaking?', introverted: true },
    { num: 39, text: 'In your routine actions of the days (walking, dressing, talking, etc.), do you like to finish them quickly rather than doing them after careful consideration?', introverted: true },
    { num: 40, text: 'Do you easily remember your daily expenses in specific details rather than forgetting them mostly?', introverted: true },
    { num: 41, text: 'Do you prefer to take up the responsibility of directing others in doing a work rather than having somebody else to direct you?', introverted: false },
    { num: 42, text: 'Do you prefer to work on the last moment rather than starting it earlier?', introverted: false },
  ].map((item) => ({
    id: item.num,
    number: item.num,
    block: 'C',
    text: item.text,
    options: [
      { value: 1, label: 'Agree with the preference given.' },
      { value: 2, label: 'Disagree with the preference given.' },
      { value: 3, label: 'No positive preference for either activity.' },
    ],
    rowWeights: item.introverted
      ? { 2: 1, 3: 2, 1: 3 }
      : { 1: 1, 3: 2, 2: 3 },
  })),

  // ==========================================
  // BLOCK D: QUESTIONS 43 TO 56 (3 Choices Each)
  // ==========================================
  ...[
    { num: 43, text: 'Checking and rechecking of letters before mailing.', introverted: true },
    { num: 44, text: 'Sitting alone for a long time without being tired.', introverted: true },
    { num: 45, text: 'Concealing your activities from others.', introverted: true },
    { num: 46, text: 'Feel disturbed to a great extent after doing something wrong.', introverted: true },
    { num: 47, text: 'Calling persons who cross streets to avoid meeting you.', introverted: false },
    { num: 48, text: 'To make it a point to be outspoken while speaking.', introverted: false },
    { num: 49, text: "Feeling hurt at other's aggressive behavior.", introverted: true },
    { num: 50, text: 'Voluntarily giving explanations of what you have done.', introverted: true },
    { num: 51, text: 'Hesitating to ask for loans from others.', introverted: true },
    { num: 52, text: 'Delivering a written report.', introverted: true },
    { num: 53, text: 'Feeling disturbed when people watch at your activities.', introverted: true },
    { num: 54, text: 'Feeling difficult to start conversations with strangers.', introverted: true },
    { num: 55, text: 'Analyzing the feelings and motives of others.', introverted: true },
    { num: 56, text: 'Remaining alone during emotional stress.', introverted: true },
  ].map((item) => ({
    id: item.num,
    number: item.num,
    block: 'D',
    text: item.text,
    options: [
      { value: 1, label: 'True in most cases.' },
      { value: 2, label: 'Not true in most cases.' },
      { value: 3, label: 'True in some cases.' },
    ],
    rowWeights: item.introverted
      ? { 2: 1, 3: 2, 1: 3 }
      : { 1: 1, 3: 2, 2: 3 },
  })),

  // ==========================================
  // BLOCK E: QUESTIONS 57 TO 70 (2 Choices: Y / N)
  // ==========================================
  ...[
    { num: 57, text: 'Are you always conscientious in your activities?', introverted: true },
    { num: 58, text: 'Can you tolerate slight abnormality in health?', introverted: false },
    { num: 59, text: "Can you work better when you get incentives through other's praise?", introverted: true },
    { num: 60, text: 'Do you dislike to write about yourself even to very close friends?', introverted: true },
    { num: 61, text: 'Do you day dream very frequently?', introverted: true },
    { num: 62, text: 'Do you usually think about yourself?', introverted: true },
    { num: 63, text: 'Do you like to talk much at social gatherings?', introverted: false },
    { num: 64, text: 'Do you prefer to work alone rather than doing the task with others?', introverted: true },
    { num: 65, text: 'Do you hesitate in making friendship with opposite sex?', introverted: true },
    { num: 66, text: 'Can you easily work against opposition?', introverted: false },
    { num: 67, text: 'Do you prefer to take the role of introducing others in a social gathering?', introverted: false },
    { num: 68, text: 'Are you usually cautious when you start conversation with others?', introverted: true },
    { num: 69, text: 'Do you consider yourself to be greatly sentimental?', introverted: true },
    { num: 70, text: 'Do you usually control you temper?', introverted: false },
  ].map((item) => ({
    id: item.num,
    number: item.num,
    block: 'E',
    text: item.text,
    options: [
      { value: 'Y', label: 'Y – Applicable in your case.' },
      { value: 'N', label: 'N – Not applicable in your case.' },
    ],
    rowWeights: item.introverted
      ? { N: 1, Y: 2 }
      : { Y: 1, N: 2 },
  })),
];

export const BLOCK_METADATA = {
  A: {
    name: 'Block A',
    range: [1, 11],
    itemCount: 11,
    choicesPerItem: 4,
    description: 'Objective situations and activities',
    instructions:
      'For each of the items 1 to 11, you will find 4 possible answers, only one of which you will have to choose so that it suits best in your case. Pick out your chosen answer.',
  },
  B: {
    name: 'Block B',
    range: [12, 28],
    itemCount: 17,
    choicesPerItem: 5,
    description: 'Introspective activities and attitudes',
    instructions:
      'For each of the items 12 to 28, indicate the degree to which you like or dislike the activity (Like to great extent, Dislike to great extent, Like to some extent, Dislike to some extent, Indifferent).',
  },
  C: {
    name: 'Block C',
    range: [29, 42],
    itemCount: 14,
    choicesPerItem: 3,
    description: 'Preference comparison between pairs of activities',
    instructions:
      'In each of the items 29 to 42, indicate your preference (Agree with preference, Disagree with preference, or No positive preference).',
  },
  D: {
    name: 'Block D',
    range: [43, 56],
    itemCount: 14,
    choicesPerItem: 3,
    description: 'Personal feelings and behavior occurrences',
    instructions:
      'For each of the items 43 to 56, select whether the statement is True in most cases, Not true in most cases, or True in some cases.',
  },
  E: {
    name: 'Block E',
    range: [57, 70],
    itemCount: 14,
    choicesPerItem: 2,
    description: 'Forced-choice habits and dispositions',
    instructions:
      'In each of the items 57 to 70, indicate whether the activity is applicable (Y) or not applicable (N) in your case.',
  },
};

