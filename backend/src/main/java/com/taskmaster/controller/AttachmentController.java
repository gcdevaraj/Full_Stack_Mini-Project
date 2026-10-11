package com.taskmaster.controller;

import com.taskmaster.model.Attachment;
import com.taskmaster.model.Task;
import com.taskmaster.repository.AttachmentRepository;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.service.FileStorageService;
import com.taskmaster.service.NotificationService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public AttachmentController(AttachmentRepository attachmentRepository,
                                TaskRepository taskRepository,
                                FileStorageService fileStorageService,
                                NotificationService notificationService) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Attachment> getAttachments(@RequestParam Long taskId) {
        return attachmentRepository.findByTaskIdOrderByUploadedAtDesc(taskId);
    }

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadFile(@RequestParam("file") MultipartFile file,
                                                 @RequestParam("taskId") Long taskId,
                                                 @RequestParam(value = "uploadedBy", defaultValue = "Alex Morgan") String uploadedBy) {
        try {
            String storedFileName = fileStorageService.storeFile(file);
            String downloadUrl = "/api/attachments/download/" + storedFileName;

            Attachment attachment = new Attachment(
                    taskId,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    downloadUrl,
                    storedFileName,
                    uploadedBy
            );

            Attachment saved = attachmentRepository.save(attachment);

            Long projectId = taskRepository.findById(taskId)
                    .map(Task::getProjectId)
                    .orElse(null);

            notificationService.broadcast("ATTACHMENT_ADDED", "ATTACHMENT", saved.getId(), projectId, saved,
                    uploadedBy + " uploaded " + saved.getFileName());

            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentRepository.findById(id).ifPresent(att -> {
            Long projectId = taskRepository.findById(att.getTaskId())
                    .map(Task::getProjectId)
                    .orElse(null);
            attachmentRepository.deleteById(id);
            notificationService.broadcast("ATTACHMENT_DELETED", "ATTACHMENT", id, projectId, null, "Attachment removed: " + att.getFileName());
        });
        return ResponseEntity.noContent().build();
    }
}
