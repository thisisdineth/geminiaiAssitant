const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR API KEY"; // replace your API key in here you can get it at google studio AI API
        const CLUB_MEMORY = `
Your bots memory here `;

        let chatMemory = []; // To store users chat me
        const chatBody = document.getElementById("chat-body");
        const userInput = document.getElementById("user-input");
        const sendButton = document.getElementById("send-button");

        const addMessage = (content, sender, isHTML = false) => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", sender);

            const avatar = document.createElement("img");
            avatar.classList.add("avatar");
            avatar.src = sender === "user" ? "./img/user.png" : "./img/backend.png";

            const text = document.createElement("div");
            text.classList.add("text");

            if (isHTML) {
                text.innerHTML = content; 
            } else {
                text.textContent = content; 
            }

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(text);

            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight; 
        };

        const fetchResponse = async (message) => {
            try {
                const memoryText = chatMemory.map(
                    (entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
                ).join("\n\n");

                const prompt = `
                You are an AI assistant designed to answer questions about YOUR BOTS BEHAVE

                Refer to the provided memory for accurate information:
                ${CLUB_MEMORY}

                Previous conversation for context:
                ${memoryText}

                Question from user:
                ${message}

                Respond as follows:
                - Maintain a friendly yet professional tone.
                - Use bullet points or numbered lists for clarity when needed.
                - Include links or references only if highly relevant.
                - Avoid unnecessary repetition or overly detailed responses.

                AI:
                `;
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{ text: prompt }]
                        }]
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error.message);

                let botMessage = data?.candidates[0]?.content?.parts[0]?.text || "No response.";

                botMessage = botMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                botMessage = botMessage.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}" target="_blank" style="color: white;">${url}</a>`);

                chatMemory.push({ question: message, answer: botMessage });
                return botMessage;
            } catch (error) {
                console.error(error);
                return "Sorry, something went wrong. Please try again later.";
            }
        };

        const disableInput = (disable) => {
            userInput.disabled = disable; 
            sendButton.disabled = disable; 

            
            const sampleButtons = document.querySelectorAll('.sample-message-container button');
            sampleButtons.forEach((button) => {
                button.disabled = disable; 
                button.style.cursor = disable ? "not-allowed" : "pointer";
            });

           
            sendButton.style.cursor = disable ? "not-allowed" : "pointer";
            userInput.style.cursor = disable ? "not-allowed" : "text";
        };


        const handleUserMessage = async () => {
            const message = userInput.value.trim();
            if (!message) return;

            addMessage(message, "user");
            userInput.value = "";

            disableInput(true); 
            addMessage("Typing...", "bot");

            const botMessage = await fetchResponse(message);
            chatBody.lastChild.remove(); 

            addMessage(botMessage, "bot", true);

            disableInput(false); 
        };



        const sendSampleMessage = (message) => {
            if (sendButton.disabled) return; 
            userInput.value = message;
            handleUserMessage();
        };


        sendButton.addEventListener("click", handleUserMessage);
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserMessage();
        });
