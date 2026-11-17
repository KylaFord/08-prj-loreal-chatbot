/* DOM elements */
const chatForm = document.getElementById("chatForm");
const usrInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

// Change this to the country your chatbot is for.
const currentCountry = "not specified";

const workerUrl = "https://old-dream-4f50.1kylaford.workers.dev/";

function buildSystemPrompt(country) {
  return `
You are a warm, friendly, and encouraging beauty assistant for L’Oréal. Help users understand L’Oréal products and share practical skin-care, makeup, and beauty tips.

Tone and style:
- Be kind, upbeat, natural, and conversational.
- Keep answers clean, concise, and easy to scan. Answer directly and include only useful details.
- Use short paragraphs. Use simple numbered steps only when instructions need them.
- Use emojis occasionally when they add warmth, but do not overuse them.
- Do not use hashtags, asterisks, bold or italic formatting, or decorative symbols.
- Be reassuring without making promises or judging anyone’s appearance.

Scope:
- Answer only questions about L’Oréal products and related skin-care, makeup, or beauty advice.
- Recommend only products confirmed in the approved L’Oréal product catalog for \${country}. Do not recommend or compare with competitors.
- If a request is outside this scope, kindly say you can help with L’Oréal products and beauty advice.
- Do not invent product details, ingredients, claims, directions, prices, or availability. If information is not confirmed, say so.
- Product names, formulas, directions, and availability may vary by country.

Safety:
- Do not diagnose or treat skin conditions, or describe cosmetic products as medical treatments.
- For persistent, severe, painful, or worsening skin concerns, gently suggest consulting a qualified healthcare professional.
- If a product causes irritation or an allergic reaction, advise stopping use. For severe symptoms, recommend urgent medical care.
- Suggest checking the ingredient list and doing a patch test when appropriate.

Be honest and helpful. If you are unsure, say so kindly rather than guessing.
`.trim();
}

// Create typing animation indicator
function createTypingIndicator() {
  const container = document.createElement("div");
  container.classList.add("typing-indicator");
  container.innerHTML = "<span></span><span></span><span></span>";
  return container;
}

function addMessageBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", `chat-bubble--${sender}`);
  
  // Create a text content div to handle the actual message
  const textContent = document.createElement("div");
  textContent.textContent = text;
  bubble.appendChild(textContent);
  
  // Add copy button for assistant messages
  if (sender === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.classList.add("copy-btn");
    copyBtn.textContent = "Copy";
    copyBtn.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 2000);
      });
    };
    bubble.appendChild(copyBtn);
  }
  
  chatWindow.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

// Auto-scroll to the bottom of the chat
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show a friendly greeting when the chat loads.
addMessageBubble(
  "👋 Hi there! I’m happy to help with L’Oréal products, skin care, makeup, and beauty tips. What would you like to know? 😊",
  "assistant"
);

// Clear chat button functionality
clearBtn.addEventListener("click", () => {
  chatWindow.replaceChildren();
  addMessageBubble(
    "👋 Hi there! I'm happy to help with L'Oréal products, skin care, makeup, and beauty tips. What would you like to know? 😊",
    "assistant"
  );
  usrInput.focus();
});

function setLoadingState(isLoading) {
  usrInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = usrInput.value.trim();
  if (!question) return;

  // Show the user's question above the AI response.
  addMessageBubble(question, "user");

  // Create a loading bubble with typing animation
  const loadingBubble = document.createElement("div");
  loadingBubble.classList.add("chat-bubble", "chat-bubble--assistant");
  loadingBubble.appendChild(createTypingIndicator());
  chatWindow.appendChild(loadingBubble);
  scrollToBottom();

  usrInput.value = "";
  setLoadingState(true);

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(currentCountry)
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Worker returned status \${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
    // Remove loading bubble
    loadingBubble.remove();
    
    // Add the actual response
    addMessageBubble(assistantMessage, "assistant");
  } catch (error) {
    console.error("Error:", error);
    loadingBubble.remove();
    addMessageBubble(
      "I'm sorry, something went wrong. Please try again in a moment. 😊",
      "assistant"
    );
  } finally {
    setLoadingState(false);
    usrInput.focus();
  }
});


