package ai.minsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import java.util.List;

@ConfigurationProperties(prefix = "minsi")
public class MinsiProperties {

    private final Ai ai = new Ai();
    private final App app = new App();
    private final Mail mail = new Mail();
    private final OAuth oauth = new OAuth();
    private final Security security = new Security();

    public Ai getAi() {
        return ai;
    }

    public App getApp() {
        return app;
    }

    public Mail getMail() {
        return mail;
    }

    public OAuth getOauth() {
        return oauth;
    }

    public Security getSecurity() {
        return security;
    }

    public static class Ai {
        private static final String DEFAULT_PROVIDER = "openai";
        private static final String DEFAULT_MODEL = "gpt-5.6-terra";
        private static final String DEFAULT_OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
        private static final String DEFAULT_OPENAI_COMPATIBLE_ENDPOINT = "https://api.openai.com/v1/chat/completions";
        private static final String DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
        private static final String DEFAULT_ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
        private static final String DEFAULT_VOICE_TRANSCRIPTION_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
        private static final String DEFAULT_VOICE_SPEECH_ENDPOINT = "https://api.openai.com/v1/audio/speech";
        private static final String DEFAULT_VOICE_REALTIME_ENDPOINT = "https://api.openai.com/v1/realtime/client_secrets";

        private String provider = DEFAULT_PROVIDER;
        private String apiKey;
        private String model = DEFAULT_MODEL;
        private String endpoint;
        private int maxTokens = ChatConstants.CHAT_MAX_OUTPUT_TOKENS;
        private String reasoningEffort = "none";
        private int connectTimeoutMs = 5000;
        private int readTimeoutMs = 30000;
        private String anthropicApiKey;
        private String anthropicModel = DEFAULT_ANTHROPIC_MODEL;
        private String anthropicEndpoint = DEFAULT_ANTHROPIC_ENDPOINT;
        private int anthropicMaxTokens = ChatConstants.CHAT_MAX_OUTPUT_TOKENS;
        private int anthropicConnectTimeoutMs = 5000;
        private int anthropicReadTimeoutMs = 30000;
        private String voiceTranscriptionProvider = DEFAULT_PROVIDER;
        private String voiceTranscriptionModel = "gpt-4o-mini-transcribe";
        private String voiceTranscriptionEndpoint = DEFAULT_VOICE_TRANSCRIPTION_ENDPOINT;
        private String voiceSpeechProvider = DEFAULT_PROVIDER;
        private String voiceSpeechModel = "gpt-4o-mini-tts";
        private String voiceSpeechVoice = "marin";
        private String voiceSpeechInstructions = "Use a light, clear, bright Mandarin female voice with a calm companion tone. Speak at a natural conversational pace with subtle variation, slightly brisk without rushing, keep sentences complete, avoid long dramatic pauses, and avoid a mature announcer style, flirtatious, childish, exaggerated, or overly adult delivery.";
        private String voiceSpeechFormat = "mp3";
        private double voiceSpeechSpeed = 1.06;
        private String voiceSpeechEndpoint = DEFAULT_VOICE_SPEECH_ENDPOINT;
        private int voiceSpeechConnectTimeoutMs = 5000;
        private int voiceSpeechReadTimeoutMs = 30000;
        private String voiceRealtimeProvider = DEFAULT_PROVIDER;
        private String voiceRealtimeModel = "gpt-realtime-2.1-mini";
        private String voiceRealtimeVoice = "marin";
        private String voiceRealtimeReasoningEffort = "low";
        private double voiceRealtimeSpeed = 1.06;
        private int voiceRealtimeClientSecretTtlSeconds = 600;
        private String voiceRealtimeEndpoint = DEFAULT_VOICE_REALTIME_ENDPOINT;

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }

        public int getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(int maxTokens) {
            this.maxTokens = maxTokens;
        }

        public String getReasoningEffort() {
            return reasoningEffort;
        }

        public void setReasoningEffort(String reasoningEffort) {
            this.reasoningEffort = reasoningEffort;
        }

        public int getConnectTimeoutMs() {
            return connectTimeoutMs;
        }

        public void setConnectTimeoutMs(int connectTimeoutMs) {
            this.connectTimeoutMs = connectTimeoutMs;
        }

        public int getReadTimeoutMs() {
            return readTimeoutMs;
        }

        public void setReadTimeoutMs(int readTimeoutMs) {
            this.readTimeoutMs = readTimeoutMs;
        }

        public String getAnthropicApiKey() {
            return anthropicApiKey;
        }

        public void setAnthropicApiKey(String anthropicApiKey) {
            this.anthropicApiKey = anthropicApiKey;
        }

        public String getAnthropicModel() {
            return anthropicModel;
        }

        public void setAnthropicModel(String anthropicModel) {
            this.anthropicModel = anthropicModel;
        }

        public String getAnthropicEndpoint() {
            return anthropicEndpoint;
        }

        public void setAnthropicEndpoint(String anthropicEndpoint) {
            this.anthropicEndpoint = anthropicEndpoint;
        }

        public int getAnthropicMaxTokens() {
            return anthropicMaxTokens;
        }

        public void setAnthropicMaxTokens(int anthropicMaxTokens) {
            this.anthropicMaxTokens = anthropicMaxTokens;
        }

        public int getAnthropicConnectTimeoutMs() {
            return anthropicConnectTimeoutMs;
        }

        public void setAnthropicConnectTimeoutMs(int anthropicConnectTimeoutMs) {
            this.anthropicConnectTimeoutMs = anthropicConnectTimeoutMs;
        }

        public int getAnthropicReadTimeoutMs() {
            return anthropicReadTimeoutMs;
        }

        public void setAnthropicReadTimeoutMs(int anthropicReadTimeoutMs) {
            this.anthropicReadTimeoutMs = anthropicReadTimeoutMs;
        }

        public String getVoiceTranscriptionProvider() {
            return voiceTranscriptionProvider;
        }

        public void setVoiceTranscriptionProvider(String voiceTranscriptionProvider) {
            this.voiceTranscriptionProvider = voiceTranscriptionProvider;
        }

        public String getVoiceTranscriptionModel() {
            return voiceTranscriptionModel;
        }

        public void setVoiceTranscriptionModel(String voiceTranscriptionModel) {
            this.voiceTranscriptionModel = voiceTranscriptionModel;
        }

        public String getVoiceTranscriptionEndpoint() {
            return voiceTranscriptionEndpoint;
        }

        public void setVoiceTranscriptionEndpoint(String voiceTranscriptionEndpoint) {
            this.voiceTranscriptionEndpoint = voiceTranscriptionEndpoint;
        }

        public String getVoiceSpeechProvider() {
            return voiceSpeechProvider;
        }

        public void setVoiceSpeechProvider(String voiceSpeechProvider) {
            this.voiceSpeechProvider = voiceSpeechProvider;
        }

        public String getVoiceSpeechModel() {
            return voiceSpeechModel;
        }

        public void setVoiceSpeechModel(String voiceSpeechModel) {
            this.voiceSpeechModel = voiceSpeechModel;
        }

        public String getVoiceSpeechVoice() {
            return voiceSpeechVoice;
        }

        public void setVoiceSpeechVoice(String voiceSpeechVoice) {
            this.voiceSpeechVoice = voiceSpeechVoice;
        }

        public String getVoiceSpeechInstructions() {
            return voiceSpeechInstructions;
        }

        public void setVoiceSpeechInstructions(String voiceSpeechInstructions) {
            this.voiceSpeechInstructions = voiceSpeechInstructions;
        }

        public String getVoiceSpeechFormat() {
            return voiceSpeechFormat;
        }

        public void setVoiceSpeechFormat(String voiceSpeechFormat) {
            this.voiceSpeechFormat = voiceSpeechFormat;
        }

        public double getVoiceSpeechSpeed() {
            return voiceSpeechSpeed;
        }

        public void setVoiceSpeechSpeed(double voiceSpeechSpeed) {
            this.voiceSpeechSpeed = voiceSpeechSpeed;
        }

        public String getVoiceSpeechEndpoint() {
            return voiceSpeechEndpoint;
        }

        public void setVoiceSpeechEndpoint(String voiceSpeechEndpoint) {
            this.voiceSpeechEndpoint = voiceSpeechEndpoint;
        }

        public int getVoiceSpeechConnectTimeoutMs() {
            return voiceSpeechConnectTimeoutMs;
        }

        public void setVoiceSpeechConnectTimeoutMs(int voiceSpeechConnectTimeoutMs) {
            this.voiceSpeechConnectTimeoutMs = voiceSpeechConnectTimeoutMs;
        }

        public int getVoiceSpeechReadTimeoutMs() {
            return voiceSpeechReadTimeoutMs;
        }

        public void setVoiceSpeechReadTimeoutMs(int voiceSpeechReadTimeoutMs) {
            this.voiceSpeechReadTimeoutMs = voiceSpeechReadTimeoutMs;
        }

        public String getVoiceRealtimeProvider() {
            return voiceRealtimeProvider;
        }

        public void setVoiceRealtimeProvider(String voiceRealtimeProvider) {
            this.voiceRealtimeProvider = voiceRealtimeProvider;
        }

        public String getVoiceRealtimeModel() {
            return voiceRealtimeModel;
        }

        public void setVoiceRealtimeModel(String voiceRealtimeModel) {
            this.voiceRealtimeModel = voiceRealtimeModel;
        }

        public String getVoiceRealtimeVoice() {
            return voiceRealtimeVoice;
        }

        public void setVoiceRealtimeVoice(String voiceRealtimeVoice) {
            this.voiceRealtimeVoice = voiceRealtimeVoice;
        }

        public String getVoiceRealtimeReasoningEffort() {
            return voiceRealtimeReasoningEffort;
        }

        public void setVoiceRealtimeReasoningEffort(String voiceRealtimeReasoningEffort) {
            this.voiceRealtimeReasoningEffort = voiceRealtimeReasoningEffort;
        }

        public double getVoiceRealtimeSpeed() {
            return voiceRealtimeSpeed;
        }

        public void setVoiceRealtimeSpeed(double voiceRealtimeSpeed) {
            this.voiceRealtimeSpeed = voiceRealtimeSpeed;
        }

        public int getVoiceRealtimeClientSecretTtlSeconds() {
            return voiceRealtimeClientSecretTtlSeconds;
        }

        public void setVoiceRealtimeClientSecretTtlSeconds(int voiceRealtimeClientSecretTtlSeconds) {
            this.voiceRealtimeClientSecretTtlSeconds = voiceRealtimeClientSecretTtlSeconds;
        }

        public String getVoiceRealtimeEndpoint() {
            return voiceRealtimeEndpoint;
        }

        public void setVoiceRealtimeEndpoint(String voiceRealtimeEndpoint) {
            this.voiceRealtimeEndpoint = voiceRealtimeEndpoint;
        }

        public String normalizedProvider() {
            if (!StringUtils.hasText(provider)) {
                return DEFAULT_PROVIDER;
            }
            return provider.trim().toLowerCase();
        }

        public String normalizedApiKey() {
            return StringUtils.hasText(apiKey) ? apiKey.trim() : "";
        }

        public String normalizedModel() {
            if (!StringUtils.hasText(model)) {
                return DEFAULT_MODEL;
            }
            return model.trim();
        }

        public String normalizedEndpoint(String provider) {
            if (StringUtils.hasText(endpoint)) {
                return endpoint.trim();
            }
            if ("openai-compatible".equals(provider)) {
                return DEFAULT_OPENAI_COMPATIBLE_ENDPOINT;
            }
            return DEFAULT_OPENAI_ENDPOINT;
        }

        public int normalizedMaxTokens() {
            return maxTokens > 0 ? maxTokens : ChatConstants.CHAT_MAX_OUTPUT_TOKENS;
        }

        public String normalizedReasoningEffort() {
            if (!StringUtils.hasText(reasoningEffort)) {
                return "none";
            }

            String normalized = reasoningEffort.trim().toLowerCase();
            return switch (normalized) {
                case "none", "minimal", "low", "medium", "high", "xhigh" -> normalized;
                default -> "none";
            };
        }

        public int normalizedConnectTimeoutMs() {
            return connectTimeoutMs > 0 ? connectTimeoutMs : 5000;
        }

        public int normalizedReadTimeoutMs() {
            return readTimeoutMs > 0 ? readTimeoutMs : 30000;
        }

        public String normalizedAnthropicModel() {
            if (!StringUtils.hasText(anthropicModel)) {
                return DEFAULT_ANTHROPIC_MODEL;
            }
            return anthropicModel.trim();
        }

        public String normalizedAnthropicEndpoint() {
            if (!StringUtils.hasText(anthropicEndpoint)) {
                return DEFAULT_ANTHROPIC_ENDPOINT;
            }
            return anthropicEndpoint.trim();
        }

        public int normalizedAnthropicMaxTokens() {
            return anthropicMaxTokens > 0 ? anthropicMaxTokens : ChatConstants.CHAT_MAX_OUTPUT_TOKENS;
        }

        public int normalizedAnthropicConnectTimeoutMs() {
            return anthropicConnectTimeoutMs > 0 ? anthropicConnectTimeoutMs : 5000;
        }

        public int normalizedAnthropicReadTimeoutMs() {
            return anthropicReadTimeoutMs > 0 ? anthropicReadTimeoutMs : 30000;
        }

        public String normalizedVoiceTranscriptionProvider() {
            if (!StringUtils.hasText(voiceTranscriptionProvider)) {
                return DEFAULT_PROVIDER;
            }
            return voiceTranscriptionProvider.trim().toLowerCase();
        }

        public String normalizedVoiceTranscriptionModel() {
            if (!StringUtils.hasText(voiceTranscriptionModel)) {
                return "gpt-4o-mini-transcribe";
            }
            return voiceTranscriptionModel.trim();
        }

        public String normalizedVoiceTranscriptionEndpoint() {
            if (!StringUtils.hasText(voiceTranscriptionEndpoint)) {
                return DEFAULT_VOICE_TRANSCRIPTION_ENDPOINT;
            }
            return voiceTranscriptionEndpoint.trim();
        }

        public String normalizedVoiceSpeechProvider() {
            if (!StringUtils.hasText(voiceSpeechProvider)) {
                return DEFAULT_PROVIDER;
            }
            return voiceSpeechProvider.trim().toLowerCase();
        }

        public String normalizedVoiceSpeechModel() {
            if (!StringUtils.hasText(voiceSpeechModel)) {
                return "gpt-4o-mini-tts";
            }
            return voiceSpeechModel.trim();
        }

        public String normalizedVoiceSpeechVoice() {
            if (!StringUtils.hasText(voiceSpeechVoice)) {
                return "marin";
            }
            return voiceSpeechVoice.trim();
        }

        public String normalizedVoiceSpeechInstructions() {
            return StringUtils.hasText(voiceSpeechInstructions) ? voiceSpeechInstructions.trim() : "";
        }

        public String normalizedVoiceSpeechFormat() {
            if (!StringUtils.hasText(voiceSpeechFormat)) {
                return "mp3";
            }
            return voiceSpeechFormat.trim().toLowerCase();
        }

        public double normalizedVoiceSpeechSpeed() {
            return voiceSpeechSpeed >= 0.25 && voiceSpeechSpeed <= 4.0 ? voiceSpeechSpeed : 1.06;
        }

        public String normalizedVoiceSpeechEndpoint() {
            if (!StringUtils.hasText(voiceSpeechEndpoint)) {
                return DEFAULT_VOICE_SPEECH_ENDPOINT;
            }
            return voiceSpeechEndpoint.trim();
        }

        public int normalizedVoiceSpeechConnectTimeoutMs() {
            return voiceSpeechConnectTimeoutMs > 0 ? voiceSpeechConnectTimeoutMs : 5000;
        }

        public int normalizedVoiceSpeechReadTimeoutMs() {
            return voiceSpeechReadTimeoutMs > 0 ? voiceSpeechReadTimeoutMs : 30000;
        }

        public String normalizedVoiceRealtimeProvider() {
            if (!StringUtils.hasText(voiceRealtimeProvider)) {
                return DEFAULT_PROVIDER;
            }
            return voiceRealtimeProvider.trim().toLowerCase();
        }

        public String normalizedVoiceRealtimeModel() {
            if (!StringUtils.hasText(voiceRealtimeModel)) {
                return "gpt-realtime-2.1-mini";
            }
            return voiceRealtimeModel.trim();
        }

        public String normalizedVoiceRealtimeVoice() {
            if (!StringUtils.hasText(voiceRealtimeVoice)) {
                return "marin";
            }
            return voiceRealtimeVoice.trim().toLowerCase();
        }

        public String normalizedVoiceRealtimeReasoningEffort() {
            if (!StringUtils.hasText(voiceRealtimeReasoningEffort)) {
                return "low";
            }
            return voiceRealtimeReasoningEffort.trim().toLowerCase();
        }

        public double normalizedVoiceRealtimeSpeed() {
            if (voiceRealtimeSpeed < 0.25 || voiceRealtimeSpeed > 1.5) {
                return 1.06;
            }
            return voiceRealtimeSpeed;
        }

        public int normalizedVoiceRealtimeClientSecretTtlSeconds() {
            if (voiceRealtimeClientSecretTtlSeconds < 60 || voiceRealtimeClientSecretTtlSeconds > 600) {
                return 600;
            }
            return voiceRealtimeClientSecretTtlSeconds;
        }

        public String normalizedVoiceRealtimeEndpoint() {
            if (!StringUtils.hasText(voiceRealtimeEndpoint)) {
                return DEFAULT_VOICE_REALTIME_ENDPOINT;
            }
            return voiceRealtimeEndpoint.trim();
        }
    }

    public static class App {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private String cookieDomain;
        private boolean cookieSecure;

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins == null ? List.of() : allowedOrigins;
        }

        public String getCookieDomain() {
            return cookieDomain;
        }

        public void setCookieDomain(String cookieDomain) {
            this.cookieDomain = cookieDomain;
        }

        public boolean isCookieSecure() {
            return cookieSecure;
        }

        public void setCookieSecure(boolean cookieSecure) {
            this.cookieSecure = cookieSecure;
        }

        public List<String> requireAllowedOrigins() {
            List<String> origins = allowedOrigins.stream()
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .toList();

            if (origins.isEmpty()) {
                throw new IllegalStateException("ALLOWED_ORIGINS must be configured.");
            }

            if (origins.stream().anyMatch("*"::equals)) {
                throw new IllegalStateException("Wildcard CORS origins are not allowed.");
            }

            return origins;
        }
    }

    public static class Mail {
        private String smtpHost;
        private Integer smtpPort;
        private String smtpUsername;
        private String smtpPassword;
        private String smtpFromAddress;
        private String smtpFromName = "Minsi";
        private boolean smtpStartTlsEnabled = true;
        private boolean smtpSslEnabled;
        private int smtpConnectionTimeoutMs = 5000;
        private int smtpReadTimeoutMs = 5000;
        private int smtpWriteTimeoutMs = 5000;

        public String getSmtpHost() {
            return smtpHost;
        }

        public void setSmtpHost(String smtpHost) {
            this.smtpHost = smtpHost;
        }

        public Integer getSmtpPort() {
            return smtpPort;
        }

        public void setSmtpPort(Integer smtpPort) {
            this.smtpPort = smtpPort;
        }

        public String getSmtpUsername() {
            return smtpUsername;
        }

        public void setSmtpUsername(String smtpUsername) {
            this.smtpUsername = smtpUsername;
        }

        public String getSmtpPassword() {
            return smtpPassword;
        }

        public void setSmtpPassword(String smtpPassword) {
            this.smtpPassword = smtpPassword;
        }

        public String getSmtpFromAddress() {
            return smtpFromAddress;
        }

        public void setSmtpFromAddress(String smtpFromAddress) {
            this.smtpFromAddress = smtpFromAddress;
        }

        public String getSmtpFromName() {
            return smtpFromName;
        }

        public void setSmtpFromName(String smtpFromName) {
            this.smtpFromName = smtpFromName;
        }

        public boolean isSmtpStartTlsEnabled() {
            return smtpStartTlsEnabled;
        }

        public void setSmtpStartTlsEnabled(boolean smtpStartTlsEnabled) {
            this.smtpStartTlsEnabled = smtpStartTlsEnabled;
        }

        public boolean isSmtpSslEnabled() {
            return smtpSslEnabled;
        }

        public void setSmtpSslEnabled(boolean smtpSslEnabled) {
            this.smtpSslEnabled = smtpSslEnabled;
        }

        public int getSmtpConnectionTimeoutMs() {
            return smtpConnectionTimeoutMs;
        }

        public void setSmtpConnectionTimeoutMs(int smtpConnectionTimeoutMs) {
            this.smtpConnectionTimeoutMs = smtpConnectionTimeoutMs;
        }

        public int getSmtpReadTimeoutMs() {
            return smtpReadTimeoutMs;
        }

        public void setSmtpReadTimeoutMs(int smtpReadTimeoutMs) {
            this.smtpReadTimeoutMs = smtpReadTimeoutMs;
        }

        public int getSmtpWriteTimeoutMs() {
            return smtpWriteTimeoutMs;
        }

        public void setSmtpWriteTimeoutMs(int smtpWriteTimeoutMs) {
            this.smtpWriteTimeoutMs = smtpWriteTimeoutMs;
        }

        public String requireSmtpHost() {
            if (!StringUtils.hasText(smtpHost)) {
                throw new IllegalStateException("SMTP_HOST must be configured.");
            }
            return smtpHost.trim();
        }

        public int requireSmtpPort() {
            if (smtpPort == null || smtpPort <= 0) {
                throw new IllegalStateException("SMTP_PORT must be configured.");
            }
            return smtpPort;
        }

        public String requireSmtpUsername() {
            if (!StringUtils.hasText(smtpUsername)) {
                throw new IllegalStateException("SMTP_USERNAME must be configured.");
            }
            return smtpUsername.trim();
        }

        public String requireSmtpPassword() {
            if (!StringUtils.hasText(smtpPassword)) {
                throw new IllegalStateException("SMTP_PASSWORD must be configured.");
            }
            return smtpPassword;
        }

        public String requireSmtpFromAddress() {
            if (StringUtils.hasText(smtpFromAddress)) {
                return smtpFromAddress.trim();
            }
            return requireSmtpUsername();
        }

        public String normalizedSmtpFromName() {
            if (!StringUtils.hasText(smtpFromName)) {
                return "Minsi";
            }
            return smtpFromName.trim();
        }
    }

    public static class OAuth {
        private String callbackBaseUrl;
        private final Provider wechat = new Provider();
        private final Provider qq = new Provider();

        public String getCallbackBaseUrl() {
            return callbackBaseUrl;
        }

        public void setCallbackBaseUrl(String callbackBaseUrl) {
            this.callbackBaseUrl = callbackBaseUrl;
        }

        public Provider getWechat() {
            return wechat;
        }

        public Provider getQq() {
            return qq;
        }

        public String requireCallbackBaseUrl() {
            if (!StringUtils.hasText(callbackBaseUrl)) {
                throw new IllegalStateException("OAUTH_CALLBACK_BASE_URL must be configured.");
            }
            return callbackBaseUrl.replaceAll("/+$", "");
        }
    }

    public static class Provider {
        private String appId;
        private String appSecret;
        private String clientId;
        private String clientSecret;

        public String getAppId() {
            return appId;
        }

        public void setAppId(String appId) {
            this.appId = appId;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public void setClientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
        }

        public String requireAppId() {
            if (StringUtils.hasText(appId)) {
                return appId.trim();
            }
            if (StringUtils.hasText(clientId)) {
                return clientId.trim();
            }
            throw new IllegalStateException("OAuth client id must be configured.");
        }

        public String requireAppSecret() {
            if (StringUtils.hasText(appSecret)) {
                return appSecret.trim();
            }
            if (StringUtils.hasText(clientSecret)) {
                return clientSecret.trim();
            }
            throw new IllegalStateException("OAuth client secret must be configured.");
        }
    }

    public static class Security {
        private String hashSalt;

        public String getHashSalt() {
            return hashSalt;
        }

        public void setHashSalt(String hashSalt) {
            this.hashSalt = hashSalt;
        }
    }
}
