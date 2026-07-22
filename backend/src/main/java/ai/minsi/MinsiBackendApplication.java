package ai.minsi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@ConfigurationPropertiesScan
@MapperScan("ai.minsi.mapper")
public class MinsiBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MinsiBackendApplication.class, args);
    }
}
