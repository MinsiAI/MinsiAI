package ai.minsi.security;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AdminSessionAuthFilter adminSessionAuthFilter,
            SessionAuthFilter sessionAuthFilter,
            SecurityErrorHandler securityErrorHandler
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(securityErrorHandler)
                        .accessDeniedHandler(securityErrorHandler)
                )
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable())
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // The initial /api/chat request is authenticated before MVC starts its
                        // StreamingResponseBody. Async/error redispatches must not be treated as
                        // new anonymous requests after the SSE response has already been committed.
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/safety/resources").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/research/feedback").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/research/feedback/metrics").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/start").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/oauth/start").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/oauth/complete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/auth/email/start").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/auth/email/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/research/feedback").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/oauth/callback/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(adminSessionAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(sessionAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
