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
    question: "What is your diet?",
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
    options: [
      { label: 'No', value: 'no' },
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
  }
]