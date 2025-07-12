(function () {
  "use strict";

  // MCQ Chatbot Widget Class
  class McqChatbotWidget {
    constructor(config) {
      this.config = {
        userId: config.userId,
        isAuthorized: config.isAuthorized,
        apiUrl: config.apiUrl,
        agentId: config.chatbotType,
        primaryColor: config.primaryColor || "#143796",
        position: config.position || "bottom-right",
        welcomeMessage: config.welcomeMessage || "Hello! How can I help you?",
        ...config,
      };

      this.isOpen = false;
      this.messages = [
        { sender: "AI Bot", text: "Hello! How can I help you?" },
        { sender: "You", text: "Eg. Generate mcq test for my neet exam" },
      ];
      this.quizData = null;
      this.selectedAnswers = [];
      this.isQuizSubmitted = false;
      this.score = 0;
      this.isLoading = false;
      this.isSending = false;

      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.bindEvents();
    }

    createStyles() {
      const styles = `
        .mcq-chatbot-widget {
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

        .mcq-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .mcq-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .mcq-toggle svg {
          width: 24px;
          height: 24px;
          fill: white;
        }

        .mcq-window {
          position: absolute;
          right: 0;
          bottom: 80px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mcq-window.open {
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

        .mcq-header {
          background: ${this.config.primaryColor};
          padding: 16px 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mcq-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          gap: 5px;
        }

        .mcq-header span {
          display: block;
          animation: colorChangeHorizontal 2s infinite;
        }

        @keyframes colorChangeHorizontal {
          0% { color: white; }
          25% { color: #FFD700; }
          50% { color: #00F0FF; }
          75% { color: #FF2E9F; }
          100% { color: white; }
        }

        .mcq-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .mcq-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .mcq-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          background: white;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .mcq-body::-webkit-scrollbar {
          display: none;
        }

        .mcq-message {
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .mcq-message.user {
          flex-direction: row-reverse;
        }

        .mcq-message-content {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }

        .mcq-message.bot .mcq-message-content {
          background: #f0f0f0;
          color: #333;
          border-bottom-left-radius: 4px;
        }

        .mcq-message.user .mcq-message-content {
          background: ${this.config.primaryColor};
          color: white;
          border-bottom-right-radius: 4px;
        }

        .mcq-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mcq-avatar svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .mcq-input-area {
          padding: 10px 12px;
          background: #f5f5f5;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mcq-form {
          padding: 10px;
          background: #f9f9f9;
          border-radius: 8px;
          margin: 8px 0;
          border: 1px solid #eee;
        }

        .mcq-form p {
          font-size: 14px;
          font-weight: 600;
          color: ${this.config.primaryColor};
          margin-bottom: 10px;
        }

        .mcq-form input,
        .mcq-form textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .mcq-form textarea {
          min-height: 60px;
          resize: vertical;
        }

        .mcq-form button {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.3s;
        }

        .mcq-form button:hover {
          opacity: 0.9;
        }

        .mcq-quiz {
          overflow-y: auto;
          height: 100%;
        }

        .mcq-question {
          margin-bottom: 20px;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .mcq-question h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .mcq-option {
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 4px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          border: 1px solid #eee;
        }

        .mcq-option.selected {
          background-color: #e0f0ff;
          border-color: ${this.config.primaryColor};
        }

        .mcq-option.correct {
          background-color: #e6ffea;
          border-color: #4CAF50;
        }

        .mcq-option.incorrect {
          background-color: #ffebee;
          border-color: #F44336;
        }

        .mcq-explanation {
          margin-top: 10px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 4px;
          font-size: 13px;
          color: #666;
        }

        .mcq-quiz-controls {
          padding: 15px;
          text-align: center;
        }

        .mcq-quiz-btn {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 15px;
          cursor: pointer;
          margin: 0 5px;
          transition: opacity 0.3s;
        }

        .mcq-quiz-btn:hover {
          opacity: 0.9;
        }

        .mcq-score {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 15px;
        }

        .mcq-score h3 {
          font-size: 18px;
          margin-bottom: 10px;
          color: ${this.config.primaryColor};
        }

        .mcq-input-container {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .mcq-input {
          flex: 1;
          background: white;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 12px 16px;
          color: #333;
          font-size: 14px;
          resize: none;
          max-height: 100px;
          min-height: 40px;
        }

        .mcq-input:focus {
          outline: none;
          border-color: ${this.config.primaryColor};
        }

        .mcq-send {
          background: ${this.config.primaryColor};
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

        .mcq-send:hover {
          transform: scale(1.05);
        }

        .mcq-send svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .mcq-footer {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        .powered-by {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;
          text-decoration: none;
        }

        .gradient-pulse {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00F0FF, #B026FF);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(0.9); }
        }

        .mcq-unauthorized {
          padding: 20px;
          text-align: center;
          color: #666;
        }

        .mcq-unauthorized a {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 15px;
          background: ${this.config.primaryColor};
          color: white;
          border-radius: 4px;
          text-decoration: none;
        }

        .loading {
          display: inline-block;
          padding: 10px 20px;
          background: #e0e0e0;
          color: #666;
          border-radius: 4px;
        }

        @media (max-width: 480px) {
          .mcq-window {
            width: 320px;
            height: 80vh;
            right: 10px;
            bottom: 70px;
          }
        }
      `;

      const styleSheet = document.createElement("style");
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const widget = document.createElement("div");
      widget.className = "mcq-chatbot-widget";
      widget.innerHTML = `
        <button class="mcq-toggle" id="mcq-toggle">
          <svg viewBox="0 0 24 24">
            <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H8v-2h8v2zm0-3H8V9h8v2zm0-3H8V6h8v2z"/>
          </svg>
        </button>
        
        <div class="mcq-window" id="mcq-window">
          <div class="mcq-header">
            <h3>
              <span>Tutor</span>
              <span>Ai</span>
            </h3>
            <div>
              <button class="mcq-close" id="mcq-reset">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
              <button class="mcq-close" id="mcq-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="mcq-body" id="mcq-body">
            ${this.renderBody()}
          </div>
          
          ${
            this.config.isAuthorized && !this.quizData
              ? `
          <div class="mcq-input-area">
            <div class="mcq-input-container">
              <textarea 
                class="mcq-input" 
                id="mcq-input" 
                placeholder="Type your message..." 
                rows="1"
              ></textarea>
              <button class="mcq-send" id="mcq-send">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div class="mcq-footer">
              <a href="https://ainspiretech.com/" target="_blank" class="powered-by">
                <div class="gradient-pulse"></div>
                <span>Powered by AinspireTech</span>
              </a>
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;

      document.body.appendChild(widget);
      this.widget = widget;
    }

    renderBody() {
      if (!this.config.isAuthorized) {
        return `
          <div class="mcq-unauthorized">
            <p>Unauthorized access. Please check your monthly subscription. If you are a user, please contact the owner.</p>
            <a href="https://ainspiretech.com/UserDashboard">Check Subscription</a>
          </div>
        `;
      }

      if (this.quizData) {
        return this.renderQuiz();
      }

      return `
        ${this.renderForm()}
        <div id="mcq-messages">
          ${this.messages
            .map(
              (msg) => `
            <div class="mcq-message ${msg.sender === "You" ? "user" : "bot"}">
              <div class="mcq-avatar">
                <svg viewBox="0 0 24 24">
                  <path d="${
                    msg.sender === "You"
                      ? "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"
                      : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  }"/>
                </svg>
              </div>
              <div class="mcq-message-content">${msg.text}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    renderForm() {
      return `
        <div class="mcq-form">
          <p>Fill The Form To Generate MCQ Test.</p>
          <form id="mcq-gen-form">
            <input 
              type="text" 
              id="mcq-topic" 
              placeholder="Topic Name" 
              required
            />
            <input 
              type="text" 
              id="mcq-level" 
              placeholder="Level Eg. Easy" 
              required
            />
            <input 
              type="text" 
              id="mcq-exam" 
              placeholder="Related Eg. JEE Exam Based" 
            />
            <textarea 
              id="mcq-info" 
              placeholder="Add More Info"
            ></textarea>
            <button type="submit" ${this.isSending ? "disabled" : ""}>
              ${this.isSending ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      `;
    }

    renderQuiz() {
      return `
        <div class="mcq-quiz">
          <div id="mcq-messages">
            ${this.messages
              .map(
                (msg) => `
              <div class="mcq-message ${msg.sender === "You" ? "user" : "bot"}">
                <div class="mcq-avatar">
                  <svg viewBox="0 0 24 24">
                    <path d="${
                      msg.sender === "You"
                        ? "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"
                        : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    }"/>
                  </svg>
                </div>
                <div class="mcq-message-content">${msg.text}</div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="mcq-questions">
            ${this.quizData.questions
              .map(
                (q, qIndex) => `
              <div class="mcq-question">
                <h3>${q.question}</h3>
                <div class="mcq-options">
                  ${q.options
                    .map((opt, optIndex) => {
                      let cls = "mcq-option";
                      if (this.selectedAnswers[qIndex] === optIndex)
                        cls += " selected";
                      if (this.isQuizSubmitted) {
                        if (optIndex === q.correctAnswer) cls += " correct";
                        else if (this.selectedAnswers[qIndex] === optIndex)
                          cls += " incorrect";
                      }
                      return `
                      <div 
                        class="${cls}" 
                        data-qindex="${qIndex}" 
                        data-optindex="${optIndex}"
                      >
                        ${opt}
                      </div>
                    `;
                    })
                    .join("")}
                </div>
                ${
                  this.isQuizSubmitted
                    ? `
                  <div class="mcq-explanation">
                    <strong>Solution:</strong> ${q.explanation}
                  </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="mcq-quiz-controls">
            ${
              !this.isQuizSubmitted
                ? `
              <button class="mcq-quiz-btn" id="mcq-submit">
                Submit Answers
              </button>
            `
                : `
              <div class="mcq-score">
                <h3>Score: ${this.score}/${this.quizData.questions.length}</h3>
                <button class="mcq-quiz-btn" id="mcq-try-again">
                  Try Again
                </button>
              </div>
            `
            }
          </div>
        </div>
      `;
    }

    bindEvents() {
      // Toggle and close
      document
        .getElementById("mcq-toggle")
        .addEventListener("click", () => this.toggleWidget());
      document
        .getElementById("mcq-close")
        .addEventListener("click", () => this.closeWidget());
      document
        .getElementById("mcq-reset")
        .addEventListener("click", () => this.resetQuiz());

      // Form submission
      const form = document.getElementById("mcq-gen-form");
      if (form) {
        form.addEventListener("submit", (e) => this.handleFormSubmit(e));
      }

      // Message sending
      const sendBtn = document.getElementById("mcq-send");
      if (sendBtn) {
        sendBtn.addEventListener("click", () => this.sendMessage());
        document
          .getElementById("mcq-input")
          .addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              this.sendMessage();
            }
          });
      }

      // Quiz events (delegated)
      document.addEventListener("click", (e) => {
        // Option selection
        if (
          e.target.classList.contains("mcq-option") &&
          !this.isQuizSubmitted
        ) {
          const qIndex = parseInt(e.target.dataset.qindex);
          const optIndex = parseInt(e.target.dataset.optindex);
          this.handleOptionSelect(qIndex, optIndex);
        }

        // Quiz submission
        if (e.target.id === "mcq-submit") {
          this.handleQuizSubmit();
        }

        // Try again
        if (e.target.id === "mcq-try-again") {
          this.resetQuiz();
        }
      });
    }

    toggleWidget() {
      const window = document.getElementById("mcq-window");
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        window.classList.add("open");
      } else {
        window.classList.remove("open");
      }
    }

    closeWidget() {
      const window = document.getElementById("mcq-window");
      window.classList.remove("open");
      this.isOpen = false;
    }

    async handleFormSubmit(e) {
      e.preventDefault();
      this.isSending = true;
      this.updateBody();

      const topic = document.getElementById("mcq-topic").value;
      const level = document.getElementById("mcq-level").value;
      const exam = document.getElementById("mcq-exam").value;
      const info = document.getElementById("mcq-info").value;

      const message = `generate mcq test for ${topic} based on ${exam} syllabus. Toughness must be ${level}. Also consider ${info}`;

      // Add user message
      this.messages.push({ sender: "You", text: message });
      this.updateBody();

      try {
        const response = await this.generateMcqResponse(message);

        // Add bot response
        this.messages.push({ sender: "AI Bot", text: response });

        // Try to parse as quiz data
        try {
          const parsed = JSON.parse(response);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            this.quizData = parsed;
            this.selectedAnswers = new Array(parsed.questions.length).fill(-1);
            this.isQuizSubmitted = false;
            this.score = 0;
          }
        } catch (e) {
          console.log("Response is not quiz data");
        }
      } catch (error) {
        console.error("Error:", error);
        this.messages.push({
          sender: "AI Bot",
          text: "Sorry, something went wrong!",
        });
      } finally {
        this.isSending = false;
        this.updateBody();
      }
    }

    async sendMessage() {
      const input = document.getElementById("mcq-input");
      const message = input.value.trim();

      if (!message) return;

      // Add user message
      this.messages.push({ sender: "You", text: message });
      input.value = "";
      this.updateBody();

      try {
        const response = await this.generateMcqResponse(message);
        this.messages.push({ sender: "AI Bot", text: response });
      } catch (error) {
        console.error("Error:", error);
        this.messages.push({
          sender: "AI Bot",
          text: "Sorry, something went wrong!",
        });
      } finally {
        this.updateBody();
      }
    }

    handleOptionSelect(questionIndex, optionIndex) {
      const newAnswers = [...this.selectedAnswers];
      newAnswers[questionIndex] = optionIndex;
      this.selectedAnswers = newAnswers;
      this.updateBody();
    }

    handleQuizSubmit() {
      let correct = 0;
      this.quizData.questions.forEach((q, i) => {
        if (this.selectedAnswers[i] === q.correctAnswer) correct++;
      });
      this.score = correct;
      this.isQuizSubmitted = true;
      this.updateBody();
    }

    resetQuiz() {
      this.quizData = null;
      this.selectedAnswers = [];
      this.isQuizSubmitted = false;
      this.score = 0;
      this.messages = [
        { sender: "AI Bot", text: "Hello! How can I help you?" },
        { sender: "You", text: "Eg. Generate mcq test for my neet exam" },
      ];
      this.updateBody();
    }

    updateBody() {
      const body = document.getElementById("mcq-body");
      if (body) {
        body.innerHTML = this.renderBody();
      }
    }

    async generateMcqResponse(userInput) {
      this.isLoading = true;
      this.updateBody();

      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/embed/mcqchatbot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": "your_32byte_encryption_key_here_12345", // Match your SECRET_KEY
            },
            body: JSON.stringify({
              userInput,
              userId: this.config.userId,
              agentId: this.config.agentId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        return await response.text();
      } catch (error) {
        console.error("API Error:", error);
        return "I'm having trouble connecting to the server. Please try again later.";
      } finally {
        this.isLoading = false;
      }
    }
  }
  function initMcqChatbot() {
    const script =
      document.currentScript ||
      document.querySelector("script[data-mcq-chatbot]");

    if (!script) return;
    const configAttr = script.getAttribute("data-mcq-chatbot");
    if (!configAttr) return;
    try {
      const config = JSON.parse(configAttr);
      new McqChatbotWidget(config);
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
    }
  }
  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMcqChatbot);
  } else {
    initMcqChatbot();
  }
})();
