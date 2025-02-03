import React from "react";

interface EmbedCodeProps {
  userId: string;
  agentId: string;
}

const EmbedCode: React.FC<EmbedCodeProps> = ({ userId, agentId }) => {
  const embedCode = ` <div
        className="z-50 fixed bottom-4 right-4 w-[90vw] sm:w-96 h-[93vh] max-h-[94vh]"
        id="chatbot-widget-containe"
      ></div>
<script src="https://ainspiretech.com/widget-loader.js?userId=${userId}&agentId=${agentId}" ></script>`;

  return (
    <div>
      <h3>Embed Code:</h3>
      <textarea
        readOnly
        className="w-full p-2  border text-black min-h-max max-h-min rounded-xl"
        value={embedCode}
        rows={4}
      />
    </div>
  );
};

export default EmbedCode;
