package ai.minsi.service;

import ai.minsi.dto.safety.SafetyResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SafetyResourceService {

    private static final String PLACEHOLDER_CONTACT = "PLACEHOLDER_DO_NOT_DEPLOY";
    private static final String NEEDS_HUMAN_VERIFICATION = "NEEDS_HUMAN_VERIFICATION";

    private final Resource resource;
    private volatile Map<String, List<SafetyResourceResponse>> cachedResources;

    public SafetyResourceService(ResourceLoader resourceLoader) {
        this.resource = resourceLoader.getResource("classpath:safety/safety-resources.yml");
    }

    public List<SafetyResourceResponse> list(String lang) {
        Map<String, List<SafetyResourceResponse>> resources = loadResources();
        String normalizedLang = normalizeLang(lang);
        return resources.getOrDefault(normalizedLang, resources.getOrDefault("zh", List.of()));
    }

    private Map<String, List<SafetyResourceResponse>> loadResources() {
        Map<String, List<SafetyResourceResponse>> snapshot = cachedResources;
        if (snapshot != null) {
            return snapshot;
        }

        synchronized (this) {
            if (cachedResources == null) {
                cachedResources = readResources();
            }
            return cachedResources;
        }
    }

    private Map<String, List<SafetyResourceResponse>> readResources() {
        try (InputStream inputStream = resource.getInputStream()) {
            Object loaded = new Yaml().load(inputStream);
            if (!(loaded instanceof Map<?, ?> root)) {
                return Map.of();
            }

            return Map.of(
                    "zh", readResourceList(root.get("zh")),
                    "en", readResourceList(root.get("en"))
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Safety resources are not available.");
        }
    }

    private List<SafetyResourceResponse> readResourceList(Object value) {
        if (!(value instanceof List<?> items)) {
            return List.of();
        }

        return items.stream()
                .filter(Map.class::isInstance)
                .map(item -> readResource((Map<?, ?>) item))
                .toList();
    }

    private SafetyResourceResponse readResource(Map<?, ?> item) {
        SafetyResourceResponse resource = new SafetyResourceResponse(
                readString(item, "id"),
                readString(item, "name"),
                readContact(item),
                readString(item, "available"),
                readString(item, "disclaimer")
        );

        if (!isAllowedPlaceholderResource(resource)) {
            throw new IllegalStateException("Only placeholder safety resources are allowed before human verification.");
        }

        return resource;
    }

    private String readString(Map<?, ?> item, String key) {
        Object value = item.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String readContact(Map<?, ?> item) {
        String contact = readString(item, "contact");
        return contact.isEmpty() ? readString(item, "phone") : contact;
    }

    private boolean isAllowedPlaceholderResource(SafetyResourceResponse resource) {
        return PLACEHOLDER_CONTACT.equals(resource.contact())
                && NEEDS_HUMAN_VERIFICATION.equals(resource.available());
    }

    private String normalizeLang(String lang) {
        String normalized = lang == null ? "zh" : lang.trim().toLowerCase(Locale.ROOT);
        return "en".equals(normalized) ? "en" : "zh";
    }
}
