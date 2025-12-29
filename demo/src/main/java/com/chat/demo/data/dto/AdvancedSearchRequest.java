package com.chat.demo.data.dto;

public class AdvancedSearchRequest {
    private String searchTerm;
    private String currentUserId;
    private boolean excludeFriends = false;
    private Integer limit;
    
    // Constructors
    public AdvancedSearchRequest() {}
    
    // Getters and Setters
    public String getSearchTerm() {
        return searchTerm;
    }
    
    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }
    
    public String getCurrentUserId() {
        return currentUserId;
    }
    
    public void setCurrentUserId(String currentUserId) {
        this.currentUserId = currentUserId;
    }
    
    public boolean isExcludeFriends() {
        return excludeFriends;
    }
    
    public void setExcludeFriends(boolean excludeFriends) {
        this.excludeFriends = excludeFriends;
    }
    
    public Integer getLimit() {
        return limit;
    }
    
    public void setLimit(Integer limit) {
        this.limit = limit;
    }

}
