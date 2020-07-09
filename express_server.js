const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


// COOKIES 
app.use(cookieParser());

// Body-Parser
app.use(bodyParser.urlencoded({extended: true}));

// go to views folder 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


// NEW LOGIN

app.post("/login", (req,res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (req.body.password === users[user].password){
        res.cookie('user_id',user);
        res.redirect('/urls');
        return;
      }
    }
  }
  res.send('ERROR 403');

});

// LOGIN cookie  (new)
app.get("/login", (req, res) => {
  let templateVars = { 
    user: users[req.cookies.user_id],
    users: users
  };
  res.render("login_index", templateVars);
});

// LOGOUT
app.post("/logout", (req,res) => {
  res.clearCookie("user_id",{path:"/"});
  res.redirect('/urls');
});

// URLS PAGE
app.get("/urls", (req, res) => {
  let templateVars = { 
    user: users[req.cookies.user_id],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// short url random
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
  let templateVars = {user: users[req.cookies.user_id]}
  res.render("urls_new",templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// short url
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL:urlDatabase[shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// user registration
app.get('/register', (req,res) => {
  let templateVars = { user: users[req.cookies.user_id] }
  res.render('register_index',templateVars)
})

// REGISTER
app.post('/register', (req,res) => {

  let user = {
    id : generateRandomString(),
    email : req.body.email,
    password : req.body.password
  } 

  const EmailExisting = function(email) {
    for (const user in users) {
      if (users[user].email === email) {
        return user;
      }}
  };

  if (user.email === '' || user.password === '' || EmailExisting (user.email)) {
    res.send("400 Bad Request")
  } else {
    res.cookie('user_id',user.id);
    users[user.id] = user;
    res.redirect('/urls');
  }
})

// RANDOM NUM
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



