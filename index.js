// HINTS:
// 1. Import express and axios
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

import fs from "fs";
import path from "path";

import env from "dotenv";
env.config(); // Load environment variables

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateAndSaveAudio(options) {
  try {
    const response = await axios.request(options);
    
    const speechFileName = 'speech.mp3';  // Name of the audio file
    const speechFilePath = path.resolve(`./public/audios/${speechFileName}`);  // Save path
    
    // Write the binary data (audio file) to the file system
    await fs.promises.writeFile(speechFilePath, response.data);
    
    console.log(`Audio file saved to: ${speechFilePath}`);
    
    return speechFileName;  // Return the filename for later use
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  console.log("======================================");
  console.log("Request body: ", req.body);
  const genre = req.body.genre;
  const language = req.body.languages;
  const age = req.body.age;
  const additional = req.body.requirement;
  console.log(`Genre: ${genre}`);
  console.log(`Language: ${language}`);
  console.log(`Age group: ${age}`);
  console.log(`Additional info: ${additional}`);

  const prompt = `Imagine you are an experienced children author, write a ${language} language story with genre ${genre} suitable for age group ${age}. Please include the requirement "${additional} as part of the story. The story should end with a moral of the story. Please limit the story within 20 words.`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.8,
      },
    });

    const story = result.response.text();
    const storyArr = story.split("\n")
    console.log(story);
    
    const options = {
      method: 'POST',
      url: 'https://open-ai-text-to-speech1.p.rapidapi.com/',
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'open-ai-text-to-speech1.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        model: 'tts-1',
        input: story,  // Replace with dynamic input if needed
        voice: 'alloy'
      },
      responseType: 'arraybuffer'  // This tells Axios to treat the response as binary data
    };

    // Generate and save the audio
    const speechFileName = await generateAndSaveAudio(options);
    
    // Render the response, passing the story and audio URL
    res.render("index.ejs", {
      story: storyArr,
      audio: `/audios/${speechFileName}`  // Pass the URL to the MP3 file
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

