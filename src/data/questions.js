export const questions = [
  {
    question: "What is your goal?",
    options: [
      { label: 'Lose weight', value: 'lose' },
      { label: 'Maintain weight', value: 'maintain' },
      { label: 'Gain weight', value: 'gain' },
    ],
  },
  {
    question: "What is your sex?",
    grid: true,
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
  {
    question: "What is your gender?",
    grid: true,
    options: [
      {label: 'Male', value: 'male'},
      {label: 'Female', value: 'female'},
      {label: 'Non-binary', value: 'non-binary'},
      {label: 'Prefer not to say', value: 'prefer-not-to-say'},
    ]
  },
  {
    question: "What is your diet?",
    grid: true,
    options: [
      { label: 'Vegetarian', value: 'vegetarian' },
      { label: 'Vegan', value: 'vegan' },
      { label: 'Gluten-Free', value: 'gluten-free' },
      { label: 'Keto', value: 'keto' },
      { label: 'Paleo', value: 'paleo' },
    ],
  },
  {
    question: "Do you have any food allergies?",
    multiple: true,
    grid: true,
    options: [
      { label: 'No', value: 'no', exclusive: true },
      { label: 'Dairy', value: 'dairy' },
      { label: 'Gluten', value: 'gluten' },
      { label: 'Nuts', value: 'nuts' },
      { label: 'Soy', value: 'soy' },
    ],
  },
  {
    question: "How much are you willing to spend on food per day?",
    options: [
      { label: '$1-$9.99', value: '1-10' },
      { label: '$10-$19.99', value: '10-20' },
      { label: '$20-$29.99', value: '20-30' },
      { label: '$30-$39.99', value: '30-40' },
      { label: '$40-$49.99', value: '40-50' },
    ],
  },
  {
    question: "Would you like to get a customized plan according to your menstrual cycle?",
    grid: true,
    showIf: (answers) => answers[1]?.value === 'female',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    question: "Are you currently pregnant or breastfeeding?",
    grid: true,
    showIf: (answers) => answers[1]?.value === 'female',
    options: [
       { label: 'Yes', value: 'yes' },
       { label: 'No', value: 'no' },
     ],
  }
]