
import { 
  hideLoginError, 
  showLoginState, 
  showLoginForm, 
  showApp, 
  showLoginError, 
  btnLogin,
  btnSignup,
  btnLogout,
  date,
  leftarrow,
  rightarrow,
  submitguess,
  hspec,
  cspec,
  hveg,
  cveg,
  lockForm
} from './ui'


import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

import { 
  getAuth,
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCEl2zAeAeE0TG_sWECL4jgui8qeUmhL_I",
  authDomain: "chef-mike-s-sportsbook.firebaseapp.com",
  databaseURL: "https://chef-mike-s-sportsbook-default-rtdb.firebaseio.com",
  projectId: "chef-mike-s-sportsbook",
  storageBucket: "chef-mike-s-sportsbook.appspot.com",
  messagingSenderId: "221237039776",
  appId: "1:221237039776:web:e66228e5c092cd6ded6fc5",
  measurementId: "G-BR1338WX3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore();
//connectFirestoreEmulator(db, '127.0.0.1', 8080);
//connectAuthEmulator(auth, "http://localhost:9099")


// Login using email/password
const loginEmailPassword = async () => {
  const loginEmail = txtEmail.value
  const loginPassword = txtPassword.value

  try {
    await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error)
  }
}

// Create new account using email/password
const createAccount = async () => {
  const email = txtEmail.value
  const password = txtPassword.value

  try {
    if (!(email.includes("@columbia.edu") || email.includes("@barnard.edu"))) {
      throw new Error("Must use a Columbia/Barnard email");
    }
    await createUserWithEmailAndPassword(auth, email, password).then(addUser);
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error)
  }
}

async function addUser() {
  try {
    console.log("new user");
    const docRef = await setDoc(doc(db, auth.currentUser.uid, "score"), {
      points: 0,
      name: auth.currentUser.email,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Monitor auth state
const monitorAuthState = async () => {
  onAuthStateChanged(auth, async user => {
    if (user) {
      populatefields()
      showApp()
      lblAuthState.innerHTML = user.email
      showdate()
      hideLoginError()
      hideLinkError()
    }
    else {
      showLoginForm()
      lblAuthState.innerHTML = `You're not logged in.`
    }
  })
}

async function populatefields() {
  const docRef = doc(db, auth.currentUser.uid, `${date2.getMonth()+1}-${date2.getDate()}-${date2.getFullYear()}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    hspec.value = docSnap.data().hotspecial;
    cspec.value = docSnap.data().coldspecial;
    hveg.value = docSnap.data().hotvegan;
    cveg.value = docSnap.data().coldvegan;
    lockForm();
    if (offset == 0) {
      guessedtoday = true;
    }
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}

// Log out
const logout = async () => {
  await signOut(auth);
}

async function submission(event) {
  event.preventDefault();
  try {
    const docRef = await setDoc(doc(db, auth.currentUser.uid, `${date2.getMonth()+1}-${date2.getDate()}-${date2.getFullYear()}`), {
      hotspecial: hspec.value,
      coldspecial: cspec.value,
      hotvegan: hveg.value,
      coldvegan: cveg.value
    });
    lockForm();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function unlockForm() {
  hspec.setAttribute("readonly", "");
  cspec.setAttribute("readonly", "");
  hveg.setAttribute("readonly", "");
  cveg.setAttribute("readonly", "");
  hspec.classList.remove("locked");
  cspec.classList.remove("locked");
  hveg.classList.remove("locked");
  cveg.classList.remove("locked");
}

function showdate() {
  date.innerHTML = `${months[date2.getMonth()]} ${date2.getDate()}, ${date2.getFullYear()}`;
}

function prevday(event) {
  event.preventDefault();
  clear();
  lockForm();
  offset -= 1;
  date2.setDate(date2.getDate() - 1);
  showdate();
  populatefields();
  maybeunlock();
}

function nextday(event) {
  event.preventDefault();
  clear();
  lockForm();
  offset +=1;
  date2.setDate(date2.getDate() + 1);
  showdate();
  populatefields();
  maybeunlock();
}

async function maybeunlock() {
  if(offset == 0) {
    const docRef = doc(db, auth.currentUser.uid, `${date2.getMonth()+1}-${date2.getDate()}-${date2.getFullYear()}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      lockForm();
    } else {
      unlockForm();
    }
  }
}

function clear() {
  hspec.value = ""
  cspec.value = ""
  hveg.value = ""
  cveg.value = ""
}

btnLogin.addEventListener("click", loginEmailPassword) 
btnSignup.addEventListener("click", createAccount)
btnLogout.addEventListener("click", logout)
leftarrow.addEventListener("click", prevday)
rightarrow.addEventListener("click", nextday)
submitguess.addEventListener("click", submission)

monitorAuthState();


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const date1 = new Date();
const date2 = new Date(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate(), date1.getUTCHours() - 4, date1.getUTCMinutes(), date1.getUTCSeconds());
var offset = 0;






