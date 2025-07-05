"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function FacebookIntegration() {
  const { getToken } = useAuth();
  const [pageToken, setPageToken] = useState<string>();
  const [pages, setPages] = useState<any[]>([]);
  const [igId, setIgId] = useState<string>();
  const [comments, setComments] = useState<any[]>([]);

  // 1️⃣ Exchange user FB token for Page tokens
  async function exchangeToken() {
    const fbToken = await getToken({ template: "facebook" });
    const res = await fetch("/api/web/facebook/login", {
      method: "POST",
      body: JSON.stringify({ accessToken: fbToken }),
    });
    const { longLivedToken, pages } = await res.json();
    setPages(pages);
  }

  // 2️⃣ Select a page, fetch IG account ID
  async function selectPage(page: any) {
    setPageToken(page.access_token);
    const res = await fetch("/api/web/facebook/instagram-account", {
      method: "POST",
      body: JSON.stringify({
        pageAccessToken: page.access_token,
        pageId: page.id,
      }),
    });
    const { igAccountId } = await res.json();
    setIgId(igAccountId);
  }

  // 3️⃣ Fetch comments for a media
  async function fetchComments(mediaId: string) {
    const res = await fetch("/api/web/facebook/comments", {
      method: "POST",
      body: JSON.stringify({
        action: "fetch",
        mediaId,
        pageAccessToken: pageToken,
        igAccountId: igId,
      }),
    });
    const { comments } = await res.json();
    setComments(comments);
  }

  // 4️⃣ Reply to a comment
  async function replyComment(commentId: string, message: string) {
    await fetch("/api/web/facebook/comments", {
      method: "POST",
      body: JSON.stringify({
        action: "reply",
        commentId,
        message,
        pageAccessToken: pageToken,
        igAccountId: igId,
      }),
    });
    // Refresh comments
    if (comments.length) fetchComments(comments[0].media_id);
  }

  // 5️⃣ Check account type and prompt upgrade UI
  const isProfessional = Boolean(igId);

  return (
    <div className="space-y-4">
      <button
        onClick={exchangeToken}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Connect Facebook
      </button>
      {pages.map((p) => (
        <button
          key={p.id}
          onClick={() => selectPage(p)}
          className="text-sm underline"
        >
          Use Page: {p.name}
        </button>
      ))}
      {isProfessional ? (
        <div>
          <h3>Comments</h3>
          <button
            onClick={() => fetchComments("MEDIA_ID_HERE")}
            className="px-2 py-1 border"
          >
            Load Comments
          </button>
          {comments.map((c) => (
            <div key={c.id} className="p-2 border rounded">
              <p>{c.text}</p>
              <button
                onClick={() =>
                  replyComment(
                    c.id,
                    "Thanks for your interest! Here is the link: ..."
                  )
                }
                className="text-xs text-blue-500"
              >
                Reply
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 border-yellow-400 bg-yellow-50 rounded">
          <p>
            Your Instagram is Personal. Please switch to a Business or Creator
            account in the Instagram app to enable automation.
          </p>
          <a
            href="https://help.instagram.com/502981923235522"
            target="_blank"
            className="text-blue-600 underline"
          >
            Learn how
          </a>
        </div>
      )}
    </div>
  );
}
