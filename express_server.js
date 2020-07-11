
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

//const { getUserByEmail } = require('./helpers.js');

const getUserByEmail = function(email,users) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

app.use(cookieSession({
  name: 'session',
  keys: ['Hannah-Banana-Fofana-Lolana','whyyyyyyyyyyyAreeeeeeYouuuuuuuuuuHeeerrreeee']
}));

// BODY-PARSER
app.use(bodyParser.urlencoded({extended: true}));

// GO TO VIEWS FOLDER
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('123', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('123', 10)
  }
};

const urlsForUserID = (id) => {
  const results = {};
 
  for (let shortURL in urlDatabase) {
    let userId = urlDatabase[shortURL].userID;
    if (id === userId) {
      results[shortURL] = urlDatabase[shortURL];
    }
  }
  return results;
};


app.get("/", (req, res) => {
  if (req.body.id === users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }

});
// NEW LOGIN
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    users: users
  };
  res.render("login_index", templateVars);
});


// NEW LOGIN
app.post("/login", (req,res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if ((bcrypt.compareSync(req.body.password, users[user].password)) === true) {
        req.session.user_id = user;
        res.redirect('/urls');
      } else {
        res.status(401).send("It's more fun to be Logged-in...<a href='/login'>Click Here</a>");
      }
    } else {
      res.redirect(401,'/register');
    }
  }
});

// LOGIN
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    users: users
  };
  res.render("login_index", templateVars);
});

// LOGOUT
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/login');
});

// URLS PAGE
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUserID(req.session.user_id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Not logged in yet! <a href='/login'>Login Here</a> or <a href='/register'>Register</a>");
  }
  
});

// SHORT URL RANDOM
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  if (req.session.user_id) {
    let short = generateRandomString();
    urlDatabase[short] = { longURL: longURL, userID: req.session.user_id };
    res.redirect(`/urls/${short}`);
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      users: users
    };
    res.render("error",templateVars);
  }
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Nice try.. but not yours... <a href='/urls'>Click Here</a>");
  }

});

// EDIT
app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL  = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("It's not nice to steal...<a href='/urls'>Click Here</a>");
  }
});

//NEW//
app.get("/urls/new",(req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id in users) {
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

// SHORTURL
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.shortURL;
    let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL , user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Not logged in dummy.. <a href='/login'>Login Here</a>");
  }
 
});

// U/SHORTURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// USER REGISTRATION GET
app.get('/register', (req,res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('register_index',templateVars);
});

// USER REGISTRATION POST
app.post('/register', (req,res) => {
  const hashedPassword = bcrypt.hashSync(req.body["password"], 10);

  let user = {
    id : generateRandomString(),
    email : req.body.email,
    password : req.body["password"]
  };

  if (user.email === '' || user.password === '' || getUserByEmail(user.email)) {
    res.status(400).send("Not Registered dummy...<a href='/register'> Register Here</a>");

  } else {
    req.session.user_id = user.id;
    users[user.id] = { id: users[user.id], email: user.email, password: hashedPassword };
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



