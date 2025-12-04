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
        registry.addEndpoint("/ws")
                .addInterceptors(jwtInterceptor)
                .setAllowedOrigins("http://localhost:5173", "http://localhost:5174")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // keep only if you need fallback

        // FOR REACT NATIVE STOMP (better)
        registry.addEndpoint("/ws")
                .addInterceptors(jwtInterceptor)
                .setAllowedOrigins("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
