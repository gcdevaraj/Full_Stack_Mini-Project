package com.taskmaster.service;

import com.taskmaster.dto.WebSocketMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(String type, String entity, Long entityId, Long projectId, Object payload, String message) {
        WebSocketMessage wsMessage = new WebSocketMessage(type, entity, entityId, projectId, payload, message);
        try {
            // General channel for global notifications
            messagingTemplate.convertAndSend("/topic/updates", wsMessage);

            // Specific channel for the project (if applicable)
            if (projectId != null) {
                messagingTemplate.convertAndSend("/topic/projects/" + projectId, wsMessage);
            }
            logger.info("Broadcasted WebSocket event: {} for {} id={}", type, entity, entityId);
        } catch (Exception e) {
            logger.error("Failed to broadcast WebSocket message: {}", e.getMessage());
        }
    }
}
