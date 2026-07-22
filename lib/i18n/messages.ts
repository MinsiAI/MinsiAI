import type { MinsiLang } from "./language";

export const languageSwitchMessages = {
  zh: {
    closeMenu: "关闭语言菜单",
    menuLabel: "选择语言",
    switchLabel: "切换语言"
  },
  en: {
    closeMenu: "Close language menu",
    menuLabel: "Choose language",
    switchLabel: "Switch language"
  }
} satisfies Record<MinsiLang, Record<string, string>>;

export const siteHeaderMessages = {
  zh: {
    accountFallback: "账号",
    closeMenu: "关闭菜单",
    home: "首页",
    login: "登录 / 注册",
    logoLabel: "Minsi 首页",
    logout: "退出登录",
    loggingOut: "退出中",
    mobileNavigation: "移动端页面导航",
    nav: {
      about: "关于Minsi",
      privacy: "隐私与安全",
      research: "匿名心声"
    },
    openMenu: "打开菜单",
    providerAccount: (provider: string) => `${provider}账号`,
    signedIn: (provider: string, email?: string | null) => email ? `已通过${provider}登录：${email}` : `已通过${provider}登录`
  },
  en: {
    accountFallback: "Account",
    closeMenu: "Close menu",
    home: "Home",
    login: "Log in / Sign up",
    logoLabel: "Minsi home",
    logout: "Log out",
    loggingOut: "Logging out",
    mobileNavigation: "Mobile page navigation",
    nav: {
      about: "About Minsi",
      privacy: "Privacy & Safety",
      research: "Anonymous Voices"
    },
    openMenu: "Open menu",
    providerAccount: (provider: string) => `${provider} account`,
    signedIn: (provider: string, email?: string | null) => email ? `Signed in with ${provider}: ${email}` : `Signed in with ${provider}`
  }
};

export function providerName(lang: MinsiLang, authProvider: string, fallbackLabel: string) {
  if (authProvider === "wechat") {
    return lang === "zh" ? "微信" : "WeChat";
  }

  if (authProvider === "qq") {
    return "QQ";
  }

  if (authProvider === "email") {
    return lang === "zh" ? "邮箱" : "Email";
  }

  return lang === "zh" ? fallbackLabel : siteHeaderMessages.en.accountFallback;
}

export const homeMessages = {
  zh: {
    chat: {
      replyLines: ["没关系，", "我们一点点来。"],
      user: "我不知道怎么讲。"
    },
    features: [
      {
        title: "语音或文字聊天",
        body: "想说的时候，直接说出来；不方便说话时，也可以慢慢写下来。",
        desktopLines: ["想说的时候，直接说出来;", "不方便说话时，", "也可以慢慢写下来。"]
      },
      {
        title: "不保存会话",
        body: "聊天内容不会长期保留，退出后自动删除。",
        desktopLines: ["聊天内容不会长期保留，", "退出后自动删除。"]
      },
      {
        title: "轻松离开",
        body: "不需要整理记录，也不用担心被翻看，说完就可以安心离开。",
        desktopLines: ["不需要整理记录，也不用", "担心被翻看，说完就可以", "安心离开。"]
      }
    ],
    hero: {
      greeting: "嗨， 我是",
      script: "我在这里，听你说。",
      subtitle: "不评判，不打断。你可以放心说，我会一直在。"
    },
    notes: {
      encouragement: ["你已经", "很棒了！"],
      patience: ["慢慢来，", "没关系的"]
    },
    prompt: {
      chooseMode: "点击后可选择语音或文字聊天",
      noSave: "所有会话不保存，退出后自动删除"
    },
    safety: "Minsi不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业帮助。",
    voice: {
      areaLabel: "开始聊天",
      buttonLabel: "开始和 Minsi 聊聊",
      error: "连接暂时不太顺利，请稍后再试。"
    }
  },
  en: {
    chat: {
      replyLines: ["That's okay,", "we'll go slowly."],
      user: "I don't know what to say."
    },
    features: [
      {
        title: "Voice or text chat",
        body: "Say it out loud when you want, or take your time and write when speaking isn't convenient.",
        desktopLines: ["Say it aloud;", "or take your time", "and write it down."]
      },
      {
        title: "No saved chats",
        body: "Your conversations aren't kept long-term and are deleted when you leave.",
        desktopLines: ["No long-term records,", "deleted when you leave."]
      },
      {
        title: "Leave with ease",
        body: "No records to organize and nothing left to be looked through. You can simply say what you need and leave at ease.",
        desktopLines: ["No records to sort;", "nothing left behind.", "Leave at ease."]
      }
    ],
    hero: {
      greeting: "Hi, I'm",
      script: "I'm here to listen.",
      subtitle: "No judgment, no interruptions. You can speak freely—I'll be right here."
    },
    notes: {
      encouragement: ["You're doing", "so well!"],
      patience: ["Take your time,", "it's okay."]
    },
    prompt: {
      chooseMode: "Choose voice or text chat",
      noSave: "Not saved; deleted when you leave"
    },
    safety: "Minsi does not save your conversations and is not a doctor or therapist. If you are in danger, contact a trusted adult or qualified professional.",
    voice: {
      areaLabel: "Start chatting",
      buttonLabel: "Start chatting with Minsi",
      error: "We're having trouble connecting right now. Please try again shortly."
    }
  }
};

export type HomeMessages = (typeof homeMessages)[MinsiLang];

export const loginMessages = {
  zh: {
    safetyText: "登录只是为了安全进入，Minsi 不会保存你的聊天内容。",
    titlePrefix: "嗨，欢迎来到",
    subtitleLines: ["不用真实姓名，也不用手机号", "一句话，就可以开始"],
    emailDivider: "或使用邮箱登录",
    mobileOauthError: {
      wechat: "微信登录暂时打不开，请稍后重试。",
      qq: "QQ登录暂时打不开，请稍后重试。"
    },
    qrStatus: {
      loading: "二维码正在生成",
      expired: "二维码已过期，点击卡片刷新",
      errorFallback: "二维码加载有点慢，我们再试一次。",
      success: "登录成功，正在进入 Minsi",
      refreshPrefix: "二维码",
      refreshSuffix: "后自动刷新"
    },
    email: {
      invalidEmail: "这个邮箱格式好像不太对。",
      rateLimited: "发送太频繁了，可以稍后再试一下。",
      codeSent: "验证码已经发送，请留意邮箱。",
      sendFailed: "验证码发送失败，请稍后再试。",
      invalidCode: "验证码好像不太对，可以再检查一下。",
      success: "验证通过，正在进入 Minsi。",
      codeLabel: "邮箱验证码",
      emailLabel: "邮箱地址",
      codePlaceholder: "请输入验证码",
      emailPlaceholder: "请输入邮箱地址",
      helper: "不用手机号，一个邮箱就可以开始",
      loginLoading: "登录中",
      login: "登录",
      sending: "发送中",
      getCode: "获取验证码"
    },
    qr: {
      providers: {
        wechat: {
          title: "微信扫码登录",
          hint: "请使用微信扫一扫",
          alt: "微信扫码登录二维码",
          loading: "正在生成二维码",
          expired: "二维码已过期",
          failed: "二维码生成失败",
          retry: "重新加载二维码",
          scanned: "已扫码，请确认",
          success: "登录成功",
          error: "刷新失败"
        },
        qq: {
          title: "QQ扫码登录",
          hint: "请使用QQ扫一扫",
          alt: "QQ扫码登录二维码",
          loading: "正在生成二维码",
          expired: "二维码已过期",
          failed: "二维码生成失败",
          retry: "重新加载二维码",
          scanned: "已扫码，请确认",
          success: "登录成功",
          error: "刷新失败"
        }
      }
    },
    social: {
      wechat: "微信登录",
      qq: "QQ登录",
      openingWechat: "正在打开微信",
      openingQq: "正在打开QQ"
    },
    safetyItems: ["不用手机号", "聊天不保存", "退出自动清除"]
  },
  en: {
    safetyText: "Logging in only keeps entry safe. Minsi does not save your chats.",
    titlePrefix: "Hi, welcome to",
    subtitleLines: ["No real name or phone number needed", "One email is enough to begin"],
    emailDivider: "Or continue with email",
    mobileOauthError: {
      wechat: "WeChat login cannot open right now. Please try again later.",
      qq: "QQ login cannot open right now. Please try again later."
    },
    qrStatus: {
      loading: "Generating QR code",
      expired: "QR code expired. Click the card to refresh.",
      errorFallback: "The QR code is loading slowly. Let's try again.",
      success: "Signed in. Entering Minsi.",
      refreshPrefix: "QR code refreshes in",
      refreshSuffix: ""
    },
    email: {
      invalidEmail: "That email format does not look right.",
      rateLimited: "Too many requests. Please try again shortly.",
      codeSent: "The code has been sent. Please check your inbox.",
      sendFailed: "Could not send the code. Please try again later.",
      invalidCode: "That code does not look right. Please check it again.",
      success: "Verified. Entering Minsi.",
      codeLabel: "Email code",
      emailLabel: "Email address",
      codePlaceholder: "Enter verification code",
      emailPlaceholder: "Enter your email",
      helper: "No phone number needed. One email is enough.",
      loginLoading: "Signing in",
      login: "Log in",
      sending: "Sending",
      getCode: "Get code"
    },
    qr: {
      providers: {
        wechat: {
          title: "Scan with WeChat",
          hint: "Use WeChat to scan",
          alt: "WeChat login QR code",
          loading: "Generating QR code",
          expired: "QR code expired",
          failed: "QR code failed",
          retry: "Reload QR code",
          scanned: "Scanned. Please confirm.",
          success: "Signed in",
          error: "Refresh failed"
        },
        qq: {
          title: "Scan with QQ",
          hint: "Use QQ to scan",
          alt: "QQ login QR code",
          loading: "Generating QR code",
          expired: "QR code expired",
          failed: "QR code failed",
          retry: "Reload QR code",
          scanned: "Scanned. Please confirm.",
          success: "Signed in",
          error: "Refresh failed"
        }
      }
    },
    social: {
      wechat: "Log in with WeChat",
      qq: "Log in with QQ",
      openingWechat: "Opening WeChat",
      openingQq: "Opening QQ"
    },
    safetyItems: ["No phone number", "Chats not saved", "Cleared on exit"]
  }
} as const;

export type LoginMessages = (typeof loginMessages)[MinsiLang];

export const aboutMessages = {
  zh: {
    activeNav: "about",
    hero: {
      title: "关于 Minsi",
      kicker: "一个为青少年设计的 AI 情绪陪伴空间",
      body: "你可以用语音或文字，说出那些一时不知道该怎么讲的话。Minsi 不评判，不打断，会陪你慢慢整理感受。",
      cta: "开始和 Minsi 聊聊 →",
      noteLines: ["你已经", "很棒了！"],
      imageAlt: "Minsi 的温柔陪伴空间"
    },
    chatError: "连接暂时不太顺利，请稍后再试。",
    sectionHeartAlt: "",
    video: {
      title: "30 秒了解 Minsi",
      body: "从一个“不知道怎么讲”的瞬间开始，看看 Minsi 如何陪你慢慢说出来。",
      action: "播放视频",
      imageAlt: "Minsi 视频预览画面：我在这里，听你说。"
    },
    why: {
      title: "为什么做 Minsi",
      lead: "Minsi 的开始，其实来自一句很简单的话：“我不知道怎么讲。”",
      paragraphs: [
        "我发现，很多时候我们不是没有感受，也不是不想求助，而是不知道第一句话该怎么说。尤其是一些很小、很乱、说出来又怕被误解的情绪，常常会被我们自己压下去。",
        "所以我想做 Minsi。它不是为了立刻给出答案，而是先接住那个还没说清楚的瞬间，陪你慢慢开始。"
      ],
      imageAlt: "Minsi 陪伴用户从不知道怎么讲的时刻开始表达"
    },
    emotion: {
      title: "Minsi 的情绪语言",
      intro: "Minsi 的 Logo 不只是一个标志，它也可以表达陪伴的状态：平静、焦虑、迷茫、希望、清晰与连接。",
      carouselLabel: "Minsi 的情绪语言",
      dotsLabel: "切换情绪语言卡片",
      viewLabelPrefix: "查看",
      items: [
        { title: "平静", body: "慢慢呼吸，\n陪你稳定下来。", image: "emotion-calm.png", width: 112, height: 72 },
        { title: "焦虑", body: "提醒你放慢，\n而不是催你\n马上好起来。", image: "emotion-anxious.png", width: 112, height: 78 },
        { title: "迷茫", body: "允许你\n暂时说不清楚。", image: "emotion-lost.png", width: 112, height: 78 },
        { title: "希望", body: "帮你看到\n一点点可能。", image: "emotion-hope.png", width: 112, height: 74 },
        { title: "清晰", body: "把混乱的想法\n整理出来。", image: "emotion-clear.png", width: 118, height: 72 },
        { title: "连接", body: "让你感觉\n不是一个人。", image: "emotion-connect.png", width: 124, height: 81 }
      ]
    },
    ability: {
      title: "Minsi 可以陪你做什么",
      items: [
        { title: "不知道怎么开口时", body: "你可以先说一句很短的话，或只打几个字，Minsi 会陪你一点点展开。", image: "ability-open.png", imageAlt: "Minsi 陪伴用户从一句话开始表达", align: "left" },
        { title: "情绪很乱时", body: "Minsi 会陪你把感受、原因和想法慢慢分开，让混乱变得清晰一点。", image: "ability-messy.png", imageAlt: "Minsi 陪伴用户整理混乱的想法", align: "right" },
        { title: "担心隐私时", body: "聊天内容不保存，退出后自动清除，也不会长期追踪你的表达。", image: "ability-privacy.png", imageAlt: "Minsi 用安全边界守护表达内容", align: "right" }
      ]
    },
    story: {
      title: "项目故事",
      voicesTitle: "真实用户声音",
      voices: [
        { quote: "有时候我不是想要答案，只是想先把话说出来。", byline: "一位高一学生", image: "user-avatar-1-real.png", width: 83, height: 82 },
        { quote: "当我不知道怎么开口时，Minsi 让我觉得可以慢慢来。", byline: "一位初二学生", image: "user-avatar-2-real.png", width: 83, height: 79 }
      ],
      moreVoices: "查看更多用户心声 →",
      timelineTitle: "设计迭代过程",
      timeline: [
        { version: "V1", title: "文字聊天原型", body: "先验证用户是否愿意向 AI 表达情绪。" },
        { version: "V2", title: "加入语音入口", body: "因为有用户说，说出来时反而更容易开口。" },
        { version: "V3", title: "强化隐私说明", body: "把用户最关心的“我的内容不会被别人看到”讲清楚。" },
        { version: "V4", title: "优化移动端界面", body: "让手机上的陪伴入口更轻、更清楚。" }
      ],
      moreTimeline: "查看完整迭代记录 →",
      metricsTitle: "数据看板",
      metricsBadge: "持续更新中",
      userCount: "体验人数",
      iterationCount: "完成迭代",
      timesUnit: "次",
      moreData: "查看更多数据 →",
      concernsTitle: "用户最关心的问题 Top3",
      concerns: [
        { title: "隐私会不会被看到？", icon: "lock" },
        { title: "不知道怎么开口怎么办？", icon: "message" },
        { title: "Minsi 会不会保存我的话？", icon: "save" }
      ],
      moreQuestions: "查看更多问题 →"
    },
    bottom: {
      ariaLabel: "Minsi 的边界与共创",
      boundaryTitle: "Minsi 的边界",
      boundaryText: "Minsi 不是医生或心理治疗师，不能替代专业帮助；聊天内容不保存，退出后自动清除。",
      resources: "获取帮助资源 →",
      growTitle: "和 Minsi 一起成长",
      growBody: "你的真实感受很重要，会帮助 Minsi 变得更安全、更温暖，也更懂你。",
      share: "分享你的想法 →"
    }
  },
  en: {
    activeNav: "about",
    hero: {
      title: "About Minsi",
      kicker: "An AI emotional companion space designed for teenagers",
      body: "Use voice or text to say the things that are hard to start. Minsi does not judge or interrupt, and helps you sort through what you feel at your own pace.",
      cta: "Start chatting with Minsi →",
      noteLines: ["You're doing", "so well!"],
      imageAlt: "Minsi's gentle companion space"
    },
    chatError: "We're having trouble connecting right now. Please try again shortly.",
    sectionHeartAlt: "",
    video: {
      title: "Meet Minsi in 30 seconds",
      body: "Start from an “I don't know how to say it” moment and see how Minsi helps you begin.",
      action: "Play video",
      imageAlt: "Minsi video preview: I'm here to listen."
    },
    why: {
      title: "Why Minsi Exists",
      lead: "Minsi began with one simple sentence: “I don't know how to say it.”",
      paragraphs: [
        "Often we do have feelings, and we may want help, but the first sentence is the hardest part. Small, messy feelings can feel easy to misunderstand, so they get pushed down.",
        "That is why Minsi exists. It is not here to rush an answer. It first catches the unsaid moment and helps you begin slowly."
      ],
      imageAlt: "Minsi helping someone begin from an I do not know how to say it moment"
    },
    emotion: {
      title: "Minsi's Emotional Language",
      intro: "The Minsi logo is more than a mark. It can express companion states: calm, anxious, lost, hopeful, clear, and connected.",
      carouselLabel: "Minsi's emotional language",
      dotsLabel: "Switch emotional language cards",
      viewLabelPrefix: "View ",
      items: [
        { title: "Calm", body: "Breathe slowly.\nSettle with support.", image: "emotion-calm.png", width: 112, height: 72 },
        { title: "Anxious", body: "A reminder to slow down,\nnot to be okay\nright away.", image: "emotion-anxious.png", width: 112, height: 78 },
        { title: "Lost", body: "It is okay\nnot to have words yet.", image: "emotion-lost.png", width: 112, height: 78 },
        { title: "Hope", body: "Notice one\nsmall possibility.", image: "emotion-hope.png", width: 112, height: 74 },
        { title: "Clear", body: "Sort tangled thoughts\ninto something clearer.", image: "emotion-clear.png", width: 118, height: 72 },
        { title: "Connected", body: "Feel a little less\nalone.", image: "emotion-connect.png", width: 124, height: 81 }
      ]
    },
    ability: {
      title: "How Minsi Can Help",
      items: [
        { title: "When it is hard to begin", body: "Start with one short sentence, or just a few words. Minsi will help you unfold it slowly.", image: "ability-open.png", imageAlt: "Minsi helping someone begin with one sentence", align: "left" },
        { title: "When feelings are messy", body: "Minsi helps separate feelings, reasons, and thoughts so the mess becomes a little clearer.", image: "ability-messy.png", imageAlt: "Minsi helping organize tangled thoughts", align: "right" },
        { title: "When privacy matters", body: "Chats are not saved, are cleared when you leave, and are not used to track your expression long-term.", image: "ability-privacy.png", imageAlt: "Minsi protecting expression with privacy boundaries", align: "right" }
      ]
    },
    story: {
      title: "Project Story",
      voicesTitle: "Real User Voices",
      voices: [
        { quote: "Sometimes I don't want an answer. I just want to say it first.", byline: "A grade 10 student", image: "user-avatar-1-real.png", width: 83, height: 82 },
        { quote: "When I didn't know how to begin, Minsi made it feel okay to go slowly.", byline: "A grade 8 student", image: "user-avatar-2-real.png", width: 83, height: 79 }
      ],
      moreVoices: "See more voices →",
      timelineTitle: "Design Iterations",
      timeline: [
        { version: "V1", title: "Text chat prototype", body: "First, we tested whether users wanted to express emotions to AI." },
        { version: "V2", title: "Added voice entry", body: "Some users said speaking made it easier to begin." },
        { version: "V3", title: "Strengthened privacy copy", body: "We made the “others cannot see my words” concern clearer." },
        { version: "V4", title: "Improved mobile UI", body: "The companion entry became lighter and clearer on phones." }
      ],
      moreTimeline: "See full iteration notes →",
      metricsTitle: "Data Board",
      metricsBadge: "Updating",
      userCount: "Participants",
      iterationCount: "Iterations",
      timesUnit: "times",
      moreData: "See more data →",
      concernsTitle: "Top 3 User Concerns",
      concerns: [
        { title: "Will my privacy be seen?", icon: "lock" },
        { title: "What if I do not know how to start?", icon: "message" },
        { title: "Will Minsi save what I say?", icon: "save" }
      ],
      moreQuestions: "See more questions →"
    },
    bottom: {
      ariaLabel: "Minsi boundaries and co-creation",
      boundaryTitle: "Minsi's Boundaries",
      boundaryText: "Minsi is not a doctor or therapist and cannot replace professional help. Chats are not saved and are cleared when you leave.",
      resources: "Get help resources →",
      growTitle: "Grow with Minsi",
      growBody: "Your real feelings matter. They help Minsi become safer, warmer, and more useful.",
      share: "Share your thoughts →"
    }
  }
} as const;

export type AboutMessages = (typeof aboutMessages)[MinsiLang];

export const privacyMessages = {
  zh: {
    safetyText: "Minsi 不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业机构。",
    hero: {
      titleLines: ["你可以放心说，", "不用留下记录"],
      body: "Minsi 需要登录后才能进入聊天，但登录不会改变隐私边界：你的聊天内容不会被保存，也不会生成历史记录；退出聊天后，本次对话会自动清除。",
      startChat: "开始和 Minsi 聊聊 →",
      checking: "正在确认登录...",
      error: "连接暂时不太顺利，请稍后再试。"
    },
    commitmentsLabel: "隐私承诺",
    commitments: [
      { icon: "chat", title: "默认不保存", text: "每一次聊天都是临时会话，不会长期保留。" },
      { icon: "shield", title: "退出即可清除", text: "离开聊天后，对话内容会自动清除，无法恢复。" },
      { icon: "feather", title: "不用手动管理", text: "没有历史记录，也不需要你再去删除，轻松无负担。" }
    ],
    data: {
      title: "我们如何对待你的数据",
      footnote: "Minsi 的设计目标是：让你可以安心表达，而无需担心记录被保存。",
      items: [
        { icon: "shield", title: "不保存你的会话内容", text: "所有聊天只在会话期间存在，退出后自动清除。" },
        { icon: "lock", title: "不用于训练模型", text: "你的聊天内容不会用于优化或训练任何 AI 模型。" },
        { icon: "hidden", title: "不与他人共享", text: "我们不会将你的聊天内容展示或提供给其他用户。" },
        { icon: "session", title: "尽力保护你的隐私", text: "我们采用合理的技术与管理措施，保护你的信息安全。" }
      ]
    },
    mode: {
      ariaLabel: "当前隐私模式",
      title: "当前隐私模式",
      live: "临时聊天中",
      lines: ["聊天内容不会保存", "退出后自动清除"],
      hint: "此模式为默认设置，无法关闭，也无需设置。",
      items: [
        { icon: "clock", title: "临时会话", text: "不会保留历史" },
        { icon: "trash", title: "退出即清除", text: "离开后自动清除" },
        { icon: "heart", title: "安心表达", text: "放心说、慢慢说" }
      ]
    },
    boundary: {
      title: "Minsi 会陪你，但不会替代现实中的帮助",
      body: "Minsi 可以陪你慢慢说、写下想法、梳理表达。它不是医生或心理治疗师，也不能替代可信任的人或专业机构。",
      canDoTitle: "Minsi 可以做的",
      dangerTitle: "遇到危险时",
      canDo: [
        { icon: "heart", title: "陪你表达情绪", text: "不评判，不催促" },
        { icon: "session", title: "帮你整理想法", text: "把混乱慢慢说清" },
        { icon: "check", title: "提供温柔陪伴", text: "适合想被听见的时候" },
        { icon: "home", title: "提醒照顾自己", text: "鼓励休息和求助" }
      ],
      danger: [
        { icon: "person", title: "联系可信任的大人", text: "不要独自承受危险" },
        { icon: "phone", title: "联系当地紧急服务", text: "需要时立刻求助" },
        { icon: "help", title: "寻求专业机构帮助", text: "把安全放在第一位" },
        { icon: "shield", title: "离开不安全环境", text: "先到有人陪伴的地方" }
      ]
    },
    resources: {
      title: "安全帮助资源",
      intro: "如果你或身边的人正处在现实危险中，请优先联系可信任的大人、当地紧急服务或已经人工核实的专业机构。",
      verificationTitle: "资源待核实",
      verificationBody: "当前安全资源仍为人工核实前的占位信息，暂不展示热线号码。",
      loading: "正在加载安全资源...",
      error: "资源暂时无法加载。遇到现实危险时，请优先联系当地紧急服务或可信任的大人。",
      placeholderAvailable: "待人工核实后上线",
      placeholderContact: "资源待核实，暂不展示热线号码"
    },
    faq: {
      title: "你可能关心的问题",
      items: [
        { question: "Minsi 会保存我的聊天记录吗？", answer: "不会。聊天内容不保存，退出后自动清除。" },
        { question: "退出之后还能找回之前的聊天吗？", answer: "不能。为了减少记录压力，离开聊天后本次对话无法恢复。" },
        { question: "我需要手动删除记录吗？", answer: "不需要。Minsi 会在你退出聊天后自动清除本次内容。" },
        { question: "别人能看到我的聊天内容吗？", answer: "不会。我们不会把你的聊天内容展示或提供给其他用户。" },
        { question: "Minsi 是医生或心理治疗师吗？", answer: "不是。Minsi 可以陪你表达，但不能替代现实中的专业帮助。" },
        { question: "聊天前需要登录吗？", answer: "需要。登录只是为了安全进入，Minsi 不会保存你的聊天内容；登录后仍是临时会话，退出后自动清除。" },
        { question: "Minsi 会把聊天内容用于训练 AI 吗？", answer: "不会。你的聊天内容不会用于优化或训练任何 AI 模型。" },
        { question: "聊天内容会被用于广告或商业用途吗？", answer: "不会。Minsi 不用聊天内容做广告画像或商业推送。" },
        { question: "我可以选择保存聊天记录吗？", answer: "当前不支持保存聊天记录。这个页面的默认边界就是不留下记录。" },
        { question: "未成年人使用 Minsi 安全吗？", answer: "遇到危险、胁迫或伤害自己/他人的想法时，请马上联系可信任的大人或当地紧急服务。" }
      ]
    },
    rules: {
      title: "想了解完整规则？",
      body: "查看《隐私政策》和《用户协议》",
      note: "我们会尽量用清楚、简单的语言解释每一项规则。",
      privacy: "隐私政策",
      terms: "用户协议"
    }
  },
  en: {
    safetyText: "Minsi does not save your chats and is not a doctor or therapist. If you are in danger, contact a trusted adult or qualified professional.",
    hero: {
      titleLines: ["You can speak freely", "without leaving records"],
      body: "Minsi requires login before chat access, but login does not change the privacy boundary: your chats are not saved, no history is created, and the current conversation is cleared when you leave.",
      startChat: "Start chatting with Minsi →",
      checking: "Checking login...",
      error: "We're having trouble connecting right now. Please try again shortly."
    },
    commitmentsLabel: "Privacy commitments",
    commitments: [
      { icon: "chat", title: "Not saved by default", text: "Each chat is a temporary session and is not kept long-term." },
      { icon: "shield", title: "Cleared when you leave", text: "After you leave chat, the conversation is cleared and cannot be recovered." },
      { icon: "feather", title: "Nothing to manage", text: "There is no history to organize or delete, so leaving stays simple." }
    ],
    data: {
      title: "How We Handle Your Data",
      footnote: "Minsi is designed so you can express yourself without worrying that chat records are being kept.",
      items: [
        { icon: "shield", title: "We do not save chat content", text: "Chats only exist during the session and are cleared when you leave." },
        { icon: "lock", title: "Not used to train models", text: "Your chat content is not used to optimize or train AI models." },
        { icon: "hidden", title: "Not shared with others", text: "We do not show or provide your chat content to other users." },
        { icon: "session", title: "Privacy is protected", text: "We use reasonable technical and operational safeguards to protect your information." }
      ]
    },
    mode: {
      ariaLabel: "Current privacy mode",
      title: "Current Privacy Mode",
      live: "Temporary chat",
      lines: ["Chat content is not saved", "Cleared when you leave"],
      hint: "This is the default mode. It cannot be turned off and needs no setup.",
      items: [
        { icon: "clock", title: "Temporary session", text: "No history kept" },
        { icon: "trash", title: "Cleared on exit", text: "Cleared after leaving" },
        { icon: "heart", title: "Express freely", text: "Speak slowly, safely" }
      ]
    },
    boundary: {
      title: "Minsi can accompany you, but cannot replace real-world help",
      body: "Minsi can listen, help you write things down, and help organize thoughts. It is not a doctor or therapist and cannot replace trusted people or professional services.",
      canDoTitle: "What Minsi can do",
      dangerTitle: "When there is danger",
      canDo: [
        { icon: "heart", title: "Support expression", text: "No judgment or pressure" },
        { icon: "session", title: "Help sort thoughts", text: "Untangle things slowly" },
        { icon: "check", title: "Offer gentle company", text: "For moments you want to be heard" },
        { icon: "home", title: "Remind self-care", text: "Encourage rest and support" }
      ],
      danger: [
        { icon: "person", title: "Tell a trusted adult", text: "Do not handle danger alone" },
        { icon: "phone", title: "Contact local emergency services", text: "Get urgent help when needed" },
        { icon: "help", title: "Reach professional services", text: "Put safety first" },
        { icon: "shield", title: "Leave unsafe places", text: "Move toward someone safe" }
      ]
    },
    resources: {
      title: "Safety Help Resources",
      intro: "If you or someone nearby is in real-world danger, first contact a trusted adult, local emergency services, or a human-verified professional service.",
      verificationTitle: "Resources pending verification",
      verificationBody: "Current safety resources are placeholders before human verification, so hotline numbers are not displayed.",
      loading: "Loading safety resources...",
      error: "Safety resources cannot load right now. In real-world danger, contact local emergency services or a trusted adult first.",
      placeholderAvailable: "Pending human verification",
      placeholderContact: "Resource pending verification. Hotline number hidden."
    },
    faq: {
      title: "Questions You May Have",
      items: [
        { question: "Does Minsi save my chats?", answer: "No. Chat content is not saved and is cleared when you leave." },
        { question: "Can I recover a chat after leaving?", answer: "No. To reduce record pressure, the current conversation cannot be recovered after you leave." },
        { question: "Do I need to delete records manually?", answer: "No. Minsi clears the current conversation automatically after you leave chat." },
        { question: "Can other people see my chats?", answer: "No. We do not show or provide your chat content to other users." },
        { question: "Is Minsi a doctor or therapist?", answer: "No. Minsi can accompany your expression, but it cannot replace real-world professional help." },
        { question: "Do I need to log in before chatting?", answer: "Yes. Login is only for safe entry. Minsi still does not save your chats after login; the chat remains temporary and is cleared when you leave." },
        { question: "Will Minsi use chats to train AI?", answer: "No. Your chat content is not used to optimize or train AI models." },
        { question: "Will chats be used for ads or commercial targeting?", answer: "No. Minsi does not use chat content for advertising profiles or commercial pushes." },
        { question: "Can I choose to save chat records?", answer: "No. Saving chat records is not supported. This page's default boundary is leaving no records behind." },
        { question: "Is Minsi safe for minors?", answer: "If there is danger, coercion, or thoughts of harming yourself or others, contact a trusted adult or local emergency services immediately." }
      ]
    },
    rules: {
      title: "Want the full rules?",
      body: "Read the Privacy Policy and Terms of Use",
      note: "We try to explain every rule in clear, simple language.",
      privacy: "Privacy Policy",
      terms: "Terms of Use"
    }
  }
} as const;

export type PrivacyMessages = (typeof privacyMessages)[MinsiLang];

export const researchMessages = {
  zh: {
    hero: {
      title: "听听他们怎么说",
      lead: "这里收集了一些来自内测体验和产品测试中的匿名心声。每一条反馈都经过隐私处理，已去除姓名、学校、联系方式等可识别个人身份的信息。我们希望你在这里看到的不只是数据，而是一些具体的感受、困惑，以及被认真倾听的瞬间。",
      share: "分享你的想法",
      privacy: "了解隐私保护",
      trustLabel: "匿名心声承诺",
      imageAlt: "Minsi 云朵形象与用户反馈卡片",
      trustItems: [
        { title: "隐私保护", body: "只收集你主动提交的反馈", icon: "shield" },
        { title: "自愿参与", body: "可以跳过问题，随时退出", icon: "check" },
        { title: "匿名样本", body: "帮助校准产品表达", icon: "comment" }
      ]
    },
    metricsLabel: "匿名心声数据概览",
    metricLabels: {
      userCount: "用户数",
      approvedFeedbackCount: "反馈样本",
      coveredRegionCount: "覆盖城市",
      voluntaryPercent: "自愿参与"
    },
    guide: {
      title: "我们想更认真地听见使用体验",
      body: "研究重点放在表达入口、隐私理解和安全边界，不会读取或保存聊天内容。",
      carouselLabel: "研究计划轮播",
      dotsLabel: "切换研究计划卡片",
      viewLabelPrefix: "查看",
      suitableLabel: "适合参与的人",
      suitableTitle: "适合参与的人",
      items: [
        { title: "研究目的", body: "了解用户在开口、隐私说明和离开流程上的真实感受，优化 Minsi 的入口、文案和安全提示。", icon: "sparkle" },
        { title: "参与方式", body: "你可以选择匿名问卷、原型试用或短访谈。参与完全自愿，可以跳过任何问题，也可以随时退出。", icon: "comment" },
        { title: "反馈如何使用", body: "反馈只用于改进产品体验和安全边界。Minsi 不保存聊天内容，退出后自动清除，也不会长期追踪你的表达。", icon: "shield" }
      ],
      suitableItems: ["正在试用 Minsi 的用户", "对隐私与表达安全有顾虑的人", "希望反馈界面、入口或文案的人", "青少年照护者、教育工作者或产品体验参与者"]
    },
    feedback: {
      title: "匿名反馈",
      filterLabel: "反馈分类",
      updating: "持续更新",
      carouselLabel: "匿名反馈轮播",
      dotsLabel: "切换匿名反馈卡片",
      viewPrefix: "查看",
      viewSuffix: "反馈",
      expand: "展开",
      more: "查看更多反馈",
      anonymousRegion: "匿名",
      anonymousTag: "匿名反馈",
      filters: ["全部", "不保存记录", "情绪表达", "被理解", "语音聊天", "考试压力", "其他"],
      ratingLabels: {
        very: "很有帮助",
        some: "有一点帮助",
        unsure: "还不确定"
      },
      typeLabels: {
        "不保存记录": "不保存记录",
        "隐私安全": "隐私安全",
        "考试压力": "考试压力",
        "被理解": "被理解",
        "情绪表达": "情绪表达",
        "语音聊天": "语音聊天",
        "其他": "其他"
      }
    },
    city: {
      title: "来自这些地方",
      body: "地区仅精确到城市，用来理解不同环境下的产品体验。",
      notice: "所有内容经审核后匿名展示。你可以随时要求删除自己主动提交的反馈。"
    },
    share: {
      title: "想分享你的想法吗？",
      privacy: "参与研究是自愿的，你可以随时退出。Minsi 不保存聊天内容，退出后自动清除；你主动提交的反馈只用于改进产品体验和安全说明。",
      safetyText: "Minsi 不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业帮助。",
      feedbackLabel: "你的反馈",
      placeholder: "写下你使用 Minsi 时的真实感受，几句话也可以...",
      experienceLegend: "你最在意的体验（可多选）",
      ratingLegend: "你觉得 Minsi 有帮助吗？",
      submitting: "提交中",
      submit: "匿名提交想法",
      emptyError: "请先写下你的反馈。",
      tooLongError: "最多可以输入 {max} 个字符。",
      success: "提交成功。审核通过后才会匿名展示。",
      errors: {
        unauthorized: "请先登录后再提交匿名反馈。",
        rateLimited: "提交太频繁，请稍后再试。",
        badRequest: "请检查反馈内容后再提交。",
        fallback: "提交失败，请稍后再试。"
      },
      experienceOptions: [
        { value: "不保存记录", label: "不保存记录" },
        { value: "隐私安全", label: "隐私安全" },
        { value: "考试压力", label: "考试压力" },
        { value: "被理解", label: "被理解" },
        { value: "情绪表达", label: "情绪表达" },
        { value: "语音聊天", label: "语音聊天" },
        { value: "其他", label: "其他" }
      ],
      ratingOptions: [
        { value: "very", label: "很有帮助" },
        { value: "some", label: "有一点帮助" },
        { value: "unsure", label: "还不确定" }
      ]
    }
  },
  en: {
    hero: {
      title: "Anonymous Voices",
      lead: "Here are anonymous voices from internal trials and product testing. Each piece of feedback has been privacy-processed, with names, schools, contact details, and other identifying information removed. We hope you see not just data, but real feelings, questions, and moments of being heard.",
      share: "Share your thoughts",
      privacy: "How privacy is protected",
      trustLabel: "Anonymous voices commitments",
      imageAlt: "Minsi cloud character with user feedback cards",
      trustItems: [
        { title: "Privacy protected", body: "Only feedback you choose to submit is collected", icon: "shield" },
        { title: "Voluntary", body: "Skip questions and leave anytime", icon: "check" },
        { title: "Anonymous samples", body: "Help refine product expression", icon: "comment" }
      ]
    },
    metricsLabel: "Anonymous voices overview",
    metricLabels: {
      userCount: "Users",
      approvedFeedbackCount: "Feedback samples",
      coveredRegionCount: "Cities covered",
      voluntaryPercent: "Voluntary"
    },
    guide: {
      title: "We want to hear the experience more carefully",
      body: "Research focuses on expression entry, privacy understanding, and safety boundaries. It does not read or save chat content.",
      carouselLabel: "Research plan carousel",
      dotsLabel: "Switch research plan cards",
      viewLabelPrefix: "View ",
      suitableLabel: "People suited to participate",
      suitableTitle: "Who this is for",
      items: [
        { title: "Research goal", body: "Understand how users feel about starting, privacy explanations, and leaving, so Minsi's entry, copy, and safety hints can improve.", icon: "sparkle" },
        { title: "How to participate", body: "You may choose an anonymous survey, prototype trial, or short interview. Participation is voluntary, and you can skip any question or leave anytime.", icon: "comment" },
        { title: "How feedback is used", body: "Feedback is only used to improve product experience and safety boundaries. Minsi does not save chat content, clears it when you leave, and does not track your expression long-term.", icon: "shield" }
      ],
      suitableItems: ["People trying Minsi", "People concerned about privacy and expression safety", "People who want to comment on UI, entry, or copy", "Teen caregivers, educators, or product experience participants"]
    },
    feedback: {
      title: "Anonymous Feedback",
      filterLabel: "Feedback categories",
      updating: "Updating",
      carouselLabel: "Anonymous feedback carousel",
      dotsLabel: "Switch anonymous feedback cards",
      viewPrefix: "View ",
      viewSuffix: " feedback",
      expand: "Expand",
      more: "See more feedback",
      anonymousRegion: "Anonymous",
      anonymousTag: "Anonymous feedback",
      filters: ["All", "No records", "Emotional expression", "Feeling understood", "Voice chat", "Exam stress", "Other"],
      ratingLabels: {
        very: "Very helpful",
        some: "Somewhat helpful",
        unsure: "Not sure yet"
      },
      typeLabels: {
        "不保存记录": "No records",
        "隐私安全": "Privacy and safety",
        "考试压力": "Exam stress",
        "被理解": "Feeling understood",
        "情绪表达": "Emotional expression",
        "语音聊天": "Voice chat",
        "其他": "Other"
      }
    },
    city: {
      title: "Where Voices Come From",
      body: "Regions are only shown at the city level to understand product experience across environments.",
      notice: "All content is reviewed and displayed anonymously. You can request deletion of feedback you voluntarily submitted."
    },
    share: {
      title: "Want to share your thoughts?",
      privacy: "Participation is voluntary, and you can leave anytime. Minsi does not save chat content and clears it when you leave; feedback you submit is only used to improve product experience and safety explanations.",
      safetyText: "Minsi does not save your conversations and is not a doctor or therapist. If you are in danger, contact a trusted adult or qualified professional.",
      feedbackLabel: "Your feedback",
      placeholder: "Write what using Minsi felt like. A few sentences are enough...",
      experienceLegend: "What matters most to you? (Select any)",
      ratingLegend: "Was Minsi helpful?",
      submitting: "Submitting",
      submit: "Submit anonymously",
      emptyError: "Please write your feedback first.",
      tooLongError: "You can enter up to {max} characters.",
      success: "Submitted. It will only appear anonymously after review.",
      errors: {
        unauthorized: "Please log in before submitting anonymous feedback.",
        rateLimited: "Too many submissions. Please try again later.",
        badRequest: "Please check your feedback and submit again.",
        fallback: "Submission failed. Please try again later."
      },
      experienceOptions: [
        { value: "不保存记录", label: "No records" },
        { value: "隐私安全", label: "Privacy and safety" },
        { value: "考试压力", label: "Exam stress" },
        { value: "被理解", label: "Feeling understood" },
        { value: "情绪表达", label: "Emotional expression" },
        { value: "语音聊天", label: "Voice chat" },
        { value: "其他", label: "Other" }
      ],
      ratingOptions: [
        { value: "very", label: "Very helpful" },
        { value: "some", label: "Somewhat helpful" },
        { value: "unsure", label: "Not sure yet" }
      ]
    }
  }
} as const;

export type ResearchMessages = (typeof researchMessages)[MinsiLang];
