// src/backend/routes/chat.js

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
const faqs = JSON.parse(fs.readFileSync(new URL('../faqs.json', import.meta.url), 'utf-8'));
import natural from 'natural';
import stringSimilarity from 'string-similarity';

dotenv.config();

const router = express.Router();

const HUGGINGFACE_API_URL =
  'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// Rule-based responses
function getRuleBasedResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('reset password')) {
    return 'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions sent to your email.';
  } else if (lowerMessage.includes('compare prices')) {
    return 'You can compare prices by using our "Compare Prices" feature on the home screen.';
  } else if (lowerMessage.includes('browse menus')) {
    return 'You can browse menus from various restaurants by selecting the "Browse" option on the main menu.';
  }
  return null;
}

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

function preprocess(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stemmedTokens = tokens.map((token) => stemmer.stem(token));
  return stemmedTokens.join(' ');
}

// Enhanced FAQ lookup function
function findAnswer(userQuestion) {
  // Preprocess user question
  const preprocessedUserQuestion = preprocess(userQuestion);

  // First, check for substring matches
  const lowerUserQuestion = userQuestion.toLowerCase();
  for (const faq of faqs) {
    const lowerFaqQuestion = faq.question.toLowerCase();
    if (lowerFaqQuestion.includes(lowerUserQuestion) || lowerUserQuestion.includes(lowerFaqQuestion)) {
      return faq.answer;
    }
  }

  // Fallback to string similarity with preprocessing
  const preprocessedFaqQuestions = faqs.map((faq) => preprocess(faq.question));
  const matches = stringSimilarity.findBestMatch(preprocessedUserQuestion, preprocessedFaqQuestions);
  const bestMatch = matches.bestMatch;

  if (bestMatch.rating > 0.4) { // Adjust similarity threshold
    const faq = faqs[matches.bestMatchIndex];
    return faq.answer;
  }

  return null;
}

// chatbot route to handle user queries
router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request format.' });
  }

  const latestMessage = messages[messages.length - 1];
  const userMessageContent = latestMessage.content;

  // Rule-based response
  const ruleResponse = getRuleBasedResponse(userMessageContent);
  if (ruleResponse) {
    res.json({ reply: ruleResponse });
    return;
  }

  // FAQ lookup
  const faqAnswer = findAnswer(userMessageContent);
  if (faqAnswer) {
    res.json({ reply: faqAnswer });
    return;
  }

  // Since conversation history is not important, only send the latest user message
  const systemPrompt = 'You are a helpful assistant for the FeastFinder app.';

  // Build the input for the model
  const inputText = `${systemPrompt}\nUser: ${userMessageContent}`;

  // Check the length of the inputText
  console.log('Input Text Length:', inputText.length);

  const payload = {
    inputs: inputText,
  };

  const makeRequest = async () => {
    try {
      const response = await axios.post(HUGGINGFACE_API_URL, payload, {
        headers: { Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}` },
        params: { wait_for_model: true },
      });

      console.log('Hugging Face API response:', response.data);

      // Correctly access the assistant's reply from the response array
      const assistantReply =
        (response.data &&
          Array.isArray(response.data) &&
          response.data[0].generated_text) ||
        "I'm sorry, I couldn't generate a response.";

      res.json({ reply: assistantReply });
    } catch (error) {
      console.error('Error with Hugging Face API:', error.response?.data || error.message);

      // Handle model loading error
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.includes('is currently loading')
      ) {
        // Wait for the model to load and retry
        const estimatedTime = error.response.data.estimated_time
          ? Math.ceil(error.response.data.estimated_time * 1000) + 5000 // Add a 5-second buffer
          : 30000; // Default to 30 seconds if not provided

        console.log(`Model is loading. Retrying in ${estimatedTime / 1000} seconds...`);

        setTimeout(async () => {
          await makeRequest(); // Retry the request
        }, estimatedTime);
      } else {
        res.status(500).json({ error: 'An error occurred with the chatbot.' });
      }
    }
  };

  await makeRequest();
});

export default router;

