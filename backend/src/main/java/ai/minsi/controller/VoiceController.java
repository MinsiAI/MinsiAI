package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.voice.VoiceSessionResponse;
import ai.minsi.dto.voice.VoiceTranscribeRequest;
import ai.minsi.dto.voice.VoiceTranscribeResponse;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.service.VoiceService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceService voiceService;

    public VoiceController(VoiceService voiceService) {
        this.voiceService = voiceService;
    }

    @PostMapping("/session")
    public ApiResponse<VoiceSessionResponse> createSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(name = "realtime", defaultValue = "true") boolean realtime
    ) {
        return ApiResponse.success(voiceService.createSession(currentUser, realtime));
    }

    @PostMapping(value = "/transcribe", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<VoiceTranscribeResponse> transcribe(
            @Valid @RequestBody VoiceTranscribeRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser
    ) {
        return ApiResponse.success(voiceService.transcribe(currentUser, request));
    }

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VoiceTranscribeResponse> transcribeAudio(
            @RequestPart("voiceToken") String voiceToken,
            @RequestPart("audio") MultipartFile audio,
            @AuthenticationPrincipal AuthenticatedUser currentUser
    ) {
        return ApiResponse.success(voiceService.transcribe(currentUser, voiceToken, audio));
    }
}
