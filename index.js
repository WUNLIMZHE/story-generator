// HINTS:
// 1. Import express and axios
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const API_URL = "https://v2.jokeapi.dev/joke/Any?type=single";

app.get("/", async (req, res) => {
  // TODO 3: Use axios to PUT the data from req.body to the secrets api servers.
  try {
    const result = await axios.get(API_URL);
    console.log(result);
    res.render("index.ejs", { 
      joke: result.data.joke,
      type: result.data.category,
      language : result.data.lang
    });
  } catch (error) {
    console.log("Error occurs");
    console.log(error.response.data);
    res.status(500);
  }
});

app.post("/", async (req, res) => {

  try {
    console.log("Request body: ", req.body);
    const type = req.body.type;
    const languages = req.body.languages;
    const result = await axios.get(
      `https://v2.jokeapi.dev/joke/${type}?lang=${languages}&type=single`
    );
    console.log(result);
    if (!result.data.joke){
      console.log("No joke found");
      res.render("index.ejs", { 
        joke: result.data.message,
        type: type,
        language : languages
      });
    }else{
      console.log("Joke found!");
      res.render("index.ejs", { 
        joke: result.data.joke,
        type: type,
        language : languages
      });
    }
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
      joke: null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 2. Create an express app and set the port number.

// 3. Use the public folder for static files.

// 4. When the user goes to the home page it should render the index.ejs file.

// 5. Use axios to get a random secret and pass it to index.ejs to display the
// secret and the username of the secret.

// 6. Listen on your predefined port and start the server.
