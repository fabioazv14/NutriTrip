import OpenAI from 'openai'

// Key is loaded via dotenv in server.js
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai
