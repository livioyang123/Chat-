package com.chat.demo.data.dto;

public class FileUploadResult {
        private String url;
        private String fileName;
        private String contentType;
        private long size;

        // Constructors, getters e setters
        public FileUploadResult(String url, String fileName, String contentType, long size) {
            this.url = url;
            this.fileName = fileName;
            this.contentType = contentType;
            this.size = size;
        }

        

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        
        public long getSize() { return size; }
        public void setSize(long size) { this.size = size; }
    }