package ai.minsi.service;

import ai.minsi.dto.safety.SafetyResourceResponse;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SafetyResourceServiceTest {

    @Test
    void listLoadsOnlyPlaceholderResourcesFromYaml() {
        SafetyResourceService service = new SafetyResourceService(resourceLoaderFor("""
                zh:
                  - id: cn-crisis-resource-placeholder
                    name: "待人工核实的本地危机支持资源"
                    contact: "PLACEHOLDER_DO_NOT_DEPLOY"
                    available: "NEEDS_HUMAN_VERIFICATION"
                    disclaimer: "上线前必须由人工核实资源名称、联系方式、适用地区和可用时间。"
                en:
                  - id: global-crisis-resource-placeholder
                    name: "Human-verified local crisis resource required"
                    contact: "PLACEHOLDER_DO_NOT_DEPLOY"
                    available: "NEEDS_HUMAN_VERIFICATION"
                    disclaimer: "Human verification is required before production use."
                """));

        List<SafetyResourceResponse> resources = service.list("zh");

        assertThat(resources).hasSize(1);
        assertThat(resources.get(0).id()).isEqualTo("cn-crisis-resource-placeholder");
        assertThat(resources.get(0).contact()).isEqualTo("PLACEHOLDER_DO_NOT_DEPLOY");
        assertThat(resources.get(0).available()).isEqualTo("NEEDS_HUMAN_VERIFICATION");
    }

    @Test
    void listSupportsEnglishAndFallsBackToChinese() {
        SafetyResourceService service = new SafetyResourceService(resourceLoaderFor("""
                zh:
                  - id: zh-placeholder
                    name: "待人工核实的本地危机支持资源"
                    phone: "PLACEHOLDER_DO_NOT_DEPLOY"
                    available: "NEEDS_HUMAN_VERIFICATION"
                    disclaimer: "上线前必须由人工核实。"
                en:
                  - id: en-placeholder
                    name: "Human-verified local crisis resource required"
                    contact: "PLACEHOLDER_DO_NOT_DEPLOY"
                    available: "NEEDS_HUMAN_VERIFICATION"
                    disclaimer: "Human verification is required before production use."
                """));

        assertThat(service.list("en").get(0).id()).isEqualTo("en-placeholder");
        assertThat(service.list("ja").get(0).id()).isEqualTo("zh-placeholder");
    }

    @Test
    void listRejectsNonPlaceholderResourcesBeforeHumanVerification() {
        SafetyResourceService service = new SafetyResourceService(resourceLoaderFor("""
                zh:
                  - id: unverified-resource
                    name: "Unverified local crisis resource"
                    contact: "UNVERIFIED_CONTACT"
                    available: "NEEDS_HUMAN_VERIFICATION"
                    disclaimer: "Human verification is required before production use."
                en: []
                """));

        assertThatThrownBy(() -> service.list("zh"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only placeholder safety resources are allowed");
    }

    private ResourceLoader resourceLoaderFor(String yaml) {
        return new ResourceLoader() {
            @Override
            public Resource getResource(String location) {
                return new ByteArrayResource(yaml.getBytes(StandardCharsets.UTF_8));
            }

            @Override
            public ClassLoader getClassLoader() {
                return Thread.currentThread().getContextClassLoader();
            }
        };
    }
}
