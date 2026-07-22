import type { Metadata } from "next";
import { RequireAuth } from "../../components/auth/RequireAuth";
import { TextChatPage } from "../../components/chat/TextChatPage";

export const metadata: Metadata = {
  title: "和 Minsi 聊聊 | Minsi.ai",
  description: "当前页面内的临时文字聊天。聊天不保存，退出后自动清除。"
};

export default function ChatPage() {
  return (
    <RequireAuth>
      <TextChatPage />
    </RequireAuth>
  );
}
