const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const PORT = 8080; 


// COOKIES
app.use(cookieParser());

// BODY-PARSER
app.use(bodyParser.urlencoded({extended: true}));

// GO TO VIEWS FOLDER
app.set("view engine", "ejs");

// //OLD URL
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
// NEW DATABASE

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

const urlsForUserID = (id) => {
  const results = {}
 
for (let shortURL in urlDatabase) {
  let userId = urlDatabase[shortURL].userID
  if (id === userId) {
    results[shortURL] = urlDatabase[shortURL]
  }
} 
return results
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


// NEW LOGIN
app.post("/login", (req,res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (req.body.password === users[user].password) {
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
    urls: urlsForUserID(req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

// SHORT URL RANDOM
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  if (req.cookies.user_id) {
    let short = generateRandomString();
    urlDatabase[short] = { longURL: longURL, userID: req.cookies.user_id  };
    res.redirect(`/urls/${short}`);
  }
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Nice try.. but not yours... <a href='/urls'>Click Here</a>")
  }

});

// EDIT
app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL  = req.body.longURL;
  res.redirect("/urls");
  } else {
    res.status(400).send("Nice try.. but not yours... <a href='/urls'>Click Here</a>")
  }
});

//NEW//
app.get("/urls/new",(req, res) => {
  let templateVars = { 
    user: users[req.cookies.user_id]
  };
  if (req.cookies.user_id in users){
    res.render("urls_new",templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//HELLO
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// URLS/SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL:urlDatabase[shortURL].longURL , user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

// U/SHORTURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// USER REGISTRATION GET
app.get('/register', (req,res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render('register_index',templateVars);
});

// USER REGISTRATION POST
app.post('/register', (req,res) => {

  let user = {
    id : generateRandomString(),
    email : req.body.email,
    password : req.body.password
  };

  const EmailExisting = function(email) {
    for (const user in users) {
      if (users[user].email === email) {
        return user;
      }
    }
  };

  if (user.email === '' || user.password === '' || EmailExisting(user.email)) {
    res.send("400 Bad Request");
  } else {
    res.cookie('user_id',user.id);
    users[user.id] = user;
    res.redirect('/urls');
  }
});

// RANDOM NUM
const generateRandomString = () => {
  let randomString = '';
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

// LIST LAST//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



