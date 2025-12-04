package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.UsermanagementDto.UserManagementDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final SimpMessagingTemplate messagingTemplate;

    public UserManagementController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Temporary in-memory list (real-time, empty at first)
    private final List<UserManagementDTO> users = new ArrayList<>();

    @GetMapping
    public List<UserManagementDTO> getAllUsers() {
        return users;
    }

    // Add user (for testing)
    @PostMapping("/add")
    public UserManagementDTO addUser(@RequestBody UserManagementDTO user) {
        users.add(user);
        broadcastUpdate();
        return user;
    }

    // VIEW user details
    @GetMapping("/{id}")
    public UserManagementDTO getUserById(@PathVariable Long id) {
        return users.stream()
                .filter(u -> u.id().equals(id))
                .findFirst()
                .orElse(null);
    }

    // UPDATE status (active / inactive)
    @PutMapping("/{id}/status")
    public UserManagementDTO updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        for (int i = 0; i < users.size(); i++) {
            UserManagementDTO u = users.get(i);

            if (u.id().equals(id)) {
                UserManagementDTO updated = new UserManagementDTO(
                        u.id(),
                        u.name(),
                        u.email(),
                        u.role(),
                        status,
                        u.avatarUrl()
                );
                users.set(i, updated);
                broadcastUpdate();
                return updated;
            }
        }
        return null;
    }

    private void broadcastUpdate() {
        messagingTemplate.convertAndSend(
                "/topic/users",
                new WebSocketMessage("users-update", users)
        );
    }

    public record WebSocketMessage(String type, Object data) {}
}
