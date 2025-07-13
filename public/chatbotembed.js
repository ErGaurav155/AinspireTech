(function () {
  "use strict";

  // Chatbot Widget Class
  class ChatbotWidget {
    constructor(config) {
      this.config = {
        userId: config.userId,
        isAuthorized: config.isAuthorized,
        chatbotName: config.chatbotName,
        apiUrl: config.apiUrl,
        chatbotType: config.chatbotType,
        filename: config.filename,
        primaryColor: config.primaryColor || "#00F0FF",
        position: config.position || "bottom-right",
        welcomeMessage:
          config.welcomeMessage || "Hi! How can I help you today?",
        ...config,
      };

      this.isOpen = false;
      this.conversationId = null;
      this.messageCount = 0;
      this.showAppointmentForm = false;
      this.messages = [];

      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.bindEvents();
      if (this.config.chatbotType === "chatbot-lead-generation") {
        this.loadAppointmentQuestions();
      }
    }

    createStyles() {
      const styles = `
            .chatbot-widget {
              position: fixed;
              ${
                this.config.position.includes("right")
                  ? "right: 20px;"
                  : "left: 20px;"
              }
              ${
                this.config.position.includes("bottom")
                  ? "bottom: 20px;"
                  : "top: 20px;"
              }
              z-index: 10000;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chatbot-toggle {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: linear-gradient(135deg, ${
                this.config.primaryColor
              }, #B026FF);
              border: none;
              cursor: pointer;
              box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;
              animation: pulse 2s infinite;
            }

            .chatbot-toggle:hover {
              transform: scale(1.1);
              box-shadow: 0 0 20px rgba(0, 240, 255, 0.7);
            }

            .chatbot-toggle svg {
              width: 24px;
              height: 24px;
              fill: white;
            }

            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
              70% { box-shadow: 0 0 0 10px rgba(0, 240, 255, 0); }
              100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
            }

            .chatbot-window {
              position: absolute;
              right: 0px;
              bottom: 70px;
              width: 380px;
              height: 500px;
              background: rgba(10, 10, 10, 0.8);
              border-radius: 16px;
              box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
              display: none;
              flex-direction: column;
              overflow: hidden;
              border: 1px solid rgba(0, 240, 255, 0.3);
              backdrop-filter: blur(10px);
            }

            .chatbot-window.open {
              display: flex;
              animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .chatbot-header {
              background: linear-gradient(to right, ${
                this.config.primaryColor
              }, #B026FF);
              padding: 16px 20px;
              color: black;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .chatbot-header h3 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              display: flex;
              align-items: center;
            }

            .chatbot-header .icon-container {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 8px;
            }

            .chatbot-header .icon-container svg {
              width: 14px;
              height: 14px;
              fill: white;
            }

            .chatbot-header-controls {
              display: flex;
              gap: 10px;
            }

            .chatbot-header-controls button {
              background: none;
              border: none;
              cursor: pointer;
              color: black;
              transition: color 0.2s;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .chatbot-header-controls button:hover {
              color: white;
            }

            .chatbot-messages {
              flex: 1;
              overflow-y: auto;
              padding: 16px;
              background-image: url('https://readdy.ai/api/search-image?query=deep%20space%20starfield%20with%20distant%20stars%20and%20subtle%20nebula%2C%20dark%20cosmic%20background%20with%20tiny%20stars%2C%20perfect%20for%20chat%20background&width=320&height=300&seq=chatbg&orientation=squarish');
              background-size: cover;
              scrollbar-width: none;
            }

            .chatbot-messages::-webkit-scrollbar {
              display: none;
            }

            .chatbot-message {
              margin-bottom: 16px;
              display: flex;
              align-items: flex-start;
            }

            .chatbot-message.user {
              justify-content: flex-end;
            }

            .chatbot-message-content {
              max-width: 95%;
              padding: 12px;
              border-radius: 8px;
              font-size: 14px;
              line-height: 1.4;
              font-family: monospace;
              backdrop-filter: blur(5px);
            }

            .chatbot-message.bot .chatbot-message-content {
              background: rgba(0, 240, 255, 0.1);
              color: #00F0FF;
              border-bottom-left-radius: 4px;
            }

            .chatbot-message.user .chatbot-message-content {
              background: rgba(176, 38, 255, 0.1);
              color: #B026FF;
              border-bottom-right-radius: 4px;
            }

            .chatbot-input-area {
              padding: 16px;
              border-top: 1px solid rgba(0, 240, 255, 0.2);
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .chatbot-input-container {
              display: flex;
              gap: 8px;
              align-items: center;
              width: 100%;
            }

            .chatbot-input {
              flex: 1;
              background: rgba(26, 26, 26, 0.8);
              border: none;
              border-radius: 8px;
              padding: 12px 16px;
              color: #e0e0e0;
              font-size: 14px;
              font-family: monospace;
              resize: none;
              max-height: 100px;
              min-height: 40px;
              outline: none;
            }

            .chatbot-input:focus {
              outline: 1px solid rgba(0, 240, 255, 0.5);
            }

            .chatbot-send {
              background: linear-gradient(to right, ${
                this.config.primaryColor
              }, #B026FF);
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              flex-shrink: 0;
            }

            .chatbot-send:hover {
              transform: scale(1.05);
              box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
            }

            .chatbot-send svg {
              width: 18px;
              height: 18px;
              fill: black;
            }

            .chatbot-footer {
              margin-top: 12px;
              text-align: center;
              width: 100%;
            }

            .powered-by {
              color: #00F0FF;
              font-size: 12px;
              text-decoration: none;
              transition: color 0.2s;
            }

            .powered-by:hover {
              color: #B026FF;
              text-decoration: underline;
            }

            .chatbot-typing {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #888;
              background: transparent;
              font-size: 12px;
              margin-top: 8px;
              padding: 0 16px;
            }

            .chatbot-typing-dots {
              display: flex;
              gap: 2px;
            }

            .chatbot-typing-dot {
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background: transperant;
              animation: typing 1.4s infinite;
            }

            .chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
              0%, 60%, 100% { opacity: 0.3; }
              30% { opacity: 1; }
            }

            /* Unauthorized message styles */
            .chatbot-unauthorized {
              display: flex;
              flex-direction: column;
              flex: 1;
              padding: 1rem;
              min-height: 50vh;
              overflow-y: auto;
              color: #d1d5db;
              background-image: url('https://readdy.ai/api/search-image?query=deep%20space%20starfield%20with%20distant%20stars%20and%20subtle%20nebula%2C%20dark%20cosmic%20background%20with%20tiny%20stars%2C%20perfect%20for%20chat%20background&width=320&height=300&seq=chatbg&orientation=squarish');
              background-size: cover;
            }

            .unauthorized-message {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              padding: 1rem;
              backdrop-filter: blur(5px);
              background: rgba(10, 10, 10, 0.7);
              border-radius: 8px;
              margin: 16px;
            }

            .unauthorized-message p {
              margin-bottom: 1rem;
              font-size: 0.875rem;
              line-height: 1.5;
            }

            .subscription-link {
              padding: 10px 16px;
              margin-top: 1rem;
              text-align: center;
              font-size: 14px;
              background: linear-gradient(to right, #00F0FF, #B026FF);
              color: black;
              border-radius: 8px;
              transition: opacity 0.2s;
              text-decoration: none;
              font-weight: 500;
              border: none;
              cursor: pointer;
            }

            .subscription-link:hover {
              opacity: 0.9;
            }

            /* Appointment form styles */
            .appointment-form {
              background: rgba(26, 26, 26, 0.8);
              border-radius: 8px;
              padding: 16px;
              margin: 16px 0;
              border: 1px solid rgba(0, 240, 255, 0.3);
              backdrop-filter: blur(5px);
            }

            .appointment-form h4 {
              color: #00F0FF;
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .form-group {
              margin-bottom: 16px;
            }

            .form-group label {
              display: block;
              color: #e0e0e0;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 6px;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
              width: 100%;
              background: rgba(10, 10, 10, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              padding: 10px 12px;
              color: white;
              font-size: 14px;
              box-sizing: border-box;
              font-family: monospace;
              outline: none;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
              outline: 1px solid #00F0FF;
            }

            .form-buttons {
              display: flex;
              gap: 8px;
              margin-top: 20px;
            }

            .btn {
              padding: 10px 16px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.2s;
              font-family: monospace;
            }

            .btn-primary {
              background: linear-gradient(to right, ${
                this.config.primaryColor
              }, #B026FF);
              color: black;
              flex: 1;
            }

            .btn-primary:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }

            .btn-secondary {
              background: transparent;
              color: #888;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn-secondary:hover {
              background: rgba(255, 255, 255, 0.1);
            }

            @media (max-width: 480px) {
              .chatbot-window {
                width: 300px;
                height: calc(100vh - 150px);
                right: -10px !important;
                bottom:60px
              }
              
              .chatbot-toggle {
                width: 50px;
                height: 50px;
              }
            }
          `;

      const styleSheet = document.createElement("style");
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const widget = document.createElement("div");
      widget.className = "chatbot-widget";
      widget.innerHTML = `
            <button class="chatbot-toggle" id="chatbot-toggle">
              <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </button>
            
            <div class="chatbot-window" id="chatbot-window">
              <div class="chatbot-header">
                <h3>
                  <span class="icon-container">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                 ${this.config.chatbotName}
                </h3>
                <div class="chatbot-header-controls">
                  <button id="chatbot-restart" title="Restart Conversation">
                    <svg viewBox="0 0 24 24">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                  </button>
                  <button id="chatbot-close" title="Close Chat">
                    <svg viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              ${
                this.config.isAuthorized
                  ? `
                <div class="chatbot-messages" id="chatbot-messages">
                  <div class="chatbot-message bot">
                    <div class="chatbot-message-content">${this.config.welcomeMessage}</div>
                  </div>
                  <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
                    <div class="chatbot-typing-dots">
                      <div class="chatbot-typing-dot"></div>
                      <div class="chatbot-typing-dot"></div>
                      <div class="chatbot-typing-dot"></div>
                    </div>
                    <span>AI is typing</span>
                  </div>
                </div>
                
                
                
                <div class="chatbot-input-area">
                  <div class="chatbot-input-container">
                    <textarea class="chatbot-input" id="chatbot-input" placeholder="Type your message..." rows="1"></textarea>
                    <button class="chatbot-send" id="chatbot-send">
                      <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="chatbot-footer">
                    <a href="https://ainspiretech.com/" target="_blank" class="powered-by">
                      Powered by AinspireTech
                    </a>
                  </div>
                </div>
              `
                  : `
                <div class="chatbot-unauthorized">
                  <div class="unauthorized-message">
                    <p>Unauthorized access. Please check your monthly subscription. If you are a user, please notify the owner.</p>
                    <a href="https://ainspiretech.com/UserDashboard" class="subscription-link">
                      Check Subscription
                    </a>
                  </div>
                  <div class="chatbot-footer">
                    <a href="https://ainspiretech.com/" target="_blank" class="powered-by">
                      Powered by AinspireTech
                    </a>
                  </div>
                </div>
              `
              }
            </div>
          `;

      document.body.appendChild(widget);
      this.widget = widget;
    }

    bindEvents() {
      const toggle = document.getElementById("chatbot-toggle");
      const close = document.getElementById("chatbot-close");
      const input = document.getElementById("chatbot-input");
      const send = document.getElementById("chatbot-send");
      const restart = document.getElementById("chatbot-restart");

      if (toggle) toggle.addEventListener("click", () => this.toggleWidget());
      if (close) close.addEventListener("click", () => this.closeWidget());
      if (send) send.addEventListener("click", () => this.sendMessage());
      if (restart) restart.addEventListener("click", () => this.restartChat());

      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });

        input.addEventListener("input", () => {
          input.style.height = "auto";
          input.style.height = Math.min(input.scrollHeight, 100) + "px";
        });
      }
    }

    toggleWidget() {
      const window = document.getElementById("chatbot-window");
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        window.classList.add("open");
      } else {
        window.classList.remove("open");
      }
    }

    closeWidget() {
      const window = document.getElementById("chatbot-window");
      window.classList.remove("open");
      this.isOpen = false;
    }

    restartChat() {
      this.messages = [];
      const messagesContainer = document.getElementById("chatbot-messages");
      messagesContainer.innerHTML = `
            <div class="chatbot-message bot">
              <div class="chatbot-message-content">${this.config.welcomeMessage}</div>
            </div>
          `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
      const input = document.getElementById("chatbot-input");
      const message = input.value.trim();

      if (!message) return;
      console.log(message);
      this.addMessage(message, "user");
      input.value = "";
      input.style.height = "auto";

      this.messageCount++;

      // Show typing indicator
      this.showTyping();

      // Get bot response
      const response = await this.getBotResponse(message);
      this.hideTyping();
      this.addMessage(response, "bot");

      // Show appointment form after 2 messages
      if (this.config.chatbotType === "chatbot-lead-generation") {
        if (this.messageCount >= 2 && !this.showAppointmentForm) {
          this.showAppointmentForm = true;
          setTimeout(() => {
            this.addAppointmentForm();
          }, 1000);
        }

        // Save conversation after 3 messages
        if (this.messageCount >= 3) {
          this.saveConversation();
        }
      }
    }

    addMessage(content, type) {
      const messagesContainer = document.getElementById("chatbot-messages");
      const messageDiv = document.createElement("div");
      messageDiv.className = `chatbot-message ${type}`;

      messageDiv.innerHTML = `
            <div class="chatbot-message-content">${content}</div>
          `;

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Store message
      this.messages.push({
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      });
    }

    showTyping() {
      const typingIndicator = document.getElementById("chatbot-typing");
      if (typingIndicator) {
        (typingIndicator.style.display = "flex"),
          (typingIndicator.style.background = "transparent");
      }
    }

    hideTyping() {
      const typingIndicator = document.getElementById("chatbot-typing");
      if (typingIndicator) typingIndicator.style.display = "none";
    }

    async getBotResponse(message) {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/chatbot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": "your_32byte_encryption_key_here_12345", // Match your SECRET_KEY
            },
            body: JSON.stringify({
              userId: `${this.config.userId}`,
              agentId: `${this.config.chatbotType}`,
              userInput: message,
              fileData: `${this.config.filename}`,
            }),
          }
        );
        console.log("response:", response);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("data:", data);

        return data.response || "I couldn't process your request.";
      } catch (error) {
        console.error("Chatbot error:", error);
        return "I'm having some technical difficulties. Please try again later.";
      }
    }

    async loadAppointmentQuestions() {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/webQuestion`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": "your_32byte_encryption_key_here_12345", // Match your SECRET_KEY
            },

            body: JSON.stringify({
              userId: `${this.config.userId}`,
              chatbotType: `${this.config.chatbotType}`,
            }),
          }
        );
        const data = await response.json();
        this.appointmentQuestions = data.appointmentQuestions?.questions || [
          {
            id: 1,
            question: "What is your full name?",
            type: "text",
            required: true,
          },
          {
            id: 2,
            question: "What is your email address?",
            type: "email",
            required: true,
          },
          {
            id: 3,
            question: "What is your phone number?",
            type: "tel",
            required: true,
          },
          {
            id: 4,
            question: "What service are you interested in?",
            type: "select",
            options: ["Consultation", "Service A", "Service B"],
            required: true,
          },
          {
            id: 5,
            question: "Preferred appointment date?",
            type: "date",
            required: true,
          },
        ];
      } catch (error) {
        console.error("Failed to load appointment questions:", error);
        this.appointmentQuestions = [
          {
            id: 1,
            question: "What is your full name?",
            type: "text",
            required: true,
          },
          {
            id: 2,
            question: "What is your email address?",
            type: "email",
            required: true,
          },
          {
            id: 3,
            question: "What is your phone number?",
            type: "tel",
            required: true,
          },
          {
            id: 4,
            question: "What service are you interested in?",
            type: "select",
            options: ["Consultation", "Service A", "Service B"],
            required: true,
          },
          {
            id: 5,
            question: "Preferred appointment date?",
            type: "date",
            required: true,
          },
        ];
      }
    }

    addAppointmentForm() {
      const messagesContainer = document.getElementById("chatbot-messages");
      const formDiv = document.createElement("div");
      formDiv.className = "chatbot-message bot";

      let formFields = "";
      this.appointmentQuestions.forEach((question) => {
        let fieldHtml = "";

        switch (question.type) {
          case "select":
            fieldHtml = `
                  <select id="field-${question.id}" ${
              question.required ? "required" : ""
            }>
                    <option value="">Select an option</option>
                    ${
                      question.options
                        ?.map(
                          (option) =>
                            `<option value="${option}">${option}</option>`
                        )
                        .join("") || ""
                    }
                  </select>
                `;
            break;
          case "textarea":
            fieldHtml = `<textarea id="field-${question.id}" ${
              question.required ? "required" : ""
            } rows="3"></textarea>`;
            break;
          default:
            fieldHtml = `<input type="${question.type}" id="field-${
              question.id
            }" ${question.required ? "required" : ""}>`;
        }

        formFields += `
              <div class="form-group">
                <label for="field-${question.id}">${question.question}${
          question.required ? " *" : ""
        }</label>
                ${fieldHtml}
              </div>
            `;
      });

      formDiv.innerHTML = `
            <div class="chatbot-message-content">
              <div class="appointment-form">
                <h4>📅 Book an Appointment</h4>
                <form id="appointment-form">
                  ${formFields}
                  <div class="form-buttons">
                    <button type="submit" class="btn btn-primary">Submit</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.chatbot-message').remove()">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          `;

      messagesContainer.appendChild(formDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Bind form submit
      const form = document.getElementById("appointment-form");
      if (form)
        form.addEventListener("submit", (e) => this.submitAppointmentForm(e));
    }

    async submitAppointmentForm(e) {
      e.preventDefault();

      const formData = [];
      this.appointmentQuestions.forEach((question, index) => {
        const field = document.getElementById(`field-${question.id}`);
        if (field) {
          formData[index] = {
            question: question.question,
            answer: field.value,
          };
        }
      });
      try {
        // Save form data to conversation
        this.formData = formData;

        // Show success message
        this.addMessage(
          "Thank you! Your appointment request has been submitted. We'll contact you soon to confirm the details.",
          "bot"
        );

        // Remove form
        const form = e.target.closest(".chatbot-message");
        form.remove();

        // Save conversation with form data
        await this.saveConversation();
      } catch (error) {
        console.error("Failed to submit appointment form:", error);
        this.addMessage(
          "Sorry, there was an error submitting your appointment. Please try again.",
          "bot"
        );
      }
    }

    async saveConversation() {
      if (this.conversationSaved) return;

      try {
        const conversationData = {
          chatbotType: this.config.chatbotType,
          userId: `${this.config.userId}`,
          messages: this.messages,
          formData: this.formData || null,
          customerName: this.formData[0].answer || "Anonymous",
          customerEmail: this.formData[1].answer || "Anonymous",
          status: this.formData ? "pending" : "active",
        };
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/conversation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": "your_32byte_encryption_key_here_12345", // Match your SECRET_KEY
            },
            body: JSON.stringify(conversationData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          this.conversationId = result.conversationId;
          this.conversationSaved = true;
        }
      } catch (error) {
        console.error("Failed to save conversation:", error);
      }
    }
  }

  // Initialize widget when DOM is ready
  function initChatbot() {
    const script =
      document.currentScript ||
      document.querySelector("script[data-chatbot-config]");
    if (!script) return;

    const configAttr = script.getAttribute("data-chatbot-config");
    if (!configAttr) return;

    try {
      const config = JSON.parse(configAttr);
      new ChatbotWidget(config);
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
})();
