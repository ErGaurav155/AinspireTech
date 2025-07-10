(function () {
  "use strict";

  // Chatbot Widget Class
  class ChatbotWidget {
    constructor(config) {
      this.config = {
        userId: config.userId,
        isAuthorized: config.isAuthorized,
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
      this.loadAppointmentQuestions();
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
          }, #FF2E9F);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .chatbot-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 240, 255, 0.4);
        }

        .chatbot-toggle svg {
          width: 24px;
          height: 24px;
          fill: white;
        }

        @keyframes pulse {
          0% { box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3); }
          50% { box-shadow: 0 4px 20px rgba(0, 240, 255, 0.6); }
          100% { box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3); }
        }

        .chatbot-window {
          position: absolute;
          right: 0px;
          bottom: 80px;
          width: 380px;
          height: 500px;
          background: #1a1a1a;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          background: linear-gradient(135deg, ${
            this.config.primaryColor
          }, #FF2E9F);
          padding: 16px 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chatbot-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chatbot-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .chatbot-messages {
        margin-top:8px;
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          background: #1a1a1a;
          scrollbar-width: none; /* Firefox */
         -ms-overflow-style: none; /* IE and Edge */
        }
       .chatbot-messages::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
          background: transparent;
        }
        .chatbot-message {
          margin-bottom: 5px;

          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .chatbot-message.user {
          flex-direction: row-reverse;
        }

        .chatbot-message-content {
          max-width: 80%;
          padding: 4px 6px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
        }

        .chatbot-message.bot .chatbot-message-content {
          background: #2a2a2a;
          width:90%;
          color: #e0e0e0;
          border-bottom-left-radius: 6px;
        }

        .chatbot-message.user .chatbot-message-content {
          background: linear-gradient(135deg, ${
            this.config.primaryColor
          }, #FF2E9F);
          color: white;
          border-bottom-right-radius: 6px;
        }

        .chatbot-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${
            this.config.primaryColor
          }, #FF2E9F);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chatbot-avatar svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .chatbot-input-area {
          padding: 10px 12px;
          background: #2a2a2a;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chatbot-input-container {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .chatbot-input {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          resize: none;
          max-height: 100px;
          min-height: 40px;
        }

        .chatbot-input:focus {
          outline: none;
          border-color: ${this.config.primaryColor};
        }

        .chatbot-send {
          background: linear-gradient(135deg, ${
            this.config.primaryColor
          }, #FF2E9F);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .chatbot-send:hover {
          transform: scale(1.1);
        }

        .chatbot-send svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #888;
          font-size: 12px;
          margin-top: 8px;
        }

        .chatbot-typing-dots {
          display: flex;
          gap: 2px;
        }

        .chatbot-typing-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #888;
          animation: typing 1.4s infinite;
        }
        .chatbot-footer {
           display: flex;
           justify-content: center;
           margin-top: 3px;
        }
.powered-by {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 300;
  color: #00F0FF;
  text-decoration: none;
  position: relative;
}
.gradient-pulse {
  width: 6px;
  height: 8px;
  overflow: hidden;
  position: relative;
}

.gradient-pulse::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: linear-gradient(to right, #00F0FF, #B026FF);
  border-radius: 9999px;
  animation: pulse1 2s infinite;
}

@keyframes pulse1 {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
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
  color: #d1d5db; /* gray-300 */
}

.unauthorized-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.unauthorized-message p {
  margin-bottom: 1rem;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-normal */
}

.subscription-link {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem; /* text-base */
  background: linear-gradient(to right, #00F0FF, #B026FF);
  color: black;
  border-radius: 0.5rem;
  transition: opacity 0.2s;
  text-decoration: none;
}

.subscription-link:hover {
  opacity: 0.9;
}

/* Hide scrollbar for unauthorized message */
.chatbot-unauthorized {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chatbot-unauthorized::-webkit-scrollbar {
  display: none;
}
        .appointment-form {
          background: #2a2a2a;
          border-radius: 8px;
          padding: 5px;
          margin: 6px 0;
          width:100%;
          border: 1px solid rgba(0, 240, 255, 0.3);
        }

        .appointment-form h4 {
          color: ${this.config.primaryColor};
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
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
          width:100%;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 10px 12px;
          color: white;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${this.config.primaryColor};
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
        }

        .btn-primary {
          background: linear-gradient(135deg, ${
            this.config.primaryColor
          }, #FF2E9F);
          color: white;
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
            <h3>AI Assistant</h3>
            <button class="chatbot-close" id="chatbot-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
            ${
              this.config.isAuthorized
                ? `
          <div class="chatbot-messages" id="chatbot-messages">
            <div class="chatbot-message bot">
              <div class="chatbot-avatar">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="chatbot-message-content">${this.config.welcomeMessage}</div>
              
            </div>
          </div>
          <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
              <div class="chatbot-avatar">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
                <span>AI is typing</span>
                <div class="chatbot-typing-dots">
                   <div class="chatbot-typing-dot"></div>
                   <div class="chatbot-typing-dot"></div>
                   <div class="chatbot-typing-dot"></div>
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
               <div class="gradient-pulse"></div>
               <span>Powered by AinspireTech</span>
               </a>
             </div>
            
          </div> `
                : ` <div class="chatbot-unauthorized">
          <div class="unauthorized-message">
            <p>Unauthorized access. Please check your monthly subscription. If you are a user, please notify the owner.</p>
            <a href="https://ainspiretech.com/UserDashboard" class="subscription-link">
              Check Subscription
            </a>
          </div>
          <div class="chatbot-footer">
            <a href="https://ainspiretech.com/" target="_blank" class="powered-by">
              <div class="gradient-pulse"></div>
              <span>Powered by AinspireTech</span>
            </a>
          </div>
        </div> `
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

      toggle.addEventListener("click", () => this.toggleWidget());
      close.addEventListener("click", () => this.closeWidget());
      send.addEventListener("click", () => this.sendMessage());

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

    async sendMessage() {
      const input = document.getElementById("chatbot-input");
      const message = input.value.trim();

      if (!message) return;

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

    addMessage(content, type) {
      const messagesContainer = document.getElementById("chatbot-messages");
      const messageDiv = document.createElement("div");
      messageDiv.className = `chatbot-message ${type}`;

      const avatar =
        type === "bot"
          ? `
        <div class="chatbot-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      `
          : "";

      messageDiv.innerHTML = `
        ${avatar}
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
      document.getElementById("chatbot-typing").style.display = "flex";
    }

    hideTyping() {
      document.getElementById("chatbot-typing").style.display = "none";
    }

    async getBotResponse(message) {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/chatbot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Add API key if needed
              // 'x-api-key': this.config.apiKey
            },
            body: JSON.stringify({
              userId: `${this.config.userId}`,
              agentId: `${this.config.chatbotType}`,
              userInput: message,
              fileData: `${this.config.filename}`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data.response || "I couldn't process your request.";
      } catch (error) {
        console.error("Chatbot error:", error);
        return "I'm having some technical difficulties. Please try again later.";
      }
    }

    async loadAppointmentQuestions() {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/webQuestion?chatbotType=${this.config.chatbotType}&userId=${this.config.userId}`
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
                      (option) => `<option value="${option}">${option}</option>`
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
        <div class="chatbot-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
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
      form.addEventListener("submit", (e) => this.submitAppointmentForm(e));
    }

    async submitAppointmentForm(e) {
      e.preventDefault();

      const formData = {};
      this.appointmentQuestions.forEach((question) => {
        const field = document.getElementById(`field-${question.id}`);
        if (field) {
          formData[question.question.toLowerCase().replace(/[^a-z0-9]/g, "_")] =
            field.value;
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
          messages: this.messages,
          formData: this.formData,
          customerName: this.formData?.what_is_your_full_name || "Anonymous",
          customerEmail: this.formData?.what_is_your_email_address || null,
          status: this.formData ? "pending" : "active",
        };

        const response = await fetch(
          `${this.config.apiUrl}/api/embed/conversation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
