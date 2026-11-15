/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

const workerUrl = "https://old-dream-4f50.1kylaford.workers.dev/";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Send the user's message to the class Worker.
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userInput.value }],
      }),
    });

    // Stop if the Worker could not process the request.
    if (!response.ok) {
      throw new Error(`Worker returned status ${response.status}`);
    }

    // Display the assistant's reply.
    const data = await response.json();
    chatWindow.textContent = data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    chatWindow.textContent = "An error occurred. Please try again.";
  }
});
