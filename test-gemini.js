// test-gemini.js

async function testGemini() {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyCNh1nIYierdDHZqNpUcafkKWFAzts8aGU',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Tell me a joke about cats.' }]
          }
        ]
      }),
    }
  );
  const data = await res.json();
  console.log(data);
}

testGemini();
