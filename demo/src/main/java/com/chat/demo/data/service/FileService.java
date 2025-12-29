
package com.chat.demo.data.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FileService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private final Logger logger = LoggerFactory.getLogger(FileService.class);
    
    // Mappa per MIME types specifici
    private static final Map<String, String> EXTENSION_TO_MIME = new HashMap<>();
    
    static {
        // Video formats
        EXTENSION_TO_MIME.put(".mp4", "video/mp4");
        EXTENSION_TO_MIME.put(".webm", "video/webm");
        EXTENSION_TO_MIME.put(".mov", "video/quicktime");
        EXTENSION_TO_MIME.put(".avi", "video/x-msvideo");
        EXTENSION_TO_MIME.put(".mkv", "video/x-matroska");
        
        // Image formats
        EXTENSION_TO_MIME.put(".jpg", "image/jpeg");
        EXTENSION_TO_MIME.put(".jpeg", "image/jpeg");
        EXTENSION_TO_MIME.put(".png", "image/png");
        EXTENSION_TO_MIME.put(".gif", "image/gif");
        EXTENSION_TO_MIME.put(".webp", "image/webp");
    }

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);

            // Crea directory se non esiste
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Directory upload creata: {}", uploadPath.toAbsolutePath());
            } else {
                logger.info("Directory upload esistente: {}", uploadPath.toAbsolutePath());
            }

            // Verifica permessi di scrittura
            if (!Files.isWritable(uploadPath)) {
                throw new RuntimeException("Directory upload non scrivibile: " + uploadPath.toAbsolutePath());
            }

        } catch (IOException e) {
            logger.error("Errore creazione directory upload: {}", uploadDir, e);
            throw new RuntimeException("Impossibile creare directory upload: " + uploadDir, e);
        }
    }

    public String saveFile(MultipartFile file, String chatId) throws IOException {
        // Genera nome file unico mantenendo l'estensione originale
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String filename = UUID.randomUUID().toString() + extension;

        // Crea struttura directory per chat
        Path chatDir = Paths.get(uploadDir, chatId);
        Files.createDirectories(chatDir);

        // Salva file
        Path filePath = chatDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        logger.info("File salvato: {} -> {}", originalFilename, filePath.toAbsolutePath());

        // Ritorna URL accessibile
        return baseUrl + "/files/" + chatId + "/" + filename;
    }

    // Endpoint per servire i file
    public Resource loadFileAsResource(String chatId, String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, chatId, filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            logger.debug("Servendo file: {}", filePath.toAbsolutePath());
            return resource;
        } else {
            logger.warn("File non trovato o non leggibile: {}", filePath.toAbsolutePath());
            throw new FileNotFoundException("File non trovato: " + filename);
        }
    }

    public boolean isValidFileType(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        return contentType.startsWith("image/") || 
               contentType.startsWith("video/");
    }
    
    // Metodo per ottenere il MIME type corretto basato sull'estensione
    public String getMimeType(String filename) {
        if (filename == null) {
            return "application/octet-stream";
        }
        
        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        }
        
        return EXTENSION_TO_MIME.getOrDefault(extension, "application/octet-stream");
    }
    
    // Metodo per validare estensioni specifiche
    public boolean isValidExtension(String filename) {
        if (filename == null) {
            return false;
        }
        
        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        }
        
        return EXTENSION_TO_MIME.containsKey(extension);
    }
}