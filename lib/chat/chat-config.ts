export const CHAT_INPUT_WARNING_LENGTH = 400;
export const CHAT_INPUT_MAX_LENGTH = 800;
export const CHAT_MAX_OUTPUT_TOKENS = 240;
export const CHAT_CONTEXT_MAX_TURNS = 8;
export const TEXT_CHAT_CONTEXT_MAX_LENGTH = 2400;
export const VOICE_CHAT_CONTEXT_MAX_LENGTH = 1200;

export const CHAT_INPUT_OVER_LIMIT_MESSAGE = "这段内容有点长，可以分成几条慢慢发给我，我会一条一条认真听。";

export const getCharLength = (str: string) => Array.from(str).length;

export const MINSI_WELCOME_MESSAGE_ID = "minsi-welcome";
export const MINSI_WELCOME_MESSAGE_VARIANTS = [
  ["嗨，我在。", "想到什么就从哪儿说。"],
  ["你来啦。", "开心的、烦的、小事都能聊。"],
  ["不用准备好再开口。", "说一点也可以。"],
  ["今天不想讲完整也没关系。", "我会跟上。"],
  ["先在这里歇一下。", "慢慢说就好。"],
  ["有点难开口的话。", "发一个词也可以。"]
];
