package ai.minsi.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Objects;

@Component
public class HashUtils {

    private final String hashSalt;

    public HashUtils(@Value("${minsi.security.hash-salt:}") String hashSalt) {
        this.hashSalt = hashSalt;
    }

    public String sha256WithConfiguredSalt(String value) {
        return sha256WithSalt(value, hashSalt);
    }

    public static String sha256WithSalt(String value, String salt) {
        Objects.requireNonNull(value, "value is required.");
        if (!StringUtils.hasText(salt)) {
            throw new IllegalStateException("HASH_SALT must be configured.");
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((value + salt).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.");
        }
    }

    public static boolean constantTimeEquals(String first, String second) {
        if (first == null || second == null) {
            return false;
        }
        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }
}
