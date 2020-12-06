import React, { useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBuxCVCsom_oKeumVm9Y1Cjl3PHgeCp64",
  authDomain: "chainchat-79d21.firebaseapp.com",
  projectId: "chainchat-79d21",
  storageBucket: "chainchat-79d21.appspot.com",
  messagingSenderId: "1079188430112",
  appId: "1:1079188430112:web:612ce99fb7de41a87fcb45"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChainChat ⛓️</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithoutCredentials = () => {
    firebase.auth().signInAnonymously()
      .then(() => {
        console.log("You signed in!");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Aww. Error:", errorCode, errorMessage);
      })
  }

  return (
    <>
      <button onClick={signInWithoutCredentials}>
        Sign in anonymously
      </button>
      <p>Hello</p>
    </>
  )

}

function SignOut() {
  if (!auth.currentUser) {
    return <p/>
  } else {
    return (
      <button onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  }
}

function ChatRoom() {
  const messagesRef = firebase.firestore().collection("messages");
  const query = messagesRef.orderBy("timestamp");

  const [messages] = useCollectionData(query, {idField: "id"});

  // Use hook to get/set form's value; remember selected chat message
  const [formValue, setFormValue] = useState('');
  const [selectedMessage, setSelectedMessage] = useState();


  // TODO draw the graph and connect the messages properly.
  let drawme;
  if (messages) {
    drawme = messages.map(msg => 
      <ChatMessage key={msg.id} content={msg} select={setSelectedMessage}/>
    )
  }
  
  // Send messages
  const sendMessage = async (e) => {
    // Don't have the page refresh upon form submission
    e.preventDefault();

    // Pass along relevant data to the firebase collection object's "add" function
    await messagesRef.add({
      text: formValue,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      uid: auth.currentUser.uid,
      parent_message: selectedMessage,
      parent_text: null
    })

    // Clear the form
    setFormValue('');
  }

  return (
    <>
      <main>{drawme}</main>
      <p>Send message component</p>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Chit Chat, but with chained responses" />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
      <p>Selected message: {selectedMessage}</p>
    </>
  )
}

function ChatMessage({content, select}) {
  return (
    <div onClick={() => select(content.id)}>
      <p>{content.uid}: {content.text}</p>
    </div>
  )
}
export default App;
