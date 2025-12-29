package com.chat.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.chat.demo.data.dto.UploadResponse;
import com.chat.demo.data.service.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private static final long CHUNK_SIZE = 1024 * 1024; // 1MB chunks

    @Autowired
    private FileService fileService;

    @GetMapping("/{chatId}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String chatId,
            @PathVariable String filename,
            @RequestHeader(value = "Range", required = false) String rangeHeader,
            HttpServletRequest request) {
        
        try {
            Resource resource = fileService.loadFileAsResource(chatId, filename);
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determina content type
            String contentType = request.getServletContext()
                .getMimeType(resource.getFile().getAbsolutePath());
            
            if (contentType == null) {
                contentType = Files.probeContentType(resource.getFile().toPath());
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            }

            long fileSize = resource.getFile().length();

            // Per i video, SEMPRE gestisci con range (anche senza header Range)
            if (contentType.startsWith("video/")) {
                return handleVideoRequest(resource, rangeHeader, contentType, fileSize);
            }

            // Per immagini e altri file, response normale
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "inline; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                .body(resource);
                
        } catch (IOException e) {
            logger.error("Errore nel servire il file {}/{}: {}", chatId, filename, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<Resource> handleVideoRequest(Resource resource, String rangeHeader, String contentType, long fileSize) {
        try {
            long start = 0;
            long end = fileSize - 1;

            // Se è presente l'header Range, parsalo
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                try {
                    List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
                    if (!ranges.isEmpty()) {
                        HttpRange range = ranges.get(0);
                        start = range.getRangeStart(fileSize);
                        end = range.getRangeEnd(fileSize);
                    }
                } catch (Exception e) {
                    logger.warn("Errore parsing Range header: {}", e.getMessage());
                    // Continua con range completo
                }
            }

            long contentLength = end - start + 1;

            // Crea InputStream per il range
            RandomAccessFile randomAccessFile = new RandomAccessFile(resource.getFile(), "r");
            randomAccessFile.seek(start);
            
            InputStream inputStream = new BoundedInputStream(
                new RandomAccessFileInputStream(randomAccessFile), 
                contentLength
            );

            InputStreamResource rangeResource = new InputStreamResource(inputStream) {
                @Override
                public long contentLength() {
                    return contentLength;
                }
                
                @Override
                public String getFilename() {
                    return resource.getFilename();
                }
            };

            HttpStatus status = (rangeHeader != null) ? HttpStatus.PARTIAL_CONTENT : HttpStatus.OK;

            ResponseEntity.BodyBuilder builder = ResponseEntity.status(status)
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "inline; filename=\"" + resource.getFilename() + "\"");

            // Aggiungi Content-Range solo per 206
            if (status == HttpStatus.PARTIAL_CONTENT) {
                builder.header(HttpHeaders.CONTENT_RANGE, 
                    "bytes " + start + "-" + end + "/" + fileSize);
            }

            return builder.body(rangeResource);

        } catch (Exception e) {
            logger.error("Errore nella gestione video request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatId") String chatId,
            HttpServletRequest request) {
        
        try {
            // Validazione parametri
            if (chatId == null || chatId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new UploadResponse(false, "Chat ID richiesto", null));
            }

            // Validazione file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new UploadResponse(false, "File vuoto o non presente", null));
            }

            // Controllo nome file
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new UploadResponse(false, "Nome file non valido", null));
            }

            // Controllo tipo file
            String contentType = file.getContentType();
            if (!fileService.isValidFileType(contentType)) {
                return ResponseEntity.badRequest()
                    .body(new UploadResponse(false, 
                        "Tipo file non supportato: " + contentType, null));
            }

            // Controllo dimensione (100MB)
            long maxSize = 100 * 1024 * 1024; // 100MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                    .body(new UploadResponse(false, 
                        String.format("File troppo grande (max %dMB)", maxSize / (1024 * 1024)), 
                        null));
            }

            // Salva il file
            String fileUrl = fileService.saveFile(file, chatId);
            
            // Risposta con dati completi per il frontend
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("url", fileUrl);
            responseData.put("type", contentType);
            responseData.put("fileName", originalFilename);
            responseData.put("fileSize", file.getSize());
            
            return ResponseEntity.ok(
                new UploadResponse(true, "Upload completato con successo", responseData)
            );

        } catch (IOException e) {
            logger.error("Errore storage durante upload file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new UploadResponse(false, "Errore nel salvataggio del file", null));
                
        } catch (SecurityException e) {
            logger.error("Errore sicurezza durante upload file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new UploadResponse(false, "File non autorizzato", null));
                
        } catch (Exception e) {
            logger.error("Errore generico durante upload file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new UploadResponse(false, "Errore interno del server", null));
        }
    }

    // InputStream wrapper per RandomAccessFile
    private static class RandomAccessFileInputStream extends InputStream {
        private final RandomAccessFile file;

        public RandomAccessFileInputStream(RandomAccessFile file) {
            this.file = file;
        }

        @Override
        public int read() throws IOException {
            return file.read();
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            return file.read(b, off, len);
        }

        @Override
        public void close() throws IOException {
            file.close();
        }

        @Override
        public int available() throws IOException {
            return (int) Math.min(file.length() - file.getFilePointer(), Integer.MAX_VALUE);
        }
    }

    // InputStream che limita il numero di bytes letti
    private static class BoundedInputStream extends InputStream {
        private final InputStream inputStream;
        private long remaining;

        public BoundedInputStream(InputStream inputStream, long maxBytes) {
            this.inputStream = inputStream;
            this.remaining = maxBytes;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int result = inputStream.read();
            if (result != -1) {
                remaining--;
            }
            return result;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            len = (int) Math.min(len, remaining);
            int result = inputStream.read(b, off, len);
            if (result > 0) {
                remaining -= result;
            }
            return result;
        }

        @Override
        public void close() throws IOException {
            inputStream.close();
        }

        @Override
        public int available() throws IOException {
            return (int) Math.min(remaining, inputStream.available());
        }
    }
}