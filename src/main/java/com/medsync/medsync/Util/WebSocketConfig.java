package com.medsync.medsync.Util;

import com.medsync.medsync.filter.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtInterceptor;

    public WebSocketConfig(JwtHandshakeInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Public endpoint (no JWT required)
        registry.addEndpoint("/ws/public")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Private endpoint (JWT required)
        registry.addEndpoint("/ws/private")
                .addInterceptors(jwtInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Separate topics for public and private
        registry.enableSimpleBroker("/topic/public", "/topic/private", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
