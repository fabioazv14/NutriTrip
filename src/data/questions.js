export const questions = [
  {
    question: "What is your goal?",
    options: [
      { label: 'Lose weight', value: 'lose' },
      { label: 'Maintain weight', value: 'maintain' },
      { label: 'Gain weight', value: 'gain' },
      { label: 'Gain muscules', value: 'muscle' },
    ],
  },
  {
    question: "What is your sex?",
    switch: true,
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
  {
    question: "What is your diet?",
    options: [
      { label: 'None', value: 'none' },
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
      { label: 'None', value: 'none' },
      { label: 'Dairy', value: 'dairy' },
      { label: 'Gluten', value: 'gluten' },
      { label: 'Nuts', value: 'nuts' },
      { label: 'Soy', value: 'soy' },
      { label: 'Cinnamon', value: 'cinnamon' },
      { label: 'Sea Food', value: 'sea' },
    ],
  },
  {
    question: "How much are you willing to spend on food per day?",
    options: [
      { label: '$10', value: '10' },
      { label: '$20', value: '20' },
      { label: '$30', value: '30' },
      { label: '$40', value: '40' },
      { label: '$50', value: '50' },
    ],
  },
  {
    question: "How much time are you willing to spend cooking?",
    options: [
      { label: '5-10 min', value: '1' },
      { label: '10-20 min', value: '2' },
      { label: '20-30 min', value: '3' },
      { label: '30-60 min', value: '4' },
    ],
  }
]