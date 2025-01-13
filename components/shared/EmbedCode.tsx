import React from "react";

interface EmbedCodeProps {
  userId: string;
  agentId: string;
}

const EmbedCode: React.FC<EmbedCodeProps> = ({ userId, agentId }) => {
  const embedCode = `<script src="https://ainspire-tech.vercel.app/api/agent" data-user-id="${userId}" data-agent-id="${agentId}"></script>`;

  return (
    <div>
      <h3>Embed Code:</h3>
      <textarea
        readOnly
        className="w-full p-2 border text-black min-h-max max-h-min rounded-xl"
        value={embedCode}
        rows={4}
      />
    </div>
  );
};

export default EmbedCode;
