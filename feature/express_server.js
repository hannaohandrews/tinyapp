const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


// COOKIES 
app.use(cookieParser());

// Body-Parser
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// LOGIN
// app.get("/login", (req,res) => {
//   res.redirect("/urls");
// });

app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies.username,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req,res) => {
  res.clearCookie("username",{path:"/"});
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if (req.body) {
    let short = generateRandomString();
    urlDatabase[short] = req.body.longURL;
    res.redirect(`/urls/${short}`);
  }
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// EDIT
app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


//NEW
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL:urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

const generateRandomString = () => {
  let randomString = '';
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

/////// LAST /////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

