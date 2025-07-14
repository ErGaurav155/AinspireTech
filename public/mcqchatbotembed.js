(function () {
  "use strict";

  // MCQ Chatbot Widget Class
  class McqChatbotWidget {
    constructor(config) {
      this.config = {
        userId: config.userId,
        isAuthorized: config.isAuthorized,
        chatbotName: config.chatbotName,
        apiUrl: config.apiUrl,
        agentId: config.chatbotType,
        primaryColor: config.primaryColor || "#143796",
        position: config.position || "bottom-right",
        welcomeMessage: config.welcomeMessage || "Hello! How can I help you?",
        ...config,
      };

      this.isOpen = false;
      this.messages = [
        {
          sender: "AI Bot",
          text: "Hello, cosmic traveler! I am your AI assistant. How can I help you navigate our services today?",
        },
        { sender: "You", text: "What services did you provide?" },
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
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .mcq-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .mcq-toggle::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          animation: pulse 2s infinite;
          z-index: -1;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }

        .mcq-window {
          position: absolute;
          right: 0;
          bottom: 20px;
          width: 380px;
          height: 80vh;
          background: rgba(10, 10, 10, 0.8);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(0, 240, 255, 0.3);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          backdrop-filter: blur(10px);
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
          height: 48px;
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        .mcq-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #000;
          font-weight: 500;
        }

        .mcq-header-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mcq-header-icon svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .mcq-header-buttons {
          display: flex;
          gap: 8px;
        }

        .mcq-header-button {
          background: transparent;
          border: none;
          color: #000;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mcq-header-button:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .mcq-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background-image: url("https://readdy.ai/api/search-image?query=deep%20space%20starfield%20with%20distant%20stars%20and%20subtle%20nebula%2C%20dark%20cosmic%20background%20with%20tiny%20stars%2C%20perfect%20for%20chat%20background&width=320&height=300&seq=chatbg&orientation=squarish");
          background-size: cover;
          background-position: center;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .mcq-body::-webkit-scrollbar {
          display: none;
        }

        .mcq-message {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .mcq-message.user {
          justify-content: flex-end;
        }

        .mcq-message-content {
          max-width: 80%;
          padding: 12px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          backdrop-filter: blur(10px);
          background: rgba(176, 38, 255, 0.1);
          color: #B026FF;
          border: 1px solid rgba(176, 38, 255, 0.3);
        }

        .mcq-message.bot .mcq-message-content {
          background: rgba(0, 240, 255, 0.1);
          color: #00F0FF;
          border: 1px solid rgba(0, 240, 255, 0.3);
        }

        .mcq-input-area {
          padding: 12px;
          background: rgba(10, 10, 10, 0.8);
          border-top: 1px solid rgba(0, 240, 255, 0.2);
        }

        .mcq-input-container {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .mcq-input {
          flex: 1;
          background: rgba(26, 26, 26, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 20px;
          padding: 12px 16px;
          color: #f0f0f0;
          font-size: 14px;
          resize: none;
          outline: none;
        }

        .mcq-input:focus {
          border-color: rgba(0, 240, 255, 0.5);
        }

        .mcq-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          border: none;
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
          fill: #000;
        }

        .mcq-footer {
          display: flex;
          justify-content: center;
        }

        .powered-by {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.3s;
        }

        .powered-by:hover {
          color: #00F0FF;
        }

        .mcq-form {
          padding: 16px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }
        
        .mcq-form p {
          font-size: 14px;
          font-weight: 500;
          color: #00F0FF;
          margin-bottom: 12px;
        }

        .mcq-form input,
        .mcq-form textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
          font-size: 14px;
          background: rgba(10, 10, 10, 0.8);
          color: #f0f0f0;
          outline: none;
        }

        .mcq-form textarea {
          min-height: 80px;
          resize: vertical;
        }

        .mcq-form button {
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          color: #000;
          border: none;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
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
          padding: 16px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .mcq-question h3 {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #f0f0f0;
        }

        .mcq-option {
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 10, 10, 0.5);
          color: #f0f0f0;
        }

        .mcq-option:hover {
          border-color: rgba(0, 240, 255, 0.5);
        }

        .mcq-option.selected {
          background: rgba(0, 240, 255, 0.1);
          border-color: #00F0FF;
          color: #00F0FF;
        }

        .mcq-option.correct {
          background: rgba(76, 175, 80, 0.1);
          border-color: #4CAF50;
          color: #4CAF50;
        }

        .mcq-option.incorrect {
          background: rgba(244, 67, 54, 0.1);
          border-color: #F44336;
          color: #F44336;
        }

        .mcq-explanation {
          margin-top: 12px;
          padding: 12px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          font-size: 13px;
          color: #f0f0f0;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .mcq-quiz-controls {
          padding: 16px;
          text-align: center;
        }

        .mcq-quiz-btn {
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          color: #000;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.3s;
        }

        .mcq-quiz-btn:hover {
          opacity: 0.9;
        }

        .mcq-score {
          background: rgba(26, 26, 26, 0.8);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 16px;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .mcq-score h3 {
          font-size: 18px;
          margin-bottom: 12px;
          color: #00F0FF;
        }

        .mcq-unauthorized {
          padding: 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          margin: 16px;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .mcq-unauthorized a {
          display: inline-block;
          margin-top: 16px;
          padding: 10px 16px;
          background: linear-gradient(to right, ${
            this.config.primaryColor
          }, #B026FF);
          color: #000;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 500;
        }

        .loading {
          display: inline-block;
          padding: 12px 20px;
          background: rgba(26, 26, 26, 0.8);
          color: #00F0FF;
          border-radius: 8px;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        @media (max-width: 480px) {
          .mcq-window {
            width: 310px;
            height: 80vh;
            right:  0px;
            bottom: 20px;
          }
        }
          @media (max-width: 480px) {
          .mcq-chatbot-widget {
            
          ${
            this.config.position.includes("right")
              ? "right: 5px;"
              : "left: 5px;"
          }
          ${
            this.config.position.includes("bottom")
              ? "bottom: 5px;"
              : "top: 5px;"
          }
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          
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
        <div class="mcq-window" id="mcq-window">
          <div class="mcq-header">
            <div class="mcq-header-title">
              <div class="mcq-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
                </svg>
              </div>
              <span>${this.config.chatbotName}</span>
            </div>
            <div class="mcq-header-buttons">
              <button class="mcq-header-button" id="mcq-reset">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="mcq-header-button" id="mcq-close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </div>
            <div class="mcq-footer">
              <a href="https://ainspiretech.com/" target="_blank" class="powered-by">
                Powered by AinspireTech
              </a>
            </div>
          </div>
          `
              : ""
          }
        </div>

        <button class="mcq-toggle" id="mcq-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H8v-2h8v2zm0-3H8V9h8v2zm0-3H8V6h8v2z"/>
          </svg>
        </button>
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
          <p>Fill The Form To Generate MCQ Test</p>
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
      console.log("i am render");
      return `
        <div class="mcq-quiz">
          <div id="mcq-messages">
            ${this.messages
              .map(
                (msg) => `
              <div class="mcq-message ${msg.sender === "You" ? "user" : "bot"}">
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
                <h3>${qIndex + 1}. ${q.question}</h3>
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
                        ${String.fromCharCode(65 + optIndex)}. ${opt}
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
    closeWidget() {
      const window = document.getElementById("mcq-window");
      const toggle = document.getElementById("mcq-toggle");

      window.classList.remove("open");
      toggle.style.display = "flex";
      this.isOpen = false;
    }

    toggleWidget() {
      this.isOpen = !this.isOpen;
      const window = document.getElementById("mcq-window");
      const toggle = document.getElementById("mcq-toggle");

      if (this.isOpen) {
        window.classList.add("open");
        toggle.style.display = "none";
      } else {
        window.classList.remove("open");
        toggle.style.display = "flex";
      }
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
        const rawResponse = await this.generateMcqResponse(message, true);
        console.log("rawResponse:", rawResponse);

        const parsedResponse = JSON.parse(rawResponse);
        console.log("parsedResponse:", parsedResponse);

        function extractJsonFromMarkdown(markdownText) {
          const match = markdownText.match(/```json\s*([\s\S]*?)\s*```/);
          return match ? match[1] : null;
        }
        console.log("parsedResponse.response:", parsedResponse.response);

        const jsonText = extractJsonFromMarkdown(parsedResponse.response);
        // Add bot response
        // this.messages.push({ sender: "AI Bot", text: response });

        // Try to parse as quiz data
        console.log("jsonText:", jsonText);

        try {
          const parsed = JSON.parse(jsonText);
          console.log("parsed:", parsed);

          if (parsed.questions && Array.isArray(parsed.questions)) {
            console.log("I am Here Hello");
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
        const response = await this.generateMcqResponse(message, false);
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
      // this.updateBody();
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

    async generateMcqResponse(userInput, isMCQRequest) {
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
              isMCQRequest,
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
