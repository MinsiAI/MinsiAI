import type { Metadata } from "next";
import { RequireAuth } from "../../../components/auth/RequireAuth";
import { VoiceChatPage } from "../../../components/chat/VoiceChatPage";

export const metadata: Metadata = {
  title: "语音陪伴 | Minsi.ai",
  description: "当前页面内的临时语音聊天界面。聊天不保存，退出后自动清除。"
};

export default function ChatVoicePage() {
  return (
    <RequireAuth>
      <VoiceChatPage />
    </RequireAuth>
  );
}
